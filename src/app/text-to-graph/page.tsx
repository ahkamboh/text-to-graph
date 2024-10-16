'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import mermaid from 'mermaid'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, Download, Wand2, Code, Eye, Plus, Minus, Move } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

mermaid.initialize({ startOnLoad: true })

const defaultPrompts = [
  {
    name: "Simple Flowchart",
    prompt: "Create a simple flowchart with three steps: Start, Process, and End."
  },
  {
    name: "Basic Sequence Diagram",
    prompt: "Generate a sequence diagram showing interaction between a user, a web server, and a database."
  },
  {
    name: "Organization Chart",
    prompt: "Create an organization chart for a small company with a CEO, CTO, and CFO, each with two direct reports."
  },
  {
    name: "State Diagram",
    prompt: "Design a state diagram for a traffic light system with three states: Red, Yellow, and Green."
  }
]

const generateAIGraph = async (prompt: string): Promise<string> => {
  const response = await fetch('/api/graph', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI graph');
  }

  const data = await response.json();
  return data.mermaidCode;
}

export function MermaidGraphGenerator() {
  const [mermaidCode, setMermaidCode] = useState('')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAIPrompt] = useState('')
  const [activeTab, setActiveTab] = useState('code')
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const graphRef = useRef<HTMLDivElement>(null)

  const renderMermaid = useCallback(() => {
    if (!mermaidCode) return
    mermaid.render('mermaid-graph', mermaidCode).then(
      ({ svg }) => {
        setSvg(svg)
        setError('')
      },
      (error) => {
        console.error('Error rendering mermaid', error)
        setError(`Error rendering graph: ${error.message}`)
        setSvg('')
      }
    )
  }, [mermaidCode])

  useEffect(() => {
    renderMermaid()
  }, [renderMermaid])

  const handleAIGenerate = async () => {
    if (!aiPrompt) return
    setIsLoading(true)
    setError('')
    try {
      const aiGeneratedCode = await generateAIGraph(aiPrompt)
      setMermaidCode(aiGeneratedCode)
      renderMermaid()
      setShowAIPrompt(false)
      setAIPrompt('')
      setActiveTab('preview')
    } catch (error) {
      setError('Failed to generate AI graph. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const svgToPng = (svgString: string, width: number, height: number, transparent: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        if (!transparent) {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, width, height)
        }
        const scale = Math.min(width / img.width, height / img.height)
        const x = (width - img.width * scale) / 2
        const y = (height - img.height * scale) / 2
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Failed to load SVG'))
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)))
    })
  }

  const handleDownload = async (format: 'svg' | 'png' | 'png-transparent') => {
    if (svg) {
      let blob: Blob
      let filename: string

      if (format === 'svg') {
        blob = new Blob([svg], { type: 'image/svg+xml' })
        filename = 'mermaid-graph.svg'
      } else {
        try {
          const isTransparent = format === 'png-transparent'
          const pngDataUrl = await svgToPng(svg, 1920, 1080, isTransparent)
          const pngData = atob(pngDataUrl.split(',')[1])
          const pngArray = new Uint8Array(pngData.length)
          for (let i = 0; i < pngData.length; i++) {
            pngArray[i] = pngData.charCodeAt(i)
          }
          blob = new Blob([pngArray], { type: 'image/png' })
          filename = isTransparent ? 'mermaid-graph-fullhd-transparent.png' : 'mermaid-graph-fullhd.png'
        } catch (error) {
          console.error('Error converting to PNG:', error)
          setError('Failed to convert to PNG. Please try SVG format.')
          return
        }
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleZoom = (delta: number) => {
    setZoom(prevZoom => Math.max(0.5, Math.min(prevZoom + delta, 2)))
  }

  const handleMove = (dx: number, dy: number) => {
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
  }

  const handleSelectPrompt = (value: string) => {
    const selectedPrompt = defaultPrompts.find(p => p.name === value)
    if (selectedPrompt) {
      setAIPrompt(selectedPrompt.prompt)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Mermaid Graph Generator</CardTitle>
          <CardDescription>Create beautiful diagrams with AI assistance and export in high quality</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="mt-0">
              <Textarea
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                placeholder="Enter Mermaid syntax here..."
                className="font-mono min-h-[300px] resize-y bg-background/50 backdrop-blur-sm"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-0">
              <AnimatePresence mode="wait">
                {svg ? (
                  <motion.div
                    key="svg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="border rounded-lg p-4 bg-white overflow-hidden shadow-inner min-h-[300px] relative"
                  >
                    <div 
                      ref={graphRef}
                      style={{
                        transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                        transformOrigin: 'center',
                        transition: 'transform 0.3s ease-out'
                      }}
                      dangerouslySetInnerHTML={{ __html: svg }} 
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button size="icon" variant="secondary" onClick={() => handleZoom(0.1)} aria-label="Zoom in">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" onClick={() => handleZoom(-0.1)} aria-label="Zoom out">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" onClick={() => handleMove(-10, 0)} aria-label="Move left">
                        <Move className="h-4 w-4 rotate-180" />
                      </Button>
                      <Button size="icon" variant="secondary" onClick={() => handleMove(10, 0)} aria-label="Move right">
                        <Move className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" onClick={() => handleMove(0, -10)} aria-label="Move up">
                        <Move className="h-4 w-4 -rotate-90" />
                      </Button>
                      <Button size="icon" variant="secondary" onClick={() => handleMove(0, 10)} aria-label="Move down">
                        <Move className="h-4 w-4 rotate-90" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center border rounded-lg p-4 bg-background/50 backdrop-blur-sm min-h-[300px]"
                  >
                    <p className="text-muted-foreground">Generate a graph to see the preview</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={renderMermaid} variant="secondary" className="shadow-md hover:shadow-lg transition-shadow">
              Generate Graph
            </Button>
            <Button onClick={() => setShowAIPrompt(true)} disabled={isLoading} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md hover:shadow-lg transition-all">
              <Wand2 className="mr-2 h-4 w-4" />
              AI Generate
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={!svg} className="shadow-md hover:shadow-lg transition-shadow">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleDownload('svg')}>
                  Download as SVG
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleDownload('png')}>
                  Download as Full HD PNG
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleDownload('png-transparent')}>
                  Download as Full HD PNG (Transparent)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-destructive mt-4 p-2 rounded-md bg-destructive/10"
                role="alert"
              >
                <AlertCircle className="h-5 w-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      <Dialog open={showAIPrompt} onOpenChange={setShowAIPrompt}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate AI Graph</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select onValueChange={handleSelectPrompt}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a default prompt" />
              </SelectTrigger>
              <SelectContent>
                {defaultPrompts.map((prompt, index) => (
                  <SelectItem key={index} value={prompt.name}>{prompt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              placeholder="Describe the  graph you want to generate..."
              className="font-mono min-h-[100px] resize-y"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAIPrompt(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleAIGenerate} disabled={isLoading} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MermaidGraphGenerator;