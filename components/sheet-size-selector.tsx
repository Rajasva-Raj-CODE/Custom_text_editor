'use client'

import { Extension } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Editor } from '@tiptap/react'
import { FileText, Ruler } from 'lucide-react'
import { useEffect, useState } from 'react'

// Sheet Size Types and Constants
export type SheetSizeType = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'Tabloid'

export interface SheetSize {
  type: SheetSizeType
  width: number
  height: number
}

export const SHEET_SIZES: Record<SheetSizeType, SheetSize> = {
  A4: { type: 'A4', width: 210, height: 297 },
  Letter: { type: 'Letter', width: 216, height: 279 },
  Legal: { type: 'Legal', width: 216, height: 356 },
  A3: { type: 'A3', width: 297, height: 420 },
  A5: { type: 'A5', width: 148, height: 210 },
  Tabloid: { type: 'Tabloid', width: 279, height: 432 },
}

const getSavedSize = (): SheetSize | null => {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem('tiptap-sheet-size')
    if (!saved) return null
    const parsed = JSON.parse(saved)
    return parsed?.type && parsed?.width && parsed?.height ? parsed : null
  } catch {
    return null
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sheetSize: { setSheetSize: (size: SheetSize) => ReturnType }
  }
  interface Storage {
    sheetSize: { sheetSize: SheetSize; setSheetSize: (size: SheetSize) => void; getSheetSize: () => SheetSize }
  }
}

// Sheet Size Extension
export const SheetSizeExtension = Extension.create({
  name: 'sheetSize',
  addStorage() {
    const storage = {
      sheetSize: getSavedSize() || SHEET_SIZES.A4,
      setSheetSize: (size: SheetSize) => {
        storage.sheetSize = size
        if (typeof window !== 'undefined') {
          localStorage.setItem('tiptap-sheet-size', JSON.stringify(size))
        }
      },
      getSheetSize: () => storage.sheetSize,
    }
    return storage
  },
  addCommands() {
    return {
      setSheetSize: (size: SheetSize) => ({ editor }) => {
        editor.storage.sheetSize.setSheetSize(size)
        window.dispatchEvent(new CustomEvent('sheetSizeChanged', { detail: size }))
        return true
      },
    }
  },
})

const SHEET_OPTIONS = [
  { type: 'A4' as const, label: 'A4', dims: '210 × 297 mm' },
  { type: 'Letter' as const, label: 'Letter', dims: '8.5 × 11 in' },
  { type: 'Legal' as const, label: 'Legal', dims: '8.5 × 14 in' },
  { type: 'A3' as const, label: 'A3', dims: '297 × 420 mm' },
  { type: 'A5' as const, label: 'A5', dims: '148 × 210 mm' },
  { type: 'Tabloid' as const, label: 'Tabloid', dims: '11 × 17 in' },
]

export function SheetSizeSelector({ editor }: { editor: Editor }) {
  const [currentSize, setCurrentSize] = useState<SheetSize>(SHEET_SIZES.A4)

  useEffect(() => {
    if (!editor?.storage.sheetSize) return
    setCurrentSize(editor.storage.sheetSize.getSheetSize())
    const handleChange = (e: Event) => setCurrentSize((e as CustomEvent<SheetSize>).detail)
    window.addEventListener('sheetSizeChanged', handleChange)
    return () => window.removeEventListener('sheetSizeChanged', handleChange)
  }, [editor])

  if (!editor?.storage.sheetSize) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105 min-w-[100px] justify-start">
                <Ruler className="h-4 w-4 mr-2" />
                <span className="truncate">{currentSize.type}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px] bg-white shadow-lg border border-gray-200">
              {SHEET_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.type}
                  onClick={() => editor.commands.setSheetSize(SHEET_SIZES[opt.type])}
                  className={`cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-200${currentSize.type === opt.type ? 'bg-blue-50 dark:bg-blue-200 font-medium' : ''}`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-gray-500">{opt.dims}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sheet Size</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

