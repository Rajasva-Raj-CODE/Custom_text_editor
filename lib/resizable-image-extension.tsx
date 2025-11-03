import { Image } from '@tiptap/extension-image'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { NodeSelection } from '@tiptap/pm/state'

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
        parseHTML: (element) => {
          const width = element.getAttribute('width')
          return width ? width : null
        },
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
        parseHTML: (element) => {
          const height = element.getAttribute('height')
          return height ? height : null
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      ResizeImagePlugin(),
    ]
  },
})

const ResizeImagePlugin = () => {
  return new Plugin({
    key: new PluginKey('resizeImages'),
    props: {
      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target as HTMLElement

          // Don't interfere with resize handles
          if (target.closest('.resize-handle')) {
            return false
          }

          if (target.tagName !== 'IMG' && !target.closest('img')) {
            return false
          }

          const img = target.tagName === 'IMG' ? target : target.closest('img') as HTMLElement
          if (!img) return false

          const { state } = view

          // Check if we clicked on an image
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (!pos) return false

          const $pos = state.doc.resolve(pos.pos)
          const node = $pos.node()
          if (node?.type.name !== 'image') {
            return false
          }

          // Select the image node for dragging
          const selection = NodeSelection.create(state.doc, $pos.before())
          view.dispatch(state.tr.setSelection(selection))

          return false
        },
      },
      nodeViews: {
        image(node, view, getPos) {
          const dom = document.createElement('img')
          const wrapper = document.createElement('div')
          wrapper.className = 'image-wrapper'
          wrapper.style.position = 'relative'
          wrapper.style.display = 'inline-block'
          wrapper.style.maxWidth = '100%'

          const { src, alt, title, width, height } = node.attrs
          dom.src = src
          if (alt) dom.alt = alt
          if (title) dom.title = title

          if (width) {
            dom.style.width = typeof width === 'number' ? `${width}px` : width
          }
          if (height) {
            dom.style.height = typeof height === 'number' ? `${height}px` : height
          }

          dom.style.maxWidth = '100%'
          dom.style.height = 'auto'
          dom.draggable = true
          
          // Enable drag functionality for the image
          dom.addEventListener('dragstart', (e) => {
            const pos = getPos()
            if (typeof pos === 'number') {
              const { state } = view
              const selection = NodeSelection.create(state.doc, pos)
              view.dispatch(state.tr.setSelection(selection))
              e.dataTransfer!.effectAllowed = 'move'
              
              // Store the position in the data transfer
              const dragImage = dom.cloneNode(true) as HTMLElement
              dragImage.style.opacity = '0.5'
              document.body.appendChild(dragImage)
              e.dataTransfer!.setDragImage(dragImage, 0, 0)
              setTimeout(() => document.body.removeChild(dragImage), 0)
            }
          })

          wrapper.appendChild(dom)

          // Create resize handles
          const createHandle = (position: string) => {
            const handle = document.createElement('div')
            handle.className = `resize-handle resize-handle-${position}`
            handle.style.cssText = `
              position: absolute;
              background: #3b82f6;
              border: 2px solid white;
              border-radius: 50%;
              width: 12px;
              height: 12px;
              z-index: 10;
              cursor: ${position.includes('right') ? 'ew-resize' : position.includes('bottom') ? 'ns-resize' : 'nwse-resize'};
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `
            return handle
          }

          const bottomRight = createHandle('bottom-right')
          bottomRight.style.bottom = '-6px'
          bottomRight.style.right = '-6px'
          bottomRight.style.cursor = 'nwse-resize'

          let isResizing = false
          let startX = 0
          let startY = 0
          let startWidth = 0
          let startHeight = 0

          const onMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            isResizing = true
            const rect = dom.getBoundingClientRect()
            startX = e.clientX
            startY = e.clientY
            startWidth = rect.width
            startHeight = rect.height

            const onMouseMove = (e: MouseEvent) => {
              if (!isResizing) return

              const deltaX = e.clientX - startX
              const newWidth = Math.max(50, startWidth + deltaX)
              const aspectRatio = startHeight / startWidth
              const newHeight = Math.max(50, newWidth * aspectRatio)

              dom.style.width = `${newWidth}px`
              dom.style.height = `${newHeight}px`

              // Update the node
              const pos = getPos()
              if (typeof pos === 'number') {
                const { state } = view
                const { tr } = state
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  width: Math.round(newWidth),
                  height: Math.round(newHeight),
                })
                view.dispatch(tr)
              }
            }

            const onMouseUp = () => {
              isResizing = false
              bottomRight.style.display = 'none'
              document.removeEventListener('mousemove', onMouseMove)
              document.removeEventListener('mouseup', onMouseUp)
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
          }

          bottomRight.addEventListener('mousedown', onMouseDown)
          wrapper.appendChild(bottomRight)

          // Show handle on hover
          wrapper.addEventListener('mouseenter', () => {
            if (!isResizing) {
              bottomRight.style.display = 'block'
            }
          })
          wrapper.addEventListener('mouseleave', () => {
            if (!isResizing) {
              bottomRight.style.display = 'none'
            }
          })

          return {
            dom: wrapper,
            contentDOM: null,
            update(node) {
              if (node.type.name !== 'image') return false
              const { src, alt, title, width, height } = node.attrs
              if (dom.src !== src) dom.src = src
              if (alt !== dom.alt) dom.alt = alt || ''
              if (title !== dom.title) dom.title = title || ''
              if (width) {
                dom.style.width = typeof width === 'number' ? `${width}px` : width
              }
              if (height) {
                dom.style.height = typeof height === 'number' ? `${height}px` : height
              }
              return true
            },
          }
        },
      },
    },
  })
}
