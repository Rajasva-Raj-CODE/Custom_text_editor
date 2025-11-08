// components/SmartTableMenu.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Table, Plus, Trash2, Merge, Split } from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface SmartTableMenuProps {
  editor: Editor;
  onInsertTable?: (rows: number, cols: number) => void;
  className?: string;
}

export const SmartTableMenu: React.FC<SmartTableMenuProps> = ({
  editor,
  onInsertTable,
  className = '',
}) => {
  const [isTableActive, setIsTableActive] = useState(false);
  const [isTableCellSelected, setIsTableCellSelected] = useState(false);

  useEffect(() => {
    const updateState = () => {
      setIsTableActive(editor.isActive('table'));
      setIsTableCellSelected(editor.isActive('tableCell') || editor.isActive('tableHeader'));
    };

    updateState();

    editor.on('transaction', updateState);
    editor.on('update', updateState);
    editor.on('selectionUpdate', updateState);

    return () => {
      editor.off('transaction', updateState);
      editor.off('update', updateState);
      editor.off('selectionUpdate', updateState);
    };
  }, [editor]);

  const defaultInsertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    
    setTimeout(() => {
      setIsTableActive(true);
      setIsTableCellSelected(true);
    }, 100);
  };

  const insertTable = onInsertTable || defaultInsertTable;

  const handleTableAction = (action: () => void) => {
    action();
    setTimeout(() => {
      setIsTableActive(editor.isActive('table'));
      setIsTableCellSelected(editor.isActive('tableCell') || editor.isActive('tableHeader'));
    }, 50);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isTableActive ? "default" : "ghost"}
           size="xs"
              className={`transition-all hover:scale-110 ${
                isTableActive
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              } ${className}`}
            >
              <Table className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-white border border-gray-200 shadow-lg">
            
            {!isTableActive ? (
              // Insert Table Options
              <>
                <div className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border-b">
                  Insert Table
                </div>
                <div className="p-2 space-y-1">
                  <DropdownMenuItem 
                    onClick={() => insertTable(2, 2)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 cursor-pointer text-gray-700 hover:text-blue-700"
                  >
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-600">2×2</span>
                    </div>
                    <span>Small Table (2×2)</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => insertTable(3, 3)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 cursor-pointer text-gray-700 hover:text-blue-700"
                  >
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-600">3×3</span>
                    </div>
                    <span>Standard Table (3×3)</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => insertTable(4, 4)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 cursor-pointer text-gray-700 hover:text-blue-700"
                  >
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-600">4×4</span>
                    </div>
                    <span>Medium Table (4×4)</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => insertTable(5, 5)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 cursor-pointer text-gray-700 hover:text-blue-700"
                  >
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-600">5×5</span>
                    </div>
                    <span>Large Table (5×5)</span>
                  </DropdownMenuItem>
                </div>
              </>
            ) : (
              // Edit Table Options
              <>
                <div className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border-b">
                  Table Options
                </div>
                
                {/* Insert New Tables */}
                <div className="p-2 border-b">
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium">Insert New</div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <DropdownMenuItem 
                      onClick={() => insertTable(3, 3)}
                      className="flex justify-center px-2 py-1.5 rounded hover:bg-blue-50 cursor-pointer text-gray-600 hover:text-blue-600 text-xs"
                    >
                      3×3 Table
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => insertTable(4, 4)}
                      className="flex justify-center px-2 py-1.5 rounded hover:bg-blue-50 cursor-pointer text-gray-600 hover:text-blue-600 text-xs"
                    >
                      4×4 Table
                    </DropdownMenuItem>
                  </div>
                </div>

                {/* Column Operations */}
                <div className="p-2 border-b">
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium">Columns</div>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().addColumnBefore().run())}
                    disabled={!isTableCellSelected}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-50 cursor-pointer text-gray-700 hover:text-green-700"
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>Add Column Before</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().addColumnAfter().run())}
                    disabled={!isTableCellSelected}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-50 cursor-pointer text-gray-700 hover:text-green-700"
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>Add Column After</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().deleteColumn().run())}
                    disabled={!isTableCellSelected}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 cursor-pointer text-gray-700 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <span>Delete Column</span>
                  </DropdownMenuItem>
                </div>

                {/* Row Operations */}
                <div className="p-2 border-b">
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium">Rows</div>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().addRowBefore().run())}
                    disabled={!isTableCellSelected}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-50 cursor-pointer text-gray-700 hover:text-green-700"
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>Add Row Before</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().addRowAfter().run())}
                    disabled={!isTableCellSelected}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-50 cursor-pointer text-gray-700 hover:text-green-700"
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>Add Row After</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().deleteRow().run())}
                    disabled={!isTableCellSelected}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 cursor-pointer text-gray-700 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <span>Delete Row</span>
                  </DropdownMenuItem>
                </div>

                {/* Cell Operations */}
                <div className="p-2 border-b">
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium">Cells</div>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().mergeCells().run())}
                    disabled={!isTableCellSelected}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer text-gray-700 hover:text-purple-700"
                  >
                    <Merge className="h-4 w-4 text-purple-600" />
                    <span>Merge Cells</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().splitCell().run())}
                    disabled={!isTableCellSelected}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer text-gray-700 hover:text-purple-700"
                  >
                    <Split className="h-4 w-4 text-purple-600" />
                    <span>Split Cell</span>
                  </DropdownMenuItem>
                </div>

                {/* Table Operations */}
                <div className="p-2">
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium">Table</div>
                  <DropdownMenuItem 
                    onClick={() => handleTableAction(() => editor.chain().focus().deleteTable().run())}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 cursor-pointer text-gray-700 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <span>Delete Table</span>
                  </DropdownMenuItem>
                </div>

                {/* Status Indicator */}
                <div className="px-3 py-2 bg-gray-50 border-t">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${isTableCellSelected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-gray-600">
                      {isTableCellSelected ? 'Cell selected - Ready to edit' : 'Click in table to edit'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isTableActive ? "Edit Table" : "Insert Table"}</p>
      </TooltipContent>
    </Tooltip>
  );
};