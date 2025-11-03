'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from '@/lib/tiptap-extensions'
import { Toolbar } from './toolbar'
import { useEffect, useState } from 'react'
import { useEditorStore } from '@/hooks/use-editor-store'
import { debounce } from 'lodash'
import { EditorProvider } from '@/contexts/editor-context'

interface TextEditorProps {
  initialContent?: string
  children?: React.ReactNode
}

export function TextEditor({ initialContent, children }: TextEditorProps) {
  const { addToHistory } = useEditorStore()
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const saveImageToLocalStorage = (imageData: string): string => {
    try {
      // Limit image size
      const imageSize = new Blob([imageData]).size
      const maxImageSize = 2 * 1024 * 1024 // 2MB per image
      
      if (imageSize > maxImageSize) {
        console.warn('Image too large to save to localStorage')
        return ''
      }
      
      // Clean up old images
      const existingImages = Object.keys(localStorage)
        .filter((key) => key.startsWith('editor-image-'))
      
      if (existingImages.length >= 20) {
        const sortedKeys = existingImages.sort((a, b) => {
          const timeA = parseInt(a.split('-').pop() || '0')
          const timeB = parseInt(b.split('-').pop() || '0')
          return timeA - timeB
        })
        // Remove oldest images
        for (let i = 0; i < existingImages.length - 19; i++) {
          try {
            localStorage.removeItem(sortedKeys[i])
          } catch (error) {
            console.error('Error removing old image:', error)
          }
        }
      }
      
      const key = `editor-image-${Date.now()}`
      localStorage.setItem(key, imageData)
      return key
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage quota exceeded for images')
        // Try to clear some old images
        try {
          const imageKeys = Object.keys(localStorage)
            .filter((key) => key.startsWith('editor-image-'))
            .sort((a, b) => {
              const timeA = parseInt(a.split('-').pop() || '0')
              const timeB = parseInt(b.split('-').pop() || '0')
              return timeA - timeB
            })
          // Remove oldest 5 images
          for (let i = 0; i < Math.min(5, imageKeys.length); i++) {
            localStorage.removeItem(imageKeys[i])
          }
          // Try saving again
          const key = `editor-image-${Date.now()}`
          localStorage.setItem(key, imageData)
          return key
        } catch (retryError) {
          console.error('Failed to save image after cleanup:', retryError)
          return ''
        }
      }
      console.error('Error saving image to localStorage:', error)
      return ''
    }
  }

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
            
            const reader = new FileReader()
            reader.onload = (e) => {
              const base64 = e.target?.result as string
              if (base64) {
                // Save to localStorage
                saveImageToLocalStorage(base64)
                
                const { state, dispatch } = view
                const { schema, tr } = state
                const imageNode = schema.nodes.image.create({
                  src: base64,
                })
                
                // Insert at drop position
                const newTr = tr.insert(coordinates.pos, imageNode)
                dispatch(newTr)
              }
            }
            reader.readAsDataURL(file)
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
              const reader = new FileReader()
              reader.onload = (e) => {
                const base64 = e.target?.result as string
                if (base64) {
                  // Save to localStorage
                  saveImageToLocalStorage(base64)
                  
                  const { state, dispatch } = view
                  const { schema } = state
                  const imageNode = schema.nodes.image.create({
                    src: base64,
                  })
                  const transaction = state.tr.replaceSelectionWith(imageNode)
                  dispatch(transaction)
                }
              }
              reader.readAsDataURL(file)
              return true
            }
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter((word) => word.length > 0).length
      const chars = editor.storage.characterCount?.characters() || 0
      setWordCount(words)
      setCharacterCount(chars)
      const debouncedSave = debounce(() => {
        try {
          // Only save if content changed significantly (not every keystroke)
          const contentSize = new Blob([content]).size
          if (contentSize < 10 * 1024 * 1024) { // Only save if less than 10MB
            addToHistory(content)
          }
        } catch (error) {
          console.error('Error saving to history:', error)
          // Silently fail - don't interrupt user experience
        }
      }, 2000) // Increased debounce to 2 seconds to reduce save frequency
      debouncedSave()
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
    <EditorProvider editor={editor}>
      <>
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
        </div>
        {children}
      </>
    </EditorProvider>
  )
}

