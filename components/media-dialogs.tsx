'use client'

import { useState, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Link, Image as ImageIcon, Youtube } from 'lucide-react'
import { fileToBase64 } from '@/lib/editor-utils'


interface MediaDialogsProps {
  editor: Editor
}

export function MediaDialogs({ editor }: MediaDialogsProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    try {
      const base64 = await fileToBase64(file)
      editor.chain().focus().setImage({ src: base64 }).run()
      setShowImageDialog(false)
      setImageUrl('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const setLink = () => {
    if (!linkUrl) {
      setShowLinkDialog(false)
      return
    }

    const { from, to } = editor.state.selection
    const hasSelection = to > from

    if (hasSelection) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    } else {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a>`)
        .run()
    }

    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const setImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setShowImageDialog(false)
      setImageUrl('')
    }
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

  return (
    <>
      {/* Link Dialog */}
      <TooltipProvider>
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
                  <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={setLink}>Insert</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Link</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Image Dialog */}
      <TooltipProvider>
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
                  <div className="flex gap-2 border-b border-gray-200 pb-3">
                    <Button
                      variant={imageSource === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageSource('url')}
                    >
                      URL
                    </Button>
                    <Button
                      variant={imageSource === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageSource('upload')}
                    >
                      Upload
                    </Button>
                  </div>

                  {imageSource === 'url' && (
                    <div>
                      <Label htmlFor="image-url" className="text-sm font-medium">Image URL</Label>
                      <Input
                        id="image-url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setImage()
                          }
                        }}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button onClick={setImage} disabled={!imageUrl}>
                          Insert
                        </Button>
                      </div>
                    </div>
                  )}

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
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Choose Image
                        </Button>
                        <p className="text-sm text-gray-500 mt-3">Supports JPG, PNG, GIF, WebP, etc.</p>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowImageDialog(false)}>
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
      </TooltipProvider>

      {/* Video Dialog */}
      <TooltipProvider>
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
                      className="mt-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setVideo()
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={setVideo}>Insert</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert YouTube Video</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}

