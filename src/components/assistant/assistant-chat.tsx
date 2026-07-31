"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUp,
  CornerDownLeft,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Square,
  X,
} from "lucide-react";

import { ASSISTANT, SUGGESTED_PROMPTS } from "@/lib/assistant";
import { AssistantFace } from "./assistant-face";
import { useAssistantChat } from "./use-assistant-chat";

export function AssistantChat({
  className = "",
  // Locale-supplied strings. The assistant's *name* stays "Locus" in both
  // locales — it is a proper noun, and a renamed assistant reads as a
  // different product.
  tagline = ASSISTANT.tagline,
  cta = ASSISTANT.cta,
}: {
  className?: string;
  tagline?: string;
  cta?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { messages, input, setInput, send, stop, reset, isLoading, error } =
    useAssistantChat();

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  // Escape closes the panel, as expected of any overlay.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  function close() {
    stop();
    setIsOpen(false);
    setIsMinimized(false);
    setIsFullscreen(false);
  }

  /* ---------------------------------------------------------- launcher */
  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          aria-label={cta}
          className="group flex items-center rounded-full border border-border bg-surface/90 p-2 shadow-lg backdrop-blur transition-all duration-300 hover:border-signal/50 hover:pr-4 hover:shadow-xl"
        >
          <AssistantFace size={40} />
          {/* Label unfurls on hover; the organism stays the hero at rest. */}
          <span className="max-w-0 overflow-hidden whitespace-nowrap font-mono text-xs text-muted-foreground transition-all duration-300 group-hover:ml-2 group-hover:max-w-[9rem]">
            {cta}
          </span>
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------- panel */
  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isFullscreen
          ? "inset-4"
          : isMinimized
            ? "bottom-6 right-6 h-14 w-80"
            : "bottom-6 right-6 h-[640px] w-[400px] max-w-[calc(100vw-3rem)]"
      } ${className}`}
      role="dialog"
      aria-label={`${ASSISTANT.name} assistant`}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
        {/* header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <AssistantFace
              size={32}
              state={isLoading ? "thinking" : "idle"}
              className="shrink-0"
            />
            {!isMinimized && (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-display text-sm font-bold">
                    {ASSISTANT.name}
                  </h2>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isLoading ? "bg-signal" : "bg-signal/50"}`}
                    />
                    {isLoading ? "thinking" : "ready"}
                  </span>
                </div>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  {tagline}
                </p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-0.5">
            {messages.length > 0 && !isMinimized && (
              <IconButton onClick={reset} label="New conversation">
                <RotateCcw className="h-3.5 w-3.5" />
              </IconButton>
            )}
            <IconButton
              onClick={() => setIsMinimized(!isMinimized)}
              label="Minimize"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              onClick={() => {
                setIsFullscreen(!isFullscreen);
                setIsMinimized(false);
              }}
              label="Toggle fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton onClick={close} label="Close">
              <X className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="py-6">
                  <div className="mb-6 flex flex-col items-center text-center">
                    <AssistantFace size={72} className="mb-4" />
                    <p className="max-w-[17rem] text-sm leading-relaxed text-muted-foreground">
                      I know what is on this site — the papers, the projects and
                      what Brian actually did. Ask, and I will point you at the
                      source.
                    </p>
                  </div>

                  <div className="label-mono mb-2">Try</div>
                  <div className="space-y-1.5">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => send(prompt)}
                        className="group flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors hover:border-signal/50 hover:bg-accent"
                      >
                        <span>{prompt}</span>
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="mb-6 flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-signal px-4 py-2.5 text-sm leading-relaxed text-signal-foreground">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="mb-7">
                    <div className="mb-2 flex items-center gap-2">
                      <AssistantFace size={20} className="shrink-0" />
                      <span className="label-mono !text-[10px]">
                        {ASSISTANT.name}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none border-l border-border pl-4 text-sm leading-relaxed dark:prose-invert prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-li:my-0 prose-a:text-signal">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ),
              )}

              {isLoading && (
                <div className="mb-6 flex items-center gap-2 border-l border-border pl-4 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="font-mono text-xs">thinking…</span>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* composer */}
            <div className="shrink-0 border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 transition-colors focus-within:border-signal/60"
              >
                <span className="select-none font-mono text-xs text-signal">
                  &gt;
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the research…"
                  aria-label="Message"
                  maxLength={2000}
                  className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
                />
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Stop generating"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Square className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal text-signal-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
