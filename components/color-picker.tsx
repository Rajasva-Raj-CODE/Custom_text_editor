'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Editor } from '@tiptap/react'
import { Palette, Highlighter } from 'lucide-react'

interface ColorPickerProps {
  editor: Editor
  type: 'text' | 'highlight'
}

const colors = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#808080',
  '#800000',
  '#008000',
  '#000080',
  '#808000',
  '#800080',
  '#008080',
  '#C0C0C0',
]

export function ColorPicker({ editor, type }: ColorPickerProps) {
  const isText = type === 'text'
  const currentColor = isText
    ? editor.getAttributes('textStyle').color || '#000000'
    : editor.getAttributes('highlight').color || '#FFFF00'

  const setColor = (color: string) => {
    if (isText) {
      editor.chain().focus().setColor(color).run()
    } else {
      editor.chain().focus().toggleHighlight({ color }).run()
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="transition-all hover:scale-105"
              >
                {isText ? (
                  <Palette className="h-4 w-4" />
                ) : (
                  <Highlighter className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 shadow-lg">
              <div className="grid grid-cols-4 gap-2 p-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    className={`h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md ${
                      currentColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    type="button"
                  />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="text-sm font-medium mb-2 block text-gray-700">Custom Color</label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300 transition-all hover:border-blue-400"
                />
              </div>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isText ? 'Text Color' : 'Highlight Color'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

