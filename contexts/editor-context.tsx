'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Editor } from '@tiptap/react'

interface EditorContextType {
  editor: Editor | null
}

const EditorContext = createContext<EditorContextType>({ editor: null })

export function EditorProvider({ editor, children }: { editor: Editor | null; children: ReactNode }) {
  return (
    <EditorContext.Provider value={{ editor }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditorContext() {
  return useContext(EditorContext)
}

