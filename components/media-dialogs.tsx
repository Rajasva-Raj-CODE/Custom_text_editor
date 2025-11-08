"use client";

import { useState, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, Image as ImageIcon, Youtube } from "lucide-react";
import { fileToBase64 } from "@/lib/editor-utils";

interface MediaDialogsProps {
  editor: Editor;
}

export function MediaDialogs({ editor }: MediaDialogsProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
      const base64 = await fileToBase64(file);
      editor.chain().focus().setImage({ src: base64 }).run();
      setShowImageDialog(false);
      setImageUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const setLink = () => {
    if (!linkUrl) {
      setShowLinkDialog(false);
      return;
    }

    const { from, to } = editor.state.selection;
    const hasSelection = to > from;

    if (hasSelection) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a>`
        )
        .run();
    }

    setShowLinkDialog(false);
    setLinkUrl("");
  };

  const setImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setShowImageDialog(false);
      setImageUrl("");
    }
  };

  const setVideo = () => {
    if (videoUrl) {
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = videoUrl.match(youtubeRegex);
      if (match) {
        editor
          .chain()
          .focus()
          .setYoutubeVideo({
            src: `https://www.youtube.com/embed/${match[1]}`,
          })
          .run();
      }
    }
    setShowVideoDialog(false);
    setVideoUrl("");
  };

  return (
    <>
  {/* Link Dialog (Themed: Blue/Primary) */}
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogTrigger asChild>
          <Button
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            size="xs"
            className={`transition-all hover:scale-110 ${
              editor.isActive('link')
                ? 'text-blue-600 '
                : 'hover:bg-blue-100/50 text-blue-600 hover:text-blue-700'
            }`}
       
          >
            <Link className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {/* ENHANCEMENT: Added shadow and refined background */}
        <DialogContent className="sm:max-w-[450px] bg-white/95 border-blue-300 shadow-xl">
          <DialogHeader>
            {/* ENHANCEMENT: Added icon to title */}
            <DialogTitle className="text-xl font-bold text-blue-700 flex items-center gap-2">
                <Link className="h-5 w-5" /> Insert Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="link-url" className="text-sm font-medium text-blue-800">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                // ENHANCEMENT: Refined input style
                className="mt-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-blue-200 bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setLink()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            {/* ENHANCEMENT: Clearer hover for Cancel button */}
            <Button variant="outline" onClick={() => setShowLinkDialog(false)} className="hover:bg-blue-100/50 border-gray-300">
              Cancel
            </Button>
            {/* Colorized Insert Button */}
            <Button onClick={setLink} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipTrigger>
    <TooltipContent>
      <p>Insert Link</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>



{/* Image Dialog (Themed: Vibrant Green) */}
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="transition-all hover:scale-110 hover:bg-green-100/50 text-green-700 hover:text-green-800"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {/* ENHANCEMENT: Added shadow and refined background */}
        <DialogContent className="max-w-2xl bg-white/95 border-green-300 shadow-xl">
          <DialogHeader>
            {/* ENHANCEMENT: Added icon to title */}
            <DialogTitle className="text-xl font-bold text-green-700 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> Insert Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* ENHANCEMENT: Lighter divider color against white background */}
            <div className="flex gap-2 border-b border-gray-200 pb-3">
              <Button
                variant={imageSource === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageSource('url')}
                className={imageSource === 'url' ? 'bg-green-600 hover:bg-green-700 text-white font-medium' : 'border-gray-300 text-green-600 hover:bg-green-100/50'}
              >
                URL
              </Button>
              <Button
                variant={imageSource === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageSource('upload')}
                className={imageSource === 'upload' ? 'bg-green-600 hover:bg-green-700 text-white font-medium' : 'border-gray-300 text-green-600 hover:bg-green-100/50'}
              >
                Upload
              </Button>
            </div>

            {imageSource === 'url' && (
              <div>
                <Label htmlFor="image-url" className="text-sm font-medium text-green-800">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  // ENHANCEMENT: Refined input style
                  className="mt-2 transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 border-green-200 bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setImage()
                    }
                  }}
                />
                <div className="mt-3 flex justify-end">
                  {/* Colorized Insert Button */}
                  <Button onClick={setImage} disabled={!imageUrl} className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-all">
                    Insert
                  </Button>
                </div>
              </div>
            )}

            {imageSource === 'upload' && (
              <div>
                <Label htmlFor="image-upload" className="text-sm font-medium text-green-800">Upload Image</Label>
                {/* ENHANCEMENT: Darker border and hover effect on dropzone */}
                <div className="mt-2 border-2 border-dashed border-green-400 rounded-lg p-8 text-center hover:border-green-600 hover:bg-green-50 transition-all cursor-pointer">
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {/* Colorized Choose Image Button */}
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-green-600 text-green-700 hover:bg-green-100/50 font-medium">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">Supports JPG, PNG, GIF, WebP, etc.</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {/* ENHANCEMENT: Clearer hover for Cancel button */}
            <Button variant="outline" onClick={() => setShowImageDialog(false)} className="hover:bg-green-100/50 border-gray-300">
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


{/* Video Dialog (Themed: YouTube Red) */}
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="transition-all hover:scale-110 hover:bg-red-50/50 text-red-600 hover:text-red-700"
          >
            <Youtube className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        {/* ENHANCEMENT: Added shadow and refined background */}
        <DialogContent className="sm:max-w-[450px] bg-white/95 border-red-300 shadow-xl">
          <DialogHeader>
            {/* ENHANCEMENT: Added icon to title */}
            <DialogTitle className="text-xl font-bold text-red-700 flex items-center gap-2">
                <Youtube className="h-5 w-5" /> Insert YouTube Video
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="video-url" className="text-sm font-medium text-red-800">YouTube URL</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                // ENHANCEMENT: Refined input style
                className="mt-2 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 border-red-200 bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setVideo()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            {/* ENHANCEMENT: Clearer hover for Cancel button */}
            <Button variant="outline" onClick={() => setShowVideoDialog(false)} className="hover:bg-red-100/50 border-gray-300">
              Cancel
            </Button>
            {/* Colorized Insert Button */}
            <Button onClick={setVideo} className="bg-red-600 hover:bg-red-700 text-white font-semibold transition-all">Insert</Button>
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
  );
}
