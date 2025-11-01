'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from '@/lib/tiptap-extensions'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Link,
  Image as ImageIcon,
  Table,
  Youtube,
  Type,
  Highlighter,
  Subscript,
  Superscript,
  Minus,
  FileText,
  Plus,
  Trash2,
  Columns,
  Rows,
  Split,
  Merge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState, useRef, useEffect } from 'react'
import { ColorPicker } from './color-picker'
import { FontSizeSelector } from './font-size-selector'
import { FontFamilySelector } from './font-family-selector'
import type { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [localStorageImages, setLocalStorageImages] = useState<string[]>([])
  const [imageSource, setImageSource] = useState<'url' | 'localStorage' | 'upload'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load images from localStorage
    const storedImages = Object.keys(localStorage)
      .filter((key) => key.startsWith('editor-image-'))
      .map((key) => localStorage.getItem(key) || '')
      .filter((img) => img !== '')
    setLocalStorageImages(storedImages)
  }, [])

  if (!editor) {
    return null
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    }
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const saveImageToLocalStorage = (imageData: string): string => {
    try {
      // Limit image size - compress or skip if too large
      const imageSize = new Blob([imageData]).size
      const maxImageSize = 2 * 1024 * 1024 // 2MB per image
      
      if (imageSize > maxImageSize) {
        console.warn('Image too large to save to localStorage, skipping...')
        return ''
      }
      
      // Clean up old images if storage is getting full
      const existingImages = Object.keys(localStorage)
        .filter((key) => key.startsWith('editor-image-'))
      
      // Keep only last 20 images
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
      setLocalStorageImages((prev) => {
        const updated = [...prev, imageData]
        // Keep only last 20 in state too
        return updated.slice(-20)
      })
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
          setLocalStorageImages((prev) => [...prev.slice(-15), imageData])
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      if (base64) {
        saveImageToLocalStorage(base64)
        editor.chain().focus().setImage({ src: base64 }).run()
        setShowImageDialog(false)
        setImageUrl('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const setImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setShowImageDialog(false)
      setImageUrl('')
    }
  }

  const selectLocalStorageImage = (imageData: string) => {
    editor.chain().focus().setImage({ src: imageData }).run()
    setShowImageDialog(false)
    setImageUrl('')
  }

  const setVideo = () => {
    if (videoUrl) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = videoUrl.match(youtubeRegex)
      if (match) {
        editor.chain().focus().setYoutubeVideo({
          src: `https://www.youtube.com/embed/${match[1]}`,
        }).run()
      }
    }
    setShowVideoDialog(false)
    setVideoUrl('')
  }

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }

  return (
    <TooltipProvider>
      <div 
        className="border-b border-blue-300/30 shadow-md p-3 flex flex-wrap items-center gap-1.5 sticky top-0 z-50 backdrop-blur-sm"
        style={{ background: 'linear-gradient(135deg, rgba(44, 131, 236, 0.1) 0%, rgba(135, 194, 50, 0.1) 100%)' }}
      >
      {/* Text Formatting */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('bold') 
                ? 'text-white shadow-md' 
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            }`}
            style={editor.isActive('bold') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bold (Ctrl+B)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('italic') 
                ? 'text-white shadow-md' 
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            }`}
            style={editor.isActive('italic') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Italic (Ctrl+I)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('underline') 
                ? 'text-white shadow-md' 
                : 'hover:bg-green-50/50 text-green-600 hover:text-green-700'
            }`}
            style={editor.isActive('underline') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Underline (Ctrl+U)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('strike') 
                ? 'text-white shadow-md' 
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            }`}
            style={editor.isActive('strike') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Strikethrough</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

      {/* Subscript/Superscript */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('superscript') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('superscript') 
                ? 'text-white shadow-md' 
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            }`}
            style={editor.isActive('superscript') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <Superscript className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Superscript</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('subscript') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('subscript') 
                ? 'text-white shadow-md' 
                : 'hover:bg-green-50/50 text-green-600 hover:text-green-700'
            }`}
            style={editor.isActive('subscript') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <Subscript className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Subscript</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

      {/* Font Family */}
      <FontFamilySelector editor={editor} />

      {/* Font Size */}
      <FontSizeSelector editor={editor} />

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Color & Highlight */}
      <ColorPicker editor={editor} type="text" />
      <ColorPicker editor={editor} type="highlight" />

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="transition-all hover:scale-105">
                <Heading1 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="h-4 w-4 mr-2" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4 mr-2" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="h-4 w-4 mr-2" />
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
          >
            Heading 4
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 5 }).run()
            }
          >
            Heading 5
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 6 }).run()
            }
          >
            Heading 6
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
            <FileText className="h-4 w-4 mr-2" />
            Paragraph
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Headings</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

      {/* Lists */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('bulletList') 
                ? 'text-white shadow-md' 
                : 'hover:bg-green-50/50 text-green-600 hover:text-green-700'
            }`}
            style={editor.isActive('bulletList') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bullet List</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('orderedList') 
                ? 'text-white shadow-md' 
                : 'hover:bg-green-50/50 text-green-600 hover:text-green-700'
            }`}
            style={editor.isActive('orderedList') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Numbered List</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('taskList') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('taskList') 
                ? 'text-white shadow-md' 
                : 'hover:bg-green-50/50 text-green-600 hover:text-green-700'
            }`}
            style={editor.isActive('taskList') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <ListTodo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Task List</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

      {/* Alignment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive({ textAlign: 'left' }) 
                ? 'text-white shadow-md' 
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            }`}
            style={editor.isActive({ textAlign: 'left' }) ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Align Left</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive({ textAlign: 'center' }) 
                ? 'text-white shadow-md' 
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            }`}
            style={editor.isActive({ textAlign: 'center' }) ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Align Center</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive({ textAlign: 'right' }) 
                ? 'text-white shadow-md' 
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            }`}
            style={editor.isActive({ textAlign: 'right' }) ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Align Right</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive({ textAlign: 'justify' }) 
                ? 'text-white shadow-md' 
                : 'hover:bg-green-50/50 text-green-600 hover:text-green-700'
            }`}
            style={editor.isActive({ textAlign: 'justify' }) ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Justify</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

      {/* Block Elements */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('blockquote') 
                ? 'text-white shadow-md' 
                : 'hover:bg-green-50/50 text-green-600 hover:text-green-700'
            }`}
            style={editor.isActive('blockquote') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Blockquote</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            size="icon"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`transition-all hover:scale-110 ${
              editor.isActive('codeBlock') 
                ? 'text-white shadow-md' 
                : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
            }`}
            style={editor.isActive('codeBlock') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
          >
            <Code className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Code Block</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="transition-all hover:scale-110 hover:bg-blue-50/50 text-blue-600 hover:text-blue-700"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Horizontal Rule</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

      {/* Media */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button 
                variant={editor.isActive('link') ? 'default' : 'ghost'} 
                size="icon"
                className={`transition-all hover:scale-110 ${
                  editor.isActive('link') 
                    ? 'text-white shadow-md' 
                    : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
                }`}
                style={editor.isActive('link') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
              >
                <Link className="h-4 w-4" />
              </Button>
            </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="link-url" className="text-sm font-medium">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-2 transition-all focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setLink()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLinkDialog(false)}
              className="transition-all hover:scale-105"
            >
              Cancel
            </Button>
            <Button 
              onClick={setLink}
              className="transition-all hover:scale-105"
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insert Link</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="transition-all hover:scale-110 hover:bg-green-50/50 text-green-600 hover:text-green-700"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Source Selection */}
            <div className="flex gap-2 border-b border-gray-200 pb-3">
              <Button
                variant={imageSource === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageSource('url')}
                className="transition-all hover:scale-105"
              >
                URL
              </Button>
              <Button
                variant={imageSource === 'localStorage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageSource('localStorage')}
                className="transition-all hover:scale-105"
              >
                LocalStorage
              </Button>
              <Button
                variant={imageSource === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageSource('upload')}
                className="transition-all hover:scale-105"
              >
                Upload
              </Button>
            </div>

            {/* URL Input */}
            {imageSource === 'url' && (
              <div>
                <Label htmlFor="image-url" className="text-sm font-medium">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2 transition-all focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setImage()
                    }
                  }}
                />
                <div className="mt-3 flex justify-end">
                  <Button 
                    onClick={setImage} 
                    disabled={!imageUrl}
                    className="transition-all hover:scale-105"
                  >
                    Insert
                  </Button>
                </div>
              </div>
            )}

            {/* LocalStorage Images */}
            {imageSource === 'localStorage' && (
              <div>
                <Label className="text-sm font-medium">Select from LocalStorage</Label>
                {localStorageImages.length === 0 ? (
                  <div className="mt-3 p-6 border-2 border-dashed border-gray-200 rounded-lg text-center">
                    <p className="text-sm text-gray-500">
                      No images stored in localStorage. Upload images first.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 mt-3 max-h-64 overflow-y-auto p-2">
                    {localStorageImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative cursor-pointer border-2 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-md transition-all group"
                        onClick={() => selectLocalStorageImage(img)}
                      >
                        <img
                          src={img}
                          alt={`Stored image ${index + 1}`}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* File Upload */}
            {imageSource === 'upload' && (
              <div>
                <Label htmlFor="image-upload" className="text-sm font-medium">Upload Image</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="transition-all hover:scale-105 hover:shadow-md"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">
                    Supports JPG, PNG, GIF, WebP, etc.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowImageDialog(false)}
              className="transition-all hover:scale-105"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insert Image</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="transition-all hover:scale-110 hover:bg-green-50/50 text-green-600 hover:text-green-700"
              >
                <Youtube className="h-4 w-4" />
              </Button>
            </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Insert YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="video-url" className="text-sm font-medium">YouTube URL</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-2 transition-all focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setVideo()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowVideoDialog(false)}
              className="transition-all hover:scale-105"
            >
              Cancel
            </Button>
            <Button 
              onClick={setVideo}
              className="transition-all hover:scale-105"
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insert YouTube Video</p>
        </TooltipContent>
      </Tooltip>

      {/* Table Menu */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={editor.isActive('table') ? 'default' : 'ghost'} 
                size="icon"
                className={`transition-all hover:scale-110 ${
                  editor.isActive('table') 
                    ? 'text-white shadow-md' 
                    : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
                }`}
                style={editor.isActive('table') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
              >
                <Table className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => insertTable(3, 3)}>
            Insert Table (3x3)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertTable(4, 4)}>
            Insert Table (4x4)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertTable(5, 5)}>
            Insert Table (5x5)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {editor.isActive('table') && (
            <>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnBefore().run()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column After
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Column
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowBefore().run()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row After
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Row
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().mergeCells().run()}
              >
                <Merge className="h-4 w-4 mr-2" />
                Merge Cells
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().splitCell().run()}
              >
                <Split className="h-4 w-4 mr-2" />
                Split Cell
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Table
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Table</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

      {/* History */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="transition-all hover:scale-110 hover:bg-blue-50/50 text-blue-600 hover:text-blue-700 disabled:opacity-30"
          >
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="transition-all hover:scale-110 hover:bg-blue-50/50 text-blue-600 hover:text-blue-700 disabled:opacity-30"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo (Ctrl+Y)</p>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

      {/* Clear Formatting */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className="transition-all hover:scale-110 hover:bg-green-50/50 text-green-600 hover:text-green-700"
          >
            <Type className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Clear Formatting</p>
        </TooltipContent>
      </Tooltip>
      </div>
    </TooltipProvider>
  )
}

