"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Editor } from "@tiptap/react"

interface Props {
  editor: Editor
  icon: LucideIcon
  tooltip: string
  onClick: () => void
  isActive: () => boolean
}

export function ToolbarButton({ editor, icon: Icon, tooltip, onClick, isActive }: Props) {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!editor) return

    const update = () => setTick(x => x + 1)

    editor.on("selectionUpdate", update)
    editor.on("update", update)
    editor.on("transaction", update)

    return () => {
      editor.off("selectionUpdate", update)
      editor.off("update", update)
      editor.off("transaction", update)
    }
  }, [editor])

  const active = isActive()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={active ? "default" : "ghost"}
            onClick={onClick}
            className={active ? "bg-blue-600 text-white" : "text-blue-600"}
          >
            <Icon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
