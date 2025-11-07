import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Underline } from '@tiptap/extension-underline'
import { Heading } from '@tiptap/extension-heading'
import { Link } from '@tiptap/extension-link'
import { ResizableImage } from '../lib/resizable-image-extension'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { FontFamily } from '@tiptap/extension-font-family'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Youtube } from '@tiptap/extension-youtube'
import { Mention } from '@tiptap/extension-mention'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { FontSize } from '../lib/font-size-extension'
import { SheetSizeExtension } from '../components/sheet-size-selector'

export const extensions = [
  StarterKit.configure({
    blockquote: {},
    codeBlock: {
      languageClassPrefix: 'language-',
    },
    heading: false,
    horizontalRule: {},
    listItem: {},
    orderedList: {},
    bulletList: {},
  }),
  Color.configure({
    types: ['textStyle'],
  }),
  TextStyle,
  Underline,
  Subscript,
  Superscript,
  FontFamily.configure({
    types: ['textStyle'],
  }),
  FontSize.configure({
    types: ['textStyle'],
  }),
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 underline cursor-pointer',
    },
  }),
  ResizableImage.configure({
    inline: true,
    allowBase64: true,
    HTMLAttributes: {
      class: 'rounded-lg',
      draggable: 'true',
    },
  }),
  Table.configure({
    resizable: true,
   HTMLAttributes: {
      class: "border-collapse border border-gray-300 w-full",
    },
  }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Highlight.configure({
    multicolor: true,
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Youtube.configure({
    controls: true,
    HTMLAttributes: {
      class: 'rounded-lg',
    },
  }),
  Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
  }),
  Placeholder.configure({
    placeholder: 'Start typing...',
  }),
  CharacterCount,
  Dropcursor,
  Gapcursor,
  SheetSizeExtension.configure({
    defaultSize: 'A4',
  }),
]

