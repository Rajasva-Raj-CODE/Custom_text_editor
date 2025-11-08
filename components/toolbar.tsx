"use client";

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Smile,
  Palette,
  Highlighter,
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
  Trash2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import dynamic from "next/dynamic";
import type { EmojiClickData } from "emoji-picker-react";
import { FontSizeSelector } from "./font-size-selector";
import { FontFamilySelector } from "./font-family-selector";
import { SheetSizeSelector } from "./sheet-size-selector";
import { FindReplace } from "./find-replace";
import { ExportImport } from "./export-import";
import { MediaDialogs } from "./media-dialogs";
import { ToolbarButton } from "./toolbar-button";
import { HeadingSelector } from "./HeadingSelector";
import { SmartTableMenu } from "./table-selector";
import FieldInsert from "@/components/FieldInsert";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const updateCounts = () => {
      const text = editor.getText();
      const words = text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
      const chars = editor.storage.characterCount?.characters?.() || 0;
      setWordCount(words);
      setCharacterCount(chars);
    };

    updateCounts();
    editor.on("update", updateCounts);
    return () => {
      editor.off("update", updateCounts);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const handleClearAll = () => {
    if (!editor) return;
    const confirmed = window.confirm("Clear the entire document?");
    if (!confirmed) return;
    editor.chain().focus().clearContent(true).run();
  };
  const handleFieldInsert = (field: string) => {
    editor.chain().focus().insertContent(`{{${field}}}`).run();
  };

  return (
    <TooltipProvider>
      <div className="border-b border-gray-200/50 shadow-lg py-2 px-1 flex flex-wrap items-center gap-2 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/95  ">
        {/* Text Formatting */}
        <div className="flex items-center rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          <ToolbarButton
            editor={editor}
            icon={Bold}
            tooltip="Bold (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={() => editor.isActive("bold")}
          />
          <ToolbarButton
            editor={editor}
            icon={Italic}
            tooltip="Italic (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={() => editor.isActive("italic")}
          />
          <ToolbarButton
            editor={editor}
            icon={Underline}
            tooltip="Underline (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={() => editor.isActive("underline")}
          />
          <ToolbarButton
            editor={editor}
            icon={Strikethrough}
            tooltip="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={() => editor.isActive("strike")}
          />
        </div>
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />
        <div className="flex items-center   rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          {/* Subscript/Superscript */}
          <ToolbarButton
            editor={editor}
            icon={Superscript}
            tooltip="Superscript"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={() => editor.isActive("superscript")}
          />
          <ToolbarButton
            editor={editor}
            icon={Subscript}
            tooltip="Subscript"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={() => editor.isActive("subscript")}
          />
        </div>
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />

        {/* Font Family & Size */}
        <div className="flex items-center rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          <FontFamilySelector editor={editor} />
          <FontSizeSelector editor={editor} />
          <SheetSizeSelector editor={editor} />{" "}
        </div>

        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />
        <div className="flex items-center   rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          {/* Text Color & Highlight */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`transition-all hover:scale-110 ${
                      editor.isActive("textStyle")
                        ? "text-blue-700"
                        : "hover:bg-blue-50/50 text-blue-600 hover:text-blue-700"
                    }`}
                    style={{
                      color:
                        editor.getAttributes("textStyle")?.color || undefined,
                    }}
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
                <div className="grid grid-cols-7 ga">
                  {[
                    "#000000",
                    "#EF4444",
                    "#F59E0B",
                    "#10B981",
                    "#3B82F6",
                    "#8B5CF6",
                    "#F472B6",
                    "#6B7280",
                    "#FFFFFF",
                    "#B91C1C",
                    "#B45309",
                    "#047857",
                    "#1D4ED8",
                    "#6D28D9",
                    "#DB2777",
                  ].map((c) => (
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
                    onChange={(e) =>
                      editor.chain().focus().setColor(e.target.value).run()
                    }
                    aria-label="Custom text color"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().unsetColor().run()}
                  >
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
                    className={`transition-all hover:scale-110 ${
                      editor.isActive("highlight")
                        ? "text-blue-700"
                        : "hover:bg-blue-50/50 text-blue-600 hover:text-blue-700"
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
                <div className="grid grid-cols-7 ga">
                  {[
                    "#FEF08A",
                    "#FDE68A",
                    "#FCA5A5",
                    "#86EFAC",
                    "#93C5FD",
                    "#C4B5FD",
                    "#FBCFE8",
                    "#E5E7EB",
                    "#F59E0B",
                    "#FB923C",
                    "#F87171",
                    "#34D399",
                    "#60A5FA",
                    "#A78BFA",
                    "#F472B6",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        editor.chain().focus().setHighlight({ color: c }).run()
                      }
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
                    onChange={(e) =>
                      editor
                        .chain()
                        .focus()
                        .setHighlight({ color: e.target.value })
                        .run()
                    }
                    aria-label="Custom highlight color"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      editor.chain().focus().unsetHighlight().run()
                    }
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* Headings */}
          <HeadingSelector editor={editor} />
        </div>
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />
        <div className="flex items-center   rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          {/* Lists */}
          <ToolbarButton
            editor={editor}
            icon={List}
            tooltip="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={() => editor.isActive("bulletList")}
          />
          <ToolbarButton
            editor={editor}
            icon={ListOrdered}
            tooltip="Numbered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={() => editor.isActive("orderedList")}
          />
          <ToolbarButton
            editor={editor}
            icon={ListTodo}
            tooltip="Task List"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={() => editor.isActive("taskList")}
          />
        </div>
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />
        <div className="flex items-center   rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          {/* Alignment */}
          <ToolbarButton
            editor={editor}
            icon={AlignLeft}
            tooltip="Align Left"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={() => editor.isActive({ textAlign: "left" })}
          />
          <ToolbarButton
            editor={editor}
            icon={AlignCenter}
            tooltip="Align Center"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={() => editor.isActive({ textAlign: "center" })}
          />
          <ToolbarButton
            editor={editor}
            icon={AlignRight}
            tooltip="Align Right"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={() => editor.isActive({ textAlign: "right" })}
          />
          <ToolbarButton
            editor={editor}
            icon={AlignJustify}
            tooltip="Justify"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={() => editor.isActive({ textAlign: "justify" })}
          />
        </div>
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />
        <div className="flex items-center   rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          {/* Block Elements */}
          <ToolbarButton
            editor={editor}
            icon={Quote}
            tooltip="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={() => editor.isActive("blockquote")}
          />
          <ToolbarButton
            editor={editor}
            icon={Code}
            tooltip="Code Block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={() => editor.isActive("codeBlock")}
          />
          <ToolbarButton
            editor={editor}
            icon={Minus}
            tooltip="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            isActive={() => editor.isActive("horizontalRule")}
          />
        </div>
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />
        <div className="flex items-center rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          {/* Media */}
          <MediaDialogs editor={editor} />

          {/* Table Menu */}
          <SmartTableMenu editor={editor} />
        </div>

        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />
        <div className="flex items-center   rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          {/* History */}
          <ToolbarButton
            editor={editor}
            icon={Undo}
            tooltip="Undo (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            isActive={() => editor.isActive("undo")}
          />
          <ToolbarButton
            editor={editor}
            icon={Redo}
            tooltip="Redo (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            isActive={() => editor.isActive("redo")}
          />
        </div>
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />

        {/* Clear Formatting */}
        <div className="flex items-center   rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
          <ToolbarButton
            editor={editor}
            icon={Type}
            tooltip="Clear Formatting"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            isActive={() => editor.isActive("clearFormatting")}
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
                      editor
                        .chain()
                        .focus()
                        .insertContent(emojiData.emoji)
                        .run();
                    }}
                  />
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert Emoji</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />
        <div className="flex items-center   rounded-md bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05),_inset_0px_-1px_1px_rgba(0,0,0,0.05)] border border-gray-200">
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
        </div>
        <FieldInsert onInsert={handleFieldInsert} />
        <FindReplace
          editor={editor}
          open={findReplaceOpen}
          onOpenChange={setFindReplaceOpen}
        />
        <Separator
          orientation="vertical"
          className="h-8  shadow-sm"
          style={{
            background: "linear-gradient(135deg, #E6D8C3 0%, #CBB79A 100%)",
          }}
        />

        <div className="flex items-center rounded-md bg-gray-100 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
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
        </div>

        {/* Live Counters */}
        <div className="ml-auto mr-2 flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center ga">
            <span className="text-[10px] text-gray-600">Words</span>
            <span className="text-[11px] font-semibold text-gray-800">
              {wordCount ?? 0}
            </span>
          </div>
          <div className="h-3 w-px bg-blue-300/60" />
          <div className="flex items-center ga">
            <span className="text-[10px] text-gray-600">Chars</span>
            <span className="text-[11px] font-semibold text-gray-800">
              {characterCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
