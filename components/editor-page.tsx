'use client'

import { useState } from 'react'
import { TextEditor } from './text-editor'
import { ExportImport } from './export-import'
import { FindReplace } from './find-replace'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Search } from 'lucide-react'

export function EditorPage() {
  const [findReplaceOpen, setFindReplaceOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)' }}>
        {/* Header */}
        <header 
          className="border-b border-blue-300/30 shadow-lg px-6 py-4 flex items-center justify-between backdrop-blur-sm"
          style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <span className="text-2xl">✏️</span>
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Text Editor One
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFindReplaceOpen(true)}
                  className="transition-all hover:scale-110 hover:bg-white/20 rounded-lg text-white hover:text-white"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Find & Replace (Ctrl+F)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)' }}>
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <TextEditor>
                {/* Dialogs - rendered inside editor context */}
                <FindReplace open={findReplaceOpen} onOpenChange={setFindReplaceOpen} />
              </TextEditor>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

