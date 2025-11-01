import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface EditorStore {
  documentHistory: Array<{ id: string; content: string; timestamp: number }>
  addToHistory: (content: string) => void
  currentVersion: number
  setCurrentVersion: (version: number) => void
}

// Custom storage that handles quota exceeded errors and SSR
const createSafeStorage = () => {
  return {
    getItem: (name: string): string | null => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return null
        }
        return localStorage.getItem(name)
      } catch (error) {
        console.error('Error reading from localStorage:', error)
        return null
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return
        }
        
        // Check localStorage size before saving
        const currentSize = new Blob([value]).size
        const maxSize = 5 * 1024 * 1024 // 5MB limit
        
        if (currentSize > maxSize) {
          console.warn('Content too large to save to localStorage')
          return
        }
        
        localStorage.setItem(name, value)
      } catch (error) {
        if (error instanceof DOMException && error.code === 22) {
          // QuotaExceededError - clear old history and try again
          console.warn('localStorage quota exceeded, clearing old history...')
          try {
            // Clear old document history entries
            const stored = localStorage.getItem('editor-storage')
            if (stored) {
              const parsed = JSON.parse(stored)
              if (parsed?.state?.documentHistory) {
                // Keep only the last 5 versions
                parsed.state.documentHistory = parsed.state.documentHistory.slice(-5)
                localStorage.setItem('editor-storage', JSON.stringify(parsed))
              }
            }
            // Try saving again
            localStorage.setItem(name, value)
          } catch (retryError) {
            console.error('Failed to save after cleanup:', retryError)
            // Clear all editor-storage if still failing
            try {
              localStorage.removeItem('editor-storage')
            } catch (clearError) {
              console.error('Failed to clear localStorage:', clearError)
            }
          }
        } else {
          console.error('Error saving to localStorage:', error)
        }
      }
    },
    removeItem: (name: string): void => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return
        }
        localStorage.removeItem(name)
      } catch (error) {
        console.error('Error removing from localStorage:', error)
      }
    },
  }
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      documentHistory: [],
      addToHistory: (content) =>
        set((state) => {
          try {
            // Limit content size - if content is too large, skip saving
            const contentSize = new Blob([content]).size
            const maxContentSize = 2 * 1024 * 1024 // 2MB per version
            
            if (contentSize > maxContentSize) {
              console.warn('Content too large, skipping history save')
              return state
            }
            
            // Keep only last 5 versions (reduced from 50)
            const newHistory = [
              ...state.documentHistory.slice(-4), // Keep last 4, add 1 new = 5 total
              {
                id: Date.now().toString(),
                content,
                timestamp: Date.now(),
              },
            ]
            
            return {
              documentHistory: newHistory,
            }
          } catch (error) {
            console.error('Error adding to history:', error)
            return state
          }
        }),
      currentVersion: 0,
      setCurrentVersion: (version) => set({ currentVersion: version }),
    }),
    {
      name: 'editor-storage',
      storage: createJSONStorage(() => createSafeStorage()),
    }
  )
)

