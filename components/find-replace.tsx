'use client'

import { useState } from 'react'
import { useEditorContext } from '@/contexts/editor-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Search, Replace, ChevronUp, ChevronDown } from 'lucide-react'

interface FindReplaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FindReplace({ open, onOpenChange }: FindReplaceProps) {
  const { editor } = useEditorContext()
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matchIndex, setMatchIndex] = useState(0)
  const [matches, setMatches] = useState<number[]>([])

  if (!editor) return null

  const findMatches = () => {
    if (!findText) {
      setMatches([])
      return
    }
    const content = editor.getText()
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const found: number[] = []
    let match
    while ((match = regex.exec(content)) !== null) {
      found.push(match.index)
    }
    setMatches(found)
    if (found.length > 0) {
      setMatchIndex(0)
      highlightMatch(found[0])
    }
  }

  const highlightMatch = (position: number) => {
    const content = editor.getText()
    const length = findText.length
    editor.commands.setTextSelection({
      from: position,
      to: position + length,
    })
  }

  const replace = () => {
    if (!findText) return
    const content = editor.getHTML()
    const newContent = content.replace(
      new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replaceText
    )
    editor.commands.setContent(newContent)
    findMatches()
  }

  const replaceAll = () => {
    if (!findText) return
    const content = editor.getHTML()
    const newContent = content.replace(
      new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replaceText
    )
    editor.commands.setContent(newContent)
    setMatches([])
  }

  const nextMatch = () => {
    if (matches.length === 0) return
    const next = (matchIndex + 1) % matches.length
    setMatchIndex(next)
    highlightMatch(matches[next])
  }

  const prevMatch = () => {
    if (matches.length === 0) return
    const prev = (matchIndex - 1 + matches.length) % matches.length
    setMatchIndex(prev)
    highlightMatch(matches[prev])
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Find & Replace</DialogTitle>
          </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="find" className="text-sm font-medium">Find</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="find"
                value={findText}
                onChange={(e) => {
                  setFindText(e.target.value)
                  findMatches()
                }}
                placeholder="Search..."
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevMatch}
                    disabled={matches.length === 0}
                    className="transition-all hover:scale-105"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous match</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextMatch}
                    disabled={matches.length === 0}
                    className="transition-all hover:scale-105"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next match</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {matches.length > 0 && (
              <p className="text-sm text-blue-600 font-medium mt-2 px-2 py-1 bg-blue-50 rounded-md inline-block">
                {matchIndex + 1} of {matches.length} matches
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="replace" className="text-sm font-medium">Replace</Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="mt-2 transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={replace} 
              disabled={!findText}
              className="transition-all hover:scale-105"
            >
              <Replace className="h-4 w-4 mr-2" />
              Replace
            </Button>
            <Button 
              onClick={replaceAll} 
              disabled={!findText}
              className="transition-all hover:scale-105"
            >
              <Replace className="h-4 w-4 mr-2" />
              Replace All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  )
}

