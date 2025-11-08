"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Repeat, Replace, Search } from "lucide-react";

interface FindReplaceProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FindReplace({ editor, open, onOpenChange }: FindReplaceProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  // Simple mode only

  if (!editor) return null;

  const buildRegex = () => {
    if (!findText) return null;
    try {
      const pattern = findText.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
      return new RegExp(pattern, "gi");
    } catch {
      return null;
    }
  };

  const findMatches = () => {
    if (!findText) {
      setMatches([]);
      return;
    }
    const content = editor.getText();
    const regex = buildRegex();
    if (!regex) {
      setMatches([]);
      return;
    }
    const found: number[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      found.push(match.index);
    }
    setMatches(found);
    if (found.length > 0) {
      setMatchIndex(0);
      highlightMatch(found[0]);
    }
  };

  const highlightMatch = (position: number) => {
    const content = editor.getText();
    const length = findText.length;
    editor.commands.setTextSelection({
      from: position,
      to: position + length,
    });
  };

  const replace = () => {
    if (!findText || matches.length === 0) return;
    const start = matches[matchIndex];
    const end = start + findText.length;
    editor.commands.setTextSelection({ from: start, to: end });
    editor.chain().focus().insertContent(replaceText).run();
    // Recompute matches after replacement
    setTimeout(findMatches, 0);
  };

  const replaceAll = () => {
    if (!findText) return;
    const regex = buildRegex();
    if (!regex) return;
    const content = editor.getHTML();
    const newContent = content.replace(regex, replaceText);
    editor.commands.setContent(newContent);
    setMatches([]);
  };

  const prevMatch = () => {
    if (matches.length === 0) return;
    const prev = (matchIndex - 1 + matches.length) % matches.length;
    setMatchIndex(prev);
    highlightMatch(matches[prev]);
  };

  // Simple mode: no keyboard navigation

  const currentPreview = () => {
    if (matches.length === 0) return null;
    const start = Math.max(0, matches[matchIndex] - 30);
    const end = Math.min(
      editor.getText().length,
      matches[matchIndex] + findText.length + 30
    );
    const before = editor.getText().slice(start, matches[matchIndex]);
    const match = editor
      .getText()
      .slice(matches[matchIndex], matches[matchIndex] + findText.length);
    const after = editor
      .getText()
      .slice(matches[matchIndex] + findText.length, end);
    return (
      <p className="text-sm mt-2 px-2 py-1 rounded-md bg-muted">
        <span className="text-muted-foreground">{before}</span>
        <span className="bg-yellow-200 text-black px-0.5 rounded-sm">
          {match}
        </span>
        <span className="text-muted-foreground">{after}</span>
      </p>
    );
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 border-indigo-300 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-indigo-700 flex items-center gap-2">
              <Search className="h-5 w-5" /> Find & Replace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label
                htmlFor="find"
                className="text-sm font-medium text-indigo-800"
              >
                Find
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="find"
                  value={findText}
                  onChange={(e) => {
                    setFindText(e.target.value);
                    findMatches();
                  }}
                  placeholder="Search..."
                  className="mt-2 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-indigo-200 bg-white"
                />
              </div>
              {matches.length > 0 && (
                <p className="text-sm text-indigo-700 font-medium mt-2 px-3 py-1 bg-indigo-100 rounded-lg inline-block shadow-sm">
                  {matchIndex + 1} of {matches.length} matches
                </p>
              )}
              {findText && matches.length === 0 && (
                <p className="text-sm text-red-700 font-medium mt-2 px-3 py-1 bg-red-100 rounded-lg inline-block shadow-sm">
                  No matches found
                </p>
              )}
              {currentPreview()}
            </div>
            <div>
              <Label
                htmlFor="replace"
                className="text-sm font-medium text-indigo-800"
              >
                Replace
              </Label>
              <Input
                id="replace"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
                // ENHANCEMENT: Themed input focus
                className="mt-2 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-indigo-200 bg-white"
              />
            </div>
            <div className="flex gap-3 pt-2">
              {/* ENHANCEMENT: Themed primary action button */}
              <Button
                onClick={replace}
                disabled={!findText}
                className="transition-all hover:scale-105 bg-indigo-600 hover:bg-indigo-700 shadow-md font-semibold"
              >
                <Repeat className="h-4 w-4 mr-2" />
                Replace
              </Button>
              {/* ENHANCEMENT: Themed primary action button */}
              <Button
                onClick={replaceAll}
                disabled={!findText}
                className="transition-all hover:scale-105 bg-indigo-600 hover:bg-indigo-700 shadow-md font-semibold"
              >
                <Repeat className="h-4 w-4 mr-2" />
                Replace All
              </Button>
              {/* ENHANCEMENT: Themed ghost button for clear */}
              <Button
                variant="ghost"
                onClick={() => {
                  setFindText("");
                  setReplaceText("");
                  setMatches([]);
                }}
                className="transition-all hover:scale-105 text-indigo-600 hover:bg-indigo-100/50 border border-gray-200"
              >
                Clear
              </Button>
            </div>
            <p className="text-xs text-indigo-800/70 pt-2">
              **Tip:** Press <span className="font-semibold">Enter</span> to
              cycle to the next match, or{" "}
              <span className="font-semibold">Shift + Enter</span> for the
              previous match.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
