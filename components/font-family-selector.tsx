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

const fontFamilies = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
]

export function FontFamilySelector({ editor }: { editor: Editor }) {
  const [currentFamily, setCurrentFamily] = useState('')

useEffect(() => {
if (!editor) return
const updateState = () => setCurrentFamily(editor.getAttributes('textStyle').fontFamily || '')
updateState()
editor.on('selectionUpdate', updateState)
editor.on('transaction', updateState)
return () => {
editor.off('selectionUpdate', updateState)
editor.off('transaction', updateState)
}
}, [editor])


const setFontFamily = (family: string) => {
if (family) editor.chain().focus().setFontFamily(family).run()
else editor.chain().focus().unsetFontFamily().run()
setCurrentFamily(family)
}
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="xs"
                className="transition-all hover:scale-105 "
              >
                <Type className="h-3 w-3 mr-2" />
                <span className="truncate text-xs">
                  {currentFamily || "Default"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[140px] bg-white shadow-lg border border-gray-200">
              {fontFamilies.map((family) => (
                <DropdownMenuItem
                  key={family.value}
                  onClick={() => setFontFamily(family.value)}
                  className={`cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-200 ${
                    currentFamily === family.value ? "bg-blue-50 dark:bg-blue-200 font-medium" : ""
                  }`}
                >
                  <span style={{ fontFamily: family.value }}>{family.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Font Family</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

