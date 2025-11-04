'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from '@/components/tiptap-extensions'
import { Toolbar } from './toolbar'
import { useEffect, useState } from 'react'
import { fileToBase64 } from '@/lib/editor-utils'

interface TextEditorProps {
  initialContent?: string
  children?: React.ReactNode
}

export function TextEditor({ initialContent, children }: TextEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const editor = useEditor({
    extensions,
    content: initialContent || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
      },
      handleDrop: (view, event, slice, moved) => {
        setIsDragging(false)
        
        // Handle image files dropped into editor
        if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            event.stopPropagation()
            
            // Get drop position
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })
            
            if (!coordinates) return true
            
            fileToBase64(file).then((base64) => {
              const { state, dispatch } = view
              const { schema, tr } = state
              const imageNode = schema.nodes.image.create({
                src: base64,
              })
              const newTr = tr.insert(coordinates.pos, imageNode)
              dispatch(newTr)
            }).catch((error) => {
              console.error('Error processing dropped image:', error)
            })
            return true
          }
        }
        
        // Let ProseMirror handle the drop (for moving nodes)
        return false
      },
      handleDOMEvents: {
        dragover: (view, event) => {
          if (event.dataTransfer && event.dataTransfer.types.includes('Files')) {
            setIsDragging(true)
          }
          return false
        },
        dragleave: () => {
          setIsDragging(false)
          return false
        },
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || [])
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
            fileToBase64(file).then((base64) => {
              const { state, dispatch } = view
              const { schema } = state
              const imageNode = schema.nodes.image.create({
                src: base64,
              })
              const transaction = state.tr.replaceSelectionWith(imageNode)
              dispatch(transaction)
            }).catch((error) => {
              console.error('Error processing pasted image:', error)
            })
              return true
            }
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter((word) => word.length > 0).length
      const chars = editor.storage.characterCount?.characters() || 0
      setWordCount(words)
      setCharacterCount(chars)
    },
  })

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  useEffect(() => {
    if (editor) {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter((word) => word.length > 0).length
      const chars = editor.storage.characterCount?.characters() || 0
      setWordCount(words)
      setCharacterCount(chars)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} />
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-blue-300/40 rounded-md shadow-sm px-2 py-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-600">Words</span>
            <span className="text-[11px] font-semibold text-gray-800">{wordCount}</span>
          </div>
          <div className="h-3 w-px bg-blue-300/60" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-600">Chars</span>
            <span className="text-[11px] font-semibold text-gray-800">{characterCount}</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

