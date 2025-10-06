"use client"

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  Loader2,
  User,
  Search,
  Sparkles,
  ExternalLink
} from 'lucide-react'

interface ByteBrainChatProps {
  className?: string
}

export function ByteBrainChat({ className = "" }: ByteBrainChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Use Vercel AI SDK's useChat hook (v1 API - classic)
  const { messages, input, setInput, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    streamProtocol: 'text'
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleToggleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
    setIsFullscreen(false)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    setIsFullscreen(false)
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setIsMinimized(false)
  }

  const handleQuickPrompt = async (prompt: string) => {
    setInput(prompt)
    // Trigger submit after setting the input
    setTimeout(() => {
      const form = document.querySelector('form')
      form?.requestSubmit()
    }, 0)
  }


  const quickStartPrompts = [
    "What's Brian working on lately?",
    "Show me his best research",
    "Take me to his projects",
    "Tell me about his background",
    "What are his research interests?"
  ]

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user'
    const isByteBrain = message.role === 'assistant'
    const hasToolInvocations = message.toolInvocations && message.toolInvocations.length > 0

    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-6`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary'
        }`}>
          {isUser ? <User className="h-5 w-5" /> : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </div>

        <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
          <div className={`inline-block max-w-[90%] ${
            isUser
              ? 'bg-primary text-primary-foreground p-4 rounded-2xl'
              : ''
          }`}>
            {isByteBrain && (
              <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Assistant</span>
              </div>
            )}

            {/* Render tool invocations */}
            {hasToolInvocations && message.toolInvocations.map((tool: any) => (
              <div key={tool.toolCallId} className="mb-3 bg-muted border p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span>Using {tool.toolName.replace('_', ' ')}</span>
                  {tool.state === 'result' && <Badge variant="outline" className="text-xs">✓ Complete</Badge>}
                </div>
                {tool.state === 'result' && tool.result && (
                  <div className="text-xs space-y-2">
                    {tool.result.results && tool.result.results.length > 0 && (
                      <div className="space-y-1">
                        {tool.result.results.slice(0, 3).map((r: any, i: number) => (
                          <Link
                            key={i}
                            href={r.url || '#'}
                            className="block p-2 bg-background rounded hover:bg-accent transition-colors"
                          >
                            <div className="font-medium text-sm">{r.title}</div>
                            <div className="text-muted-foreground line-clamp-1">{r.snippet}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{r.type}</Badge>
                              {r.relevanceScore && (
                                <span className="text-xs text-muted-foreground">{r.relevanceScore}% match</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Render message content */}
            {message.content && (
              <div className={`text-sm leading-relaxed ${isUser ? '' : 'bg-muted border p-4 rounded-2xl prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0 prose-headings:my-2'}`}>
                {isByteBrain ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Floating chat button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggleOpen}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </Button>
      </div>
    )
  }

  // Chat interface
  return (
    <div className={`fixed z-50 ${
      isFullscreen 
        ? 'inset-4' 
        : isMinimized 
          ? 'bottom-6 right-6 w-80 h-16'
          : 'bottom-6 right-6 w-96 h-[650px]'
    } transition-all duration-300 ${className}`}>
      <Card className="h-full flex flex-col shadow-2xl border-2">
        <CardHeader className="flex-shrink-0 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              {!isMinimized && (
                <div>
                  <h3 className="font-semibold text-base">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask me anything</p>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleMinimize} className="h-8 w-8 p-0">
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleFullscreen} className="h-8 w-8 p-0">
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-5 py-4">
                {messages.length === 0 && (
                  <div className="py-8 text-center px-4">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-base mb-2">How can I help?</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
                      I can help you explore Brian's research, projects, and answer questions about his work.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground mb-3">Suggestions</p>
                      {quickStartPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start text-sm h-auto py-2.5 px-3 font-normal hover:bg-accent"
                          onClick={() => handleQuickPrompt(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => renderMessage(message, index))}

                {isLoading && (
                  <div className="flex gap-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="inline-block bg-muted border p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-destructive">
                        {error.message || 'An error occurred'}
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            <CardFooter className="flex-shrink-0 p-4 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2 w-full items-center">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                      e.preventDefault()
                      handleSubmit(e as any)
                    }
                  }}
                  placeholder="Message..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border-2 px-4"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input?.trim()}
                  className="h-9 w-9 rounded-full p-0 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}