'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Editor } from '@tiptap/react'
import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,Heading, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'

const headingLevels = [1, 2, 3, 4, 5, 6] as const

// Helper to get the correct icon component based on the level
const getIcon = (level: typeof headingLevels[number]) => {
  switch (level) {
    case 1:
      return Heading1
    case 2:
      return Heading2
    case 3:
      return Heading3
      case 4:
      return Heading4
    case 5:
      return Heading5
    case 6:
      return Heading6
    default:
      return Heading1 // Fallback
  }
}

export function HeadingSelector({ editor }: { editor: Editor }) {
  // State to track the currently active format (e.g., 'H2', 'Paragraph')
  const [activeFormat, setActiveFormat] = useState('Paragraph')

  // Effect to update the active format on selection changes
  useEffect(() => {
    if (!editor) return

    const updateState = () => {
      let format = 'Paragraph'
      
      // Check for each heading level
      for (const level of headingLevels) {
        if (editor.isActive('heading', { level })) {
          format = `H${level}`
          break
        }
      }
      // If no heading is active, and it's not a paragraph (e.g., list/blockquote), 
      // you might want a different default, but 'Paragraph' is a good baseline.
      if (format === 'Paragraph' && editor.isActive('paragraph')) {
          format = 'Paragraph'
      } else if (format === 'Paragraph' && !editor.isActive('paragraph')) {
          // If neither heading nor paragraph, just show a general icon or 'Format'
          format = 'Format'
      }

      setActiveFormat(format)
    }

    // Initialize and subscribe to changes
    updateState()
    editor.on('selectionUpdate', updateState)
    editor.on('transaction', updateState)

    return () => {
      editor.off('selectionUpdate', updateState)
      editor.off('transaction', updateState)
    }
  }, [editor])

  // Determine the Icon for the main button based on the active state
  const ActiveIcon = activeFormat.startsWith('H') 
    ? getIcon(parseInt(activeFormat.slice(1)) as typeof headingLevels[number]) 
    : Heading

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
             size="xs"
                className={`transition-all hover:scale-105 ${
                  activeFormat !== 'Paragraph' ? 'bg-gray-100' : '' // Subtle highlight on active format
                }`}
              >
                <ActiveIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[130px] bg-white shadow-md border border-gray-200">
              
              {headingLevels.map((level) => {
                const isCurrentHeading = editor.isActive('heading', { level })
                const Icon = getIcon(level)
                
                return (
                  <DropdownMenuItem
                    key={level}
                    className={`cursor-pointer transition-colors hover:bg-gray-100 focus:bg-gray-100 ${
                      isCurrentHeading ? 'bg-blue-50 font-medium' : '' // Highlight active heading
                    }`}
                    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    Heading {level}
                  </DropdownMenuItem>
                )
              })}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`cursor-pointer transition-colors hover:bg-gray-100 focus:bg-gray-100 ${
                  editor.isActive('paragraph') ? 'bg-blue-50 font-medium' : '' // Highlight active paragraph
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Paragraph
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Headings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}