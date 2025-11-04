'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Editor } from '@tiptap/react'
import { LucideIcon } from 'lucide-react'

interface ToolbarButtonProps {
  editor: Editor
  icon: LucideIcon
  tooltip: string
  onClick: () => void
  isActive?: boolean | (() => boolean)
  disabled?: boolean | (() => boolean)
  variant?: 'default' | 'ghost'
}

export function ToolbarButton({
  editor,
  icon: Icon,
  tooltip,
  onClick,
  isActive = false,
  disabled = false,
  variant = 'ghost',
}: ToolbarButtonProps) {
  const active = typeof isActive === 'function' ? isActive() : isActive
  const isDisabled = typeof disabled === 'function' ? disabled() : disabled

  const activeStyle = active
    ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }
    : {}

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={active ? 'default' : variant}
            size="icon"
            onClick={onClick}
            disabled={isDisabled}
            className={`transition-all hover:scale-110 ${
              active
                ? 'text-white shadow-md'
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            } ${isDisabled ? 'opacity-30' : ''}`}
            style={activeStyle}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

