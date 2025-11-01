'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from '@/lib/tiptap-extensions'
import { Toolbar } from './toolbar'
import { ExportImport } from './export-import'
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
          <div className="flex-1 overflow-auto relative">
            <div 
              className={`rounded-2xl shadow-2xl transition-all relative overflow-hidden ${
                isDragging 
                  ? 'border-2' 
                  : 'border-2'
              }`}
              style={{
                background: isDragging 
                  ? 'linear-gradient(to bottom right, rgba(44, 131, 236, 0.1), rgba(135, 194, 50, 0.1))'
                  : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.98), rgba(227, 242, 253, 0.3), rgba(232, 245, 233, 0.3))',
                borderImage: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%) 1',
                borderStyle: 'solid',
                boxShadow: isDragging 
                  ? '0 20px 25px -5px rgba(44, 131, 236, 0.3), 0 10px 10px -5px rgba(135, 194, 50, 0.2)'
                  : '0 20px 25px -5px rgba(44, 131, 236, 0.1), 0 10px 10px -5px rgba(135, 194, 50, 0.1)',
              }}
            >
              {!isDragging && (
                <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(44, 131, 236, 0.03) 0%, rgba(135, 194, 50, 0.03) 100%)' }} />
              )}
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 backdrop-blur-sm rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(44, 131, 236, 0.15) 0%, rgba(135, 194, 50, 0.15) 100%)' }}>
                  <div className="text-white px-8 py-4 rounded-xl shadow-2xl text-lg font-bold animate-pulse border-2 border-white/50" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }}>
                    ✨ Drop image here ✨
                  </div>
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
          </div>
          <div 
            className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 text-sm border-t border-blue-300/30 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }}
          >
            <div className="flex items-center gap-3 sm:gap-6 font-medium w-full sm:w-auto justify-center sm:justify-start">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md">
                <span className="text-white/90 text-xs sm:text-sm">Words:</span>
                <span className="font-bold text-white text-xs sm:text-sm">{wordCount}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md">
                <span className="text-white/90 text-xs sm:text-sm">Chars:</span>
                <span className="font-bold text-white text-xs sm:text-sm">{characterCount}</span>
              </div>
            </div>
            <ExportImport />
          </div>
        </div>
        {children}
      </>
    </EditorProvider>
  )
}

