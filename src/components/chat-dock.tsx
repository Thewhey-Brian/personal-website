"use client"
// @ts-nocheck

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Loader2, 
  Bot, 
  User,
  Search,
  FileText,
  Image,
  BarChart3,
} from 'lucide-react'

interface ChatDockProps {
  className?: string
}

export function ChatDock({ className = "" }: ChatDockProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const chatHook = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = chatHook
  
  // Debug logging
  useEffect(() => {
    console.log('useChat hook properties:', {
      handleInputChange: typeof handleInputChange,
      handleSubmit: typeof handleSubmit,
      input,
      hasMessages: messages.length,
      allKeys: Object.keys(chatHook)
    })
  }, [handleInputChange, handleSubmit, input, messages.length, chatHook])

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

  const renderToolCall = (toolCall: { toolName: string; args: Record<string, unknown>; result?: { error?: string; results?: unknown; totalFound?: number; nodes?: unknown[]; edges?: unknown[]; photos?: unknown[] } }) => {
    const toolName = toolCall.toolName
    const args = toolCall.args
    const result = toolCall.result

    const getToolIcon = (name: string) => {
      switch (name) {
        case 'search_content': return <Search className="h-4 w-4" />
        case 'get_graph': return <BarChart3 className="h-4 w-4" />
        case 'render_gallery': return <Image className="h-4 w-4" />
        case 'open_media':
        case 'summarize_pdf': return <FileText className="h-4 w-4" />
        default: return <Bot className="h-4 w-4" />
      }
    }

    const getToolDescription = (name: string, args: Record<string, unknown>) => {
      switch (name) {
        case 'search_content': 
          return `Searching for "${args.query}"${args.type && args.type !== 'all' ? ` in ${args.type}s` : ''}`
        case 'get_graph': 
          return `Loading knowledge graph for "${args.nodeId}"`
        case 'render_gallery': 
          return `Loading photo gallery${args.filter.album ? ` from ${args.filter.album}` : ''}`
        case 'open_media': 
          return `Opening media: ${args.url}`
        case 'summarize_pdf': 
          return `Summarizing PDF: ${args.url}`
        default: 
          return `Using tool: ${name}`
      }
    }

    return (
      <div className="my-2 p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {getToolIcon(toolName)}
          <span className="text-sm font-medium">
            {getToolDescription(toolName, args)}
          </span>
          <Badge variant="outline" className="text-xs">
            {toolName}
          </Badge>
        </div>
        
        {result && (
          <div className="text-xs text-muted-foreground">
            {result.error ? (
              <span className="text-destructive">Error: {result.error}</span>
            ) : (
              <span>
                {result.results ? `Found ${result.totalFound} results` : 
                 result.nodes ? `${result.nodes.length} nodes, ${result.edges.length} edges` :
                 result.photos ? `${result.photos.length} photos` :
                 'Tool executed successfully'}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderMessage = (message: { role: string; content: string; toolInvocations?: unknown[] }, index: number) => {
    const isUser = message.role === 'user'
    
    return (
      <div key={index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
          <div className={`inline-block max-w-[85%] p-3 rounded-lg ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
            
            {/* Render tool calls */}
            {message.toolInvocations && message.toolInvocations.map((toolCall: unknown, toolIndex: number) => (
              <div key={toolIndex}>
                {renderToolCall(toolCall)}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const quickPrompts = [
    "What research have you published?",
    "Show me your latest projects",
    "Tell me about your work in machine learning",
    "What technologies do you use most?",
    "Show me some photos"
  ]

  const [manualInput, setManualInput] = useState('')
  
  const handleQuickPrompt = (prompt: string) => {
    console.log('Quick prompt clicked:', prompt)
    setManualInput(prompt)
    
    // Use a more direct approach
    setTimeout(() => {
      handleManualSubmit(prompt)
    }, 100)
  }
  
  const [customMessages, setCustomMessages] = useState<{ role: string; content: string; id: string }[]>([])
  const [customIsLoading, setCustomIsLoading] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)

  const handleManualSubmit = async (messageText?: string) => {
    const textToSend = messageText || manualInput
    if (!textToSend.trim()) return
    
    console.log('Submitting message:', textToSend)
    
    // Try the useChat method first
    if (typeof handleSubmit === 'function') {
      try {
        const fakeEvent = {
          preventDefault: () => {},
          currentTarget: new FormData()
        } as React.FormEvent<HTMLFormElement>
        fakeEvent.currentTarget.set('message', textToSend)
        handleSubmit(fakeEvent)
        setManualInput('')
        return
      } catch (error) {
        console.error('useChat handleSubmit failed:', error)
      }
    }
    
    // Fallback to direct API call
    console.log('Using direct API call fallback')
    setCustomIsLoading(true)
    setCustomError(null)
    
    // Add user message immediately
    const userMessage = { role: 'user', content: textToSend, id: Date.now().toString() }
    const currentMessages = messages.length > 0 ? messages : customMessages
    const newMessages = [...currentMessages, userMessage]
    setCustomMessages(newMessages)
    setManualInput('')
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({ role: msg.role, content: msg.content }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      // Add assistant message placeholder
      const assistantMessage = { 
        role: 'assistant', 
        content: '', 
        id: (Date.now() + 1).toString() 
      }
      setCustomMessages([...newMessages, assistantMessage])

      // Read the streaming response
      let assistantContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        // Our API returns plain text streaming, not SSE format
        assistantContent += chunk
        setCustomMessages([...newMessages, { 
          ...assistantMessage, 
          content: assistantContent 
        }])
      }
    } catch (error) {
      console.error('Chat submission failed:', error)
      setCustomError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setCustomIsLoading(false)
    }
  }

  // Floating chat button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggleOpen}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageSquare className="h-6 w-6" />
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
          : 'bottom-6 right-6 w-96 h-[600px]'
    } transition-all duration-300 ${className}`}>
      <Card className="h-full flex flex-col shadow-2xl">
        <CardHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {isMinimized ? null : "Ask me anything"}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleMinimize}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4">
                {(messages.length === 0 && customMessages.length === 0) && (
                  <div className="py-8 text-center">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Hi! I&apos;m your AI assistant</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      I can help you explore publications, projects, and photos. Ask me anything!
                    </p>
                    <div className="space-y-2">
                      {quickPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start"
                          onClick={() => handleQuickPrompt(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {(messages.length > 0 ? messages : customMessages).map((message, index) => renderMessage(message, index))}

                {(isLoading || customIsLoading) && (
                  <div className="flex gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(error || customError) && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      Something went wrong. Please try again.
                    </p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            <CardFooter className="flex-shrink-0 p-4 pt-2">
              <form onSubmit={(e) => {
                e.preventDefault()
                handleManualSubmit()
              }} className="flex gap-2 w-full">
                <Input
                  ref={inputRef}
                  value={manualInput}
                  onChange={(e) => {
                    setManualInput(e.target.value)
                    // Also try to call the original if it exists
                    if (typeof handleInputChange === 'function') {
                      handleInputChange(e)
                    }
                  }}
                  placeholder="Ask about my research, projects, or photos..."
                  disabled={isLoading || customIsLoading}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={(isLoading || customIsLoading) || !manualInput?.trim()}>
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