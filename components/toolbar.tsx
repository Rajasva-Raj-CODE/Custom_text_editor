'use client'

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Smile,
  Palette,
  Highlighter,
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
  Type,
  Subscript,
  Superscript,
  Minus,
  FileText,
  Table,
  Plus,
  Trash2,
  Split,
  Merge,
  Search,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import dynamic from 'next/dynamic'
import type { EmojiClickData } from 'emoji-picker-react'
import { FontSizeSelector } from './font-size-selector'
import { FontFamilySelector } from './font-family-selector'
import { SheetSizeSelector } from './sheet-size-selector'
import { FindReplace } from './find-replace'
import { ExportImport } from './export-import'
import { MediaDialogs } from './media-dialogs'
import { ToolbarButton } from './toolbar-button'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  const [findReplaceOpen, setFindReplaceOpen] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)

  useEffect(() => {
    if (!editor) return

    const updateCounts = () => {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length
      const chars = editor.storage.characterCount?.characters?.() || 0
      setWordCount(words)
      setCharacterCount(chars)
    }

    updateCounts()
    editor.on('update', updateCounts)
    return () => {
      editor.off('update', updateCounts)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }

  const handleClearAll = () => {
    if (!editor) return
    const confirmed = window.confirm('Clear the entire document?')
    if (!confirmed) return
    editor.chain().focus().clearContent(true).run()
  }

  return (
    <TooltipProvider>
      <div
        className="border-b border-blue-300/30 shadow-md p-3 flex flex-wrap items-center gap-1.5 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/90"
        style={{ background: 'linear-gradient(135deg, rgba(44, 131, 236, 0.1) 0%, rgba(135, 194, 50, 0.1) 100%)' }}
      >
        {/* Text Formatting */}
        <ToolbarButton
          editor={editor}
          icon={Bold}
          tooltip="Bold (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={() => editor.isActive('bold')}
        />
        <ToolbarButton
          editor={editor}
          icon={Italic}
          tooltip="Italic (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={() => editor.isActive('italic')}
        />
        <ToolbarButton
          editor={editor}
          icon={Underline}
          tooltip="Underline (Ctrl+U)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={() => editor.isActive('underline')}
        />
        <ToolbarButton
          editor={editor}
          icon={Strikethrough}
          tooltip="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={() => editor.isActive('strike')}
        />

        <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

        {/* Subscript/Superscript */}
        <ToolbarButton
          editor={editor}
          icon={Superscript}
          tooltip="Superscript"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={() => editor.isActive('superscript')}
        />
        <ToolbarButton
          editor={editor}
          icon={Subscript}
          tooltip="Subscript"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={() => editor.isActive('subscript')}
        />

        <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

        {/* Font Family & Size */}
        <FontFamilySelector editor={editor} />
        <FontSizeSelector editor={editor} />
        <SheetSizeSelector editor={editor} />

        <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

        {/* Text Color & Highlight */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-all hover:scale-110 ${editor.isActive('textStyle') ? 'text-blue-700' : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
                    }`}
                  style={{ color: editor.getAttributes('textStyle')?.color || undefined }}
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Text Color</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1">
                {['#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F472B6', '#6B7280', '#FFFFFF', '#B91C1C', '#B45309', '#047857', '#1D4ED8', '#6D28D9', '#DB2777'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => editor.chain().focus().setColor(c).run()}
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: c }}
                    aria-label={`Set text color ${c}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-8 w-10 p-0 border rounded"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                  aria-label="Custom text color"
                />
                <Button variant="outline" size="sm" onClick={() => editor.chain().focus().unsetColor().run()}>
                  Reset
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-all hover:scale-110 ${editor.isActive('highlight') ? 'text-blue-700' : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
                    }`}
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Highlight</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1">
                {['#FEF08A', '#FDE68A', '#FCA5A5', '#86EFAC', '#93C5FD', '#C4B5FD', '#FBCFE8', '#E5E7EB', '#F59E0B', '#FB923C', '#F87171', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => editor.chain().focus().setHighlight({ color: c }).run()}
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: c }}
                    aria-label={`Set highlight ${c}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-8 w-10 p-0 border rounded"
                  onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
                  aria-label="Custom highlight color"
                />
                <Button variant="outline" size="sm" onClick={() => editor.chain().focus().unsetHighlight().run()}>
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

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
                {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                  >
                    {level === 1 && <Heading1 className="h-4 w-4 mr-2" />}
                    {level === 2 && <Heading2 className="h-4 w-4 mr-2" />}
                    {level === 3 && <Heading3 className="h-4 w-4 mr-2" />}
                    Heading {level}
                  </DropdownMenuItem>
                ))}
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
        <ToolbarButton
          editor={editor}
          icon={List}
          tooltip="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={() => editor.isActive('bulletList')}
        />
        <ToolbarButton
          editor={editor}
          icon={ListOrdered}
          tooltip="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={() => editor.isActive('orderedList')}
        />
        <ToolbarButton
          editor={editor}
          icon={ListTodo}
          tooltip="Task List"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={() => editor.isActive('taskList')}
        />

        <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

        {/* Alignment */}
        <ToolbarButton
          editor={editor}
          icon={AlignLeft}
          tooltip="Align Left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={() => editor.isActive({ textAlign: 'left' })}
        />
        <ToolbarButton
          editor={editor}
          icon={AlignCenter}
          tooltip="Align Center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={() => editor.isActive({ textAlign: 'center' })}
        />
        <ToolbarButton
          editor={editor}
          icon={AlignRight}
          tooltip="Align Right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={() => editor.isActive({ textAlign: 'right' })}
        />
        <ToolbarButton
          editor={editor}
          icon={AlignJustify}
          tooltip="Justify"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={() => editor.isActive({ textAlign: 'justify' })}
        />

        <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

        {/* Block Elements */}
        <ToolbarButton
          editor={editor}
          icon={Quote}
          tooltip="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={() => editor.isActive('blockquote')}
        />
        <ToolbarButton
          editor={editor}
          icon={Code}
          tooltip="Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={() => editor.isActive('codeBlock')}
        />
        <ToolbarButton
          editor={editor}
          icon={Minus}
          tooltip="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

        {/* Media */}
        <MediaDialogs editor={editor} />

        {/* Table Menu */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={editor.isActive('table') ? 'default' : 'ghost'}
                  size="icon"
                  className={`transition-all hover:scale-110 ${editor.isActive('table')
                      ? 'text-white shadow-md'
                      : 'hover:bg-blue-50/50 text-blue-600 hover:text-blue-700'
                    }`}
                  style={editor.isActive('table') ? { background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' } : {}}
                >
                  <Table className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => insertTable(3, 3)}>Insert Table (3x3)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertTable(4, 4)}>Insert Table (4x4)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertTable(5, 5)}>Insert Table (5x5)</DropdownMenuItem>
                <DropdownMenuSeparator />
                {editor.isActive('table') && (
                  <>
                    <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Column Before
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Column After
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Column
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Row Before
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Row After
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Row
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => editor.chain().focus().mergeCells().run()}>
                      <Merge className="h-4 w-4 mr-2" />
                      Merge Cells
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().splitCell().run()}>
                      <Split className="h-4 w-4 mr-2" />
                      Split Cell
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()}>
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
        <ToolbarButton
          editor={editor}
          icon={Undo}
          tooltip="Undo (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={() => !editor.can().undo()}
        />
        <ToolbarButton
          editor={editor}
          icon={Redo}
          tooltip="Redo (Ctrl+Y)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={() => !editor.can().redo()}
        />

        <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />

        {/* Clear Formatting */}
        <ToolbarButton
          editor={editor}
          icon={Type}
          tooltip="Clear Formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />

        {/* Emoji Picker */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="transition-all hover:scale-110 hover:bg-blue-50/50 text-blue-600 hover:text-blue-700"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[340px]">
                <EmojiPicker
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    editor.chain().focus().insertContent(emojiData.emoji).run()
                  }}
                />
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Emoji</p>
          </TooltipContent>
        </Tooltip>

        <FindReplace editor={editor} open={findReplaceOpen} onOpenChange={setFindReplaceOpen} />

        <Separator orientation="vertical" className="h-8 mx-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #2c83ec 0%, #87c232 100%)' }} />


        {/* Actions */}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFindReplaceOpen(true)}
              className="transition-all hover:scale-110 hover:bg-blue-50/50 text-blue-600 hover:text-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Find & Replace (Ctrl+F)</p>
          </TooltipContent>
        </Tooltip>
        <ExportImport editor={editor} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="transition-all hover:scale-105 hover:bg-red-50/50 text-red-600 hover:text-red-700 font-semibold"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear All</p>
          </TooltipContent>
        </Tooltip>

        {/* Live Counters */}
        <div className="ml-auto mr-2 hidden sm:flex items-center gap-2 px-2 py-1 rounded-md border border-blue-300/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-600">Words</span>
            <span className="text-[11px] font-semibold text-gray-800">{wordCount ?? 0}</span>
          </div>
          <div className="h-3 w-px bg-blue-300/60" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-600">Chars</span>
            <span className="text-[11px] font-semibold text-gray-800">{characterCount ?? 0}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
