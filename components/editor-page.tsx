'use client'

import { TextEditor } from './text-editor'
import { TooltipProvider } from '@/components/ui/tooltip'

export function EditorPage() {
  

  return (
    <TooltipProvider>

  
        <div className="overflow-auto p-6 h-screen" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)' }}>
        
            
              <TextEditor />
  
        </div>

    </TooltipProvider>
  )
}

