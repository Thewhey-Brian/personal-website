"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Brain,
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Loader2, 
  User,
  Lightbulb
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

interface ByteBrainChatProps {
  className?: string
}

export function ByteBrainChat({ className = "" }: ByteBrainChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      id: Date.now().toString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        id: (Date.now() + 1).toString()
      }

      setMessages(prev => [...prev, assistantMessage])

      let assistantContent = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        assistantContent += chunk

        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage.role === 'assistant') {
            lastMessage.content = assistantContent
          }
          return newMessages
        })
      }

    } catch (error) {
      console.error('Chat error:', error)
      setError('Oops! ByteBrain is having a computational moment. Try again!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  const quickStartPrompts = [
    "What's Brian working on lately?",
    "Show me his best research",
    "Take me to his projects",
    "Tell me about his background",
    "What are his research interests?"
  ]

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user'
    const isByteBrain = message.role === 'assistant'
    
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-6`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
        }`}>
          {isUser ? <User className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
        </div>
        
        <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
          <div className={`inline-block max-w-[90%] p-4 rounded-2xl ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted border'
          }`}>
            {isByteBrain && (
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <Brain className="h-4 w-4" />
                <span>ByteBrain</span>
                <Badge variant="secondary" className="text-xs">AI Twin</Badge>
              </div>
            )}
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
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
          className="h-16 w-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Brain className="h-7 w-7" />
        </Button>
        <div className="absolute -top-12 right-0 bg-popover text-popover-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg whitespace-nowrap">
          Chat with ByteBrain 🧠
        </div>
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
        <CardHeader className="flex-shrink-0 pb-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              {!isMinimized && (
                <div>
                  <h3 className="font-semibold text-base">ByteBrain</h3>
                  <p className="text-xs text-muted-foreground">Brian's Digital Twin</p>
                </div>
              )}
            </div>
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
              <ScrollArea className="h-full px-6 py-4">
                {messages.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold mb-2">Hey there! I'm ByteBrain! 🧠</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      I'm Brian's digital twin - basically him but with infinite coffee and questionable humor. 
                      I know everything about his research and can guide you around the site!
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground justify-center">
                        <Lightbulb className="h-3 w-3" />
                        <span>Try these conversation starters:</span>
                      </div>
                      {quickStartPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start text-xs h-8"
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block bg-muted border p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">ByteBrain is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            <CardFooter className="flex-shrink-0 p-4 border-t bg-muted/20">
              <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about Brian's work, or just say hi! 👋"
                  disabled={isLoading}
                  className="flex-1 border-2 focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isLoading || !input?.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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