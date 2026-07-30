"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Minimal streaming chat client.
 *
 * This deliberately does not use `@ai-sdk/react`. That package was pinned at
 * v1, which pairs with `ai` v4, while the project runs `ai` v5 — a latent
 * incompatibility. And because the endpoint streams plain text, the SDK was
 * only reading a ReadableStream on our behalf. Doing it directly removes the
 * version coupling and gives us proper abort and error handling.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

let counter = 0;
const nextId = () => `m${++counter}`;

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isLoading) return;

      setError(null);
      setInput("");

      const userMessage: ChatMessage = {
        id: nextId(),
        role: "user",
        content,
      };
      // Captured here so the request carries the full history including this
      // turn; reading state after setState would send a stale list.
      const history = [...messages, userMessage];
      setMessages(history);
      setIsLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const replyId = nextId();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!res.ok) {
          const detail = await res.json().catch(() => null);
          throw new Error(detail?.error ?? "Something went wrong.");
        }
        if (!res.body) throw new Error("No response from the assistant.");

        // Create the assistant bubble only once bytes are on the way, so a
        // failed request never leaves an empty message behind.
        setMessages((prev) => [
          ...prev,
          { id: replyId, role: "assistant", content: "" },
        ]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === replyId ? { ...m, content: m.content + chunk } : m,
            ),
          );
        }
      } catch (err) {
        // An abort is a user action, not a failure.
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setMessages((prev) => prev.filter((m) => m.id !== replyId));
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { messages, input, setInput, send, stop, reset, isLoading, error };
}
