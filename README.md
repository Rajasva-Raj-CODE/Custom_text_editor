# Text Editor One

A full-featured text editor web application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Tiptap.

## Features

### Core Text Formatting
- Bold, Italic, Underline, Strikethrough
- Superscript / Subscript
- Highlight & Text color picker
- Font size & font family selector
- Text alignment (Left, Center, Right, Justify)
- Clear formatting

### Structural Formatting
- Headings (H1–H6)
- Paragraph formatting
- Blockquote
- Code block
- Preformatted text
- Horizontal line / Divider

### Lists & Indentation
- Bulleted list
- Numbered list
- Task list / Checkboxes
- Increase / Decrease indent
- Nested lists

### Media & Embeds
- Insert image (upload or URL)
- Insert video / YouTube embed
- Insert table
- Insert link (with edit/remove)
- Embed iframes / external widgets

### Tables
- Insert / delete table
- Add/remove row/column
- Merge/split cells
- Resizable columns
- Table header styling

### Editing & Navigation Tools
- Find & Replace
- Undo / Redo
- Word count / character count
- Auto-save
- Version history
- Keyboard shortcuts for all formatting

### Advanced Content Features
- Mentions (@user)
- Hashtags (#topic)
- Slash commands (/ to insert blocks)
- Emoji picker (coming soon)
- Text snippets or templates
- Code syntax highlighting
- Smart quotes / Auto formatting
- AI assist for rewrite, expand, summarize

### Styling & Layout
- Light/Dark mode theme toggle
- Custom CSS styling
- Page width control
- Responsive editor area
- Zoom in/out (coming soon)

### Collaboration Features (Mock)
- Real-time collaboration (multiple cursors - mock)
- Commenting / Suggestions (mock)
- Track changes (mock)
- User presence indicators (mock)

### Export & Import
- Export to PDF, DOCX, Markdown, HTML
- Import from DOCX, Markdown
- Copy as HTML
- Print support

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Rich Text Editor**: Tiptap
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
texteditorone/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── text-editor.tsx     # Main editor component
│   ├── toolbar.tsx         # Toolbar with formatting options
│   ├── sidebar.tsx         # Sidebar for document info
│   ├── find-replace.tsx    # Find & Replace dialog
│   ├── ai-assistant.tsx    # AI assistant dialog
│   └── export-import.tsx   # Export/Import functionality
├── lib/
│   ├── tiptap-extensions.tsx  # Tiptap extensions configuration
│   ├── font-size-extension.ts # Custom font size extension
│   └── utils.ts            # Utility functions
├── hooks/
│   └── use-editor-store.ts # Zustand store for editor state
└── contexts/
    └── editor-context.tsx  # React context for editor instance
```

## Usage

### Basic Editing
1. Start typing in the editor
2. Use the toolbar buttons to format text
3. Use keyboard shortcuts (Ctrl+B for bold, etc.)

### Inserting Media
1. Click the Image icon to insert an image by URL
2. Click the YouTube icon to embed a YouTube video
3. Click the Table icon to insert a table

### Find & Replace
1. Click the Search icon in the header
2. Enter text to find
3. Optionally enter replacement text
4. Click Replace or Replace All

### AI Assistant
1. Select text in the editor (optional)
2. Click the AI icon in the header
3. Choose an action (Rewrite, Expand, Summarize, etc.)
4. The AI will process your request (mock implementation)

### Export/Import
1. Click the Export button in the header
2. Choose export format (HTML, Markdown, PDF, DOCX)
3. To import, click Import and select a file

### Version History
1. Open the sidebar
2. Click the History tab
3. Browse previous versions
4. Click a version to restore it

## Development

### Adding New Features
- Editor extensions can be added in `lib/tiptap-extensions.tsx`
- UI components follow the shadcn/ui pattern
- State management uses Zustand for persistence

### Customization
- Colors can be modified in `app/globals.css`
- Editor styling is in the `ProseMirror` classes in `globals.css`
- Toolbar buttons can be customized in `components/toolbar.tsx`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

