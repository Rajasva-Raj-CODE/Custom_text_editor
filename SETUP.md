# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
texteditorone/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles with Tiptap CSS
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── text-editor.tsx     # Main editor component
│   ├── toolbar.tsx         # Formatting toolbar
│   ├── sidebar.tsx         # Document sidebar
│   ├── find-replace.tsx    # Find & Replace dialog
│   ├── ai-assistant.tsx    # AI assistant dialog
│   ├── export-import.tsx   # Export/Import functionality
│   ├── color-picker.tsx    # Color picker component
│   ├── font-size-selector.tsx
│   └── font-family-selector.tsx
├── lib/
│   ├── tiptap-extensions.tsx  # All Tiptap extensions
│   ├── font-size-extension.ts # Custom font size extension
│   └── utils.ts            # Utility functions
├── hooks/
│   └── use-editor-store.ts # Zustand store for state
├── contexts/
│   └── editor-context.tsx  # React context for editor
└── package.json           # Dependencies

```

## Features Implemented

✅ All core text formatting (Bold, Italic, Underline, etc.)
✅ Structural formatting (Headings, Blockquote, Code blocks)
✅ Lists and indentation
✅ Media embeds (Images, Videos, Tables, Links)
✅ Advanced table features
✅ Find & Replace
✅ Undo/Redo
✅ Word count / Character count
✅ Auto-save with version history
✅ Light/Dark theme toggle
✅ Export/Import (HTML, Markdown, PDF, DOCX)
✅ Sidebar with document info
✅ Mentions and hashtags support
✅ Code syntax highlighting
✅ Responsive design

## Notes

- PDF and DOCX export use browser print functionality and alerts. For production, consider using libraries like `jsPDF` or `docx`
- Collaboration features (cursors, comments) are mocked for demonstration
- Auto-save saves to localStorage every 1 second (debounced)
- Version history is stored in localStorage (last 50 versions)

## Troubleshooting

### TypeScript Errors
If you see TypeScript errors about missing modules, run `npm install` to install all dependencies.

### Build Errors
Make sure all dependencies are installed:
```bash
npm install
```

### Styling Issues
The project uses Tailwind CSS. Make sure PostCSS is configured correctly (already set up in `postcss.config.js`).

## Customization

- **Theme Colors**: Edit `app/globals.css` to change color scheme
- **Editor Styles**: Modify `.ProseMirror` classes in `app/globals.css`
- **Toolbar Buttons**: Edit `components/toolbar.tsx`
- **Extensions**: Add new Tiptap extensions in `lib/tiptap-extensions.tsx`

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Customize as needed

