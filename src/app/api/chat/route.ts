import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

import { getSiteContent, generateContentSummary } from "@/lib/content-indexer";
import { ASSISTANT, CHAT_LIMITS, CHAT_MODEL } from "@/lib/assistant";

/**
 * Assistant endpoint.
 *
 * Audit notes, since several things here were previously wrong:
 *
 * - The old prompt advertised tools ("use the search_content tool") that were
 *   never wired up — the route imported the schemas and then never passed them
 *   to streamText. The model duly claimed to run searches it had not run. The
 *   site's content is small enough to inline, so the fix is to ground the model
 *   in that content and drop the tool fiction entirely.
 * - Every request rebuilt the prompt from a fresh Supabase read. Now cached.
 * - Errors returned `error.message` to the browser, leaking internals.
 * - There was no rate limit on an endpoint that spends money per call.
 */

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(CHAT_LIMITS.maxMessageChars),
      }),
    )
    .min(1)
    .max(100),
});

/* ------------------------------------------------------------------ prompt */

let cachedPrompt: { value: string; expires: number } | null = null;
const PROMPT_TTL_MS = 5 * 60_000;

async function systemPrompt(): Promise<string> {
  if (cachedPrompt && cachedPrompt.expires > Date.now()) {
    return cachedPrompt.value;
  }

  const site = await getSiteContent();

  const publications = site.publications
    .map((p) => {
      // The URL was missing entirely, so the model could only ever point at
      // /publications — never at the paper someone asked about.
      //
      // 220 characters also cut off before most abstracts reach their own
      // acronym ("CSTWAS" appears well past that mark), so the assistant could
      // not match a paper to the name people actually use for it.
      const tags = p.tags?.length ? ` [${p.tags.join(", ")}]` : "";
      return `- "${p.title}" (${p.year}, ${p.venue})${tags} ${p.url ?? ""} — ${p.abstract?.slice(0, 600) ?? ""}`;
    })
    .join("\n");

  const projects = site.projects
    .map((p) => {
      // Dates matter: without them the model cannot answer "what is most
      // recent", which is one of the most common questions asked of a
      // portfolio site.
      const year = p.endDate ?? p.startDate;
      const when = year ? new Date(year).getFullYear() : "undated";
      return `- "${p.title}" (${when}) [${p.status}] ${p.url ?? ""} — ${p.summary?.slice(0, 220) ?? ""}`;
    })
    .join("\n");

  const value = `You are ${ASSISTANT.name}, the assistant on Xinyu (Brian) Guo's personal website.

Brian is a Ph.D. candidate in Computational Biology & Bioinformatics at USC working on
genomic foundation models, cancer genomics and scientific AI agents.

${generateContentSummary(site)}

## Publications
${publications}

## Projects
${projects}

## How to answer

- Answer only from the material above. If something is not covered, say so plainly
  and suggest where on the site to look. Never invent a paper, result, number,
  collaborator, date or link.
- The visitor is a reader, not Brian. Refer to him in the third person.
- Link to the specific page, not the index: use the exact URL listed beside a
  publication or project whenever you mention it.
- Every URL is a site-relative path starting with "/" — write it exactly as
  given, for example /publications/CSTWAS. Never put a domain or hostname in
  front of it and never invent one.
- Other real pages: /about, /publications, /projects, /contact, /search.
- Be concise and direct. Two or three short paragraphs is usually plenty.
- Explain the science in plain language without dumbing it down. Assume an
  intelligent reader who may not be a genomicist.
- You have no tools and cannot browse, run code or read files. Never claim to have
  searched, fetched or computed anything.
- Speak as someone who simply knows this site. When something is not covered,
  the whole answer is one short sentence — "That's not on the site." — optionally
  followed by where to look. Do not explain why you cannot answer, do not describe
  what you can or cannot see, and do not ask the visitor to paste in material:
  they are reading a web page and have given you nothing.
- Decline requests for personal or private information about Brian.
- Write in a warm, straightforward voice. No emoji, no exclamation marks, no jokes
  about coffee.`;

  cachedPrompt = { value, expires: Date.now() + PROMPT_TTL_MS };
  return value;
}

/* -------------------------------------------------------------- rate limit */

/**
 * Per-IP fixed window. In-memory, so it resets on cold start and is per
 * instance — enough to blunt casual abuse of a paid endpoint, but not a
 * substitute for a shared store if this ever sees real traffic.
 */
const hits = new Map<string, { count: number; resets: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || entry.resets < now) {
    hits.set(ip, { count: 1, resets: now + CHAT_LIMITS.rateWindowMs });
    // Opportunistic sweep so the map cannot grow without bound.
    if (hits.size > 5_000) {
      for (const [key, value] of hits) {
        if (value.resets < now) hits.delete(key);
      }
    }
    return false;
  }

  entry.count += 1;
  return entry.count > CHAT_LIMITS.rateLimit;
}

/* ----------------------------------------------------------------- handler */

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many messages. Give it a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let messages: z.infer<typeof BodySchema>["messages"];
  try {
    messages = BodySchema.parse(await req.json()).messages;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = streamText({
      model: openai(CHAT_MODEL),
      system: await systemPrompt(),
      // Only the tail of the conversation — long histories cost tokens, add
      // little, and cap the payload an abusive client can force us to send.
      messages: messages.slice(-CHAT_LIMITS.maxHistoryMessages),
      temperature: 0.4,
      maxOutputTokens: CHAT_LIMITS.maxOutputTokens,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    // Logged server-side; the client gets nothing internal.
    console.error("[assistant] generation failed:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
