'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Editor } from '@tiptap/react'
import { Type } from 'lucide-react'
import { useEffect, useState } from 'react'

const fontSizes = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '18px' },
  { label: 'XL', value: '20px' },
  { label: 'XXL', value: '24px' },
  { label: 'Huge', value: '32px' },
]

export function FontSizeSelector({ editor }: { editor: Editor }) {
  const [currentSize, setCurrentSize] = useState('16px')

  useEffect(() => {
    if (!editor) return

    const updateState = () => {
      const size = editor.getAttributes('textStyle').fontSize || '16px'
      setCurrentSize(size)
    }

    updateState()

    editor.on('selectionUpdate', updateState)
    editor.on('transaction', updateState)

    return () => {
      editor.off('selectionUpdate', updateState)
      editor.off('transaction', updateState)
    }
  }, [editor])

  const setFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run()
    setCurrentSize(size)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="transition-all hover:scale-105 min-w-[80px] justify-start"
              >
                <Type className="h-4 w-4 mr-2" />
                {currentSize}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[150px]">
              {fontSizes.map((size) => (
                <DropdownMenuItem
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={`cursor-pointer transition-colors hover:bg-gray-100 
                    ${currentSize === size.value ? 'bg-blue-50' : ''}`}
                >
                  <span style={{ fontSize: size.value }}>
                    {size.label}
                  </span>

                  <span className="ml-auto text-xs text-gray-500">
                    ({size.value})
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Font Size</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
