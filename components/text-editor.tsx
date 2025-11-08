'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from '@/components/tiptap-extensions'
import { Toolbar } from './toolbar'
import { useEffect, useState } from 'react'
import { fileToBase64 } from '@/lib/editor-utils'
import type { SheetSize } from '@/components/sheet-size-selector'

interface TextEditorProps {
  initialContent?: string
  children?: React.ReactNode
}

export function TextEditor({ initialContent, children }: TextEditorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [sheetSize, setSheetSize] = useState<SheetSize | null>(null)

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
    // counts are handled inside Toolbar
  })

  useEffect(() => {
    if (editor && initialContent) editor.commands.setContent(initialContent)
  }, [editor, initialContent])

  useEffect(() => {
    if (!editor?.storage.sheetSize) return
    setSheetSize(editor.storage.sheetSize.getSheetSize())
    const handleChange = (e: Event) => setSheetSize((e as CustomEvent<SheetSize>).detail)
    window.addEventListener('sheetSizeChanged', handleChange)
    return () => window.removeEventListener('sheetSizeChanged', handleChange)
  }, [editor])


  useEffect(() => {
    if (!sheetSize || !editor) return
    const applyStyles = () => {
      const el = document.querySelector('.ProseMirror') as HTMLElement
      if (!el) return setTimeout(applyStyles, 100)
      const mmToPx = 96 / 25.4
      const widthPx = sheetSize.width * mmToPx
      Object.assign(el.style, {
        maxWidth: `${widthPx}px`,
        minHeight: `${sheetSize.height * mmToPx}px`,
        width: `${widthPx}px`,
        margin: '0 auto',
        backgroundColor: '#ffffff',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        pageBreakInside: 'avoid',
      })
      el.setAttribute('data-sheet-size', sheetSize.type)
    }
    applyStyles()
  }, [sheetSize, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toolbar editor={editor} />
      <div className="relative pt-15">
        <EditorContent editor={editor} />
      </div>
      {children}
    </div>
  )
}

