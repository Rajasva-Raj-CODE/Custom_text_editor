'use client'

import React, { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Download, Upload, FileText, FileCode, FileJson, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, } from 'docx'

type JSONContent = {
  type?: string
  text?: string
  attrs?: { level?: number } & Record<string, unknown>
  marks?: Array<{ type: string }>
  content?: JSONContent[]
}

interface ExportImportProps {
  editor: Editor | null
}

export function ExportImport({ editor }: ExportImportProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState<string | null>(null)

  if (!editor) return null

  const exportToHTML = () => {
    try {
      setExporting('html')
      const content = editor.getHTML()
      // Create a well-formed HTML document
      const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: bold;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.75em; }
    h3 { font-size: 1.5em; }
    h4 { font-size: 1.25em; }
    h5 { font-size: 1.1em; }
    h6 { font-size: 1em; }
    p { margin: 1em 0; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    blockquote {
      border-left: 4px solid #ddd;
      margin: 1em 0;
      padding-left: 1em;
      color: #666;
      font-style: italic;
    }
    code {
      background: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    table td, table th {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 1em 0;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`

      const blob = new Blob([htmlDocument], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.html'
      a.click()
      URL.revokeObjectURL(url)
      setExporting(null)
    } catch (error) {
      console.error('Error exporting HTML:', error)
      alert('Error exporting HTML. Please try again.')
      setExporting(null)
    }
  }

  const exportToPDF = async () => {
    try {
      setExporting('pdf')

      // Dynamically import html2pdf only on client side
      const html2pdf = (await import('html2pdf.js')).default

      // Get HTML content
      const content = editor.getHTML()

      // Build a pretty PDF document container and append to DOM so styles apply
      const wrapper = document.createElement('div')
      wrapper.style.position = 'fixed'
      wrapper.style.inset = '0'
      wrapper.style.pointerEvents = 'none'
      wrapper.style.zIndex = '-1'

      const container = document.createElement('div')
      container.setAttribute('id', 'pdf-container')
      container.style.maxWidth = '800px'
      container.style.margin = '0 auto'
      container.style.backgroundColor = '#ffffff'
      container.style.borderRadius = '8px'
      container.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
      container.style.padding = '28px 36px'
      container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      container.style.fontSize = '12pt'
      container.style.lineHeight = '1.6'
      container.style.color = '#1f2937'

      // Optional header
      const header = document.createElement('div')
      header.style.borderBottom = '1px solid #e5e7eb'
      header.style.marginBottom = '16px'
      header.style.paddingBottom = '8px'
      header.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="font-weight:700; font-size:14pt; color:#111827;">Exported Document</div>
          <div style="font-size:10pt; color:#6b7280;">${new Date().toLocaleString()}</div>
        </div>
      `

      const contentDiv = document.createElement('div')
      contentDiv.innerHTML = content

      container.appendChild(header)
      container.appendChild(contentDiv)
      wrapper.appendChild(container)
      document.body.appendChild(wrapper)

      // Print-enhanced styles to improve fidelity and pagination
      const style = document.createElement('style')
      style.textContent = `
        #pdf-container h1 { font-size: 24pt; margin: 16pt 0 8pt; font-weight: 800; color: #111827; }
        #pdf-container h2 { font-size: 20pt; margin: 14pt 0 8pt; font-weight: 700; color: #111827; }
        #pdf-container h3 { font-size: 16pt; margin: 12pt 0 6pt; font-weight: 600; color: #111827; }
        #pdf-container h4 { font-size: 14pt; margin: 10pt 0 6pt; font-weight: 600; color: #111827; }
        #pdf-container p { margin: 8pt 0; }
        #pdf-container img { max-width: 100%; height: auto; page-break-inside: avoid; border-radius: 6px; margin: 10pt 0; }
        #pdf-container table { border-collapse: collapse; width: 100%; margin: 10pt 0; page-break-inside: avoid; }
        #pdf-container table td, #pdf-container table th { border: 1pt solid #d1d5db; padding: 6pt 8pt; }
        #pdf-container table th { background-color: #f3f4f6; color: #111827; font-weight: 700; }
        #pdf-container pre { background: #111827; color: #f9fafb; padding: 10pt; border-radius: 6px; overflow-x: auto; }
        #pdf-container code { font-family: 'Courier New', monospace; }
        #pdf-container blockquote { border-left: 3pt solid #e5e7eb; padding-left: 10pt; margin: 10pt 0; color: #374151; font-style: italic; }
        #pdf-container a { color: #2563eb; text-decoration: none; }
        #pdf-container a:hover { text-decoration: underline; }
        #pdf-container hr { border: none; border-top: 1pt solid #e5e7eb; margin: 12pt 0; }
        @media print {
          html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #pdf-container { background: #ffffff; }
          #pdf-container h1, #pdf-container h2, #pdf-container h3, #pdf-container h4 { page-break-after: avoid; }
          #pdf-container table, #pdf-container img, #pdf-container pre { page-break-inside: avoid; }
        }
      `
      document.head.appendChild(style)

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: 'document.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const
        }
      }

      await html2pdf().set(opt).from(container).save()

      // Cleanup
      document.head.removeChild(style)
      wrapper.remove()
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  const exportToDocx = async () => {
    try {
      setExporting('docx')

      const json = editor.getJSON() as JSONContent

      const convertNodeToParagraph = (node: JSONContent): Paragraph[] => {
        const paragraphs: Paragraph[] = []

        if (!node || typeof node !== 'object') return paragraphs

        switch (node.type) {
          case 'paragraph':
            if (node.content && node.content.length > 0) {
              const runs: TextRun[] = []
              node.content.forEach((child: JSONContent) => {
                if (child.type === 'text') {
                  let textRun: TextRun = new TextRun(child.text ?? '')

                  if (child.marks) {
                    const marks: Record<string, unknown> = {}
                    child.marks.forEach((mark: { type: string }) => {
                      if (mark.type === 'bold') marks.bold = true
                      else if (mark.type === 'italic') marks.italics = true
                      else if (mark.type === 'underline') marks.underline = {}
                      else if (mark.type === 'strike') marks.strike = true
                    })
                    textRun = new TextRun({ text: child.text ?? '', ...marks })
                  }

                  runs.push(textRun)
                }
              })
              paragraphs.push(new Paragraph({ children: runs }))
            } else {
              paragraphs.push(new Paragraph({ text: '' }))
            }
            break

          case 'heading':
            const level = node.attrs?.level || 1
            const headingLevels = [
              HeadingLevel.HEADING_1,
              HeadingLevel.HEADING_2,
              HeadingLevel.HEADING_3,
              HeadingLevel.HEADING_4,
              HeadingLevel.HEADING_5,
              HeadingLevel.HEADING_6,
            ]

            const headingText = node.content
              ?.map((child: JSONContent) => child.type === 'text' ? child.text ?? '' : '')
              .join('') || ''

            paragraphs.push(
              new Paragraph({
                text: headingText,
                heading: headingLevels[Math.min(level - 1, 5)],
              })
            )
            break

          case 'bulletList':
          case 'orderedList':
            if (node.content) {
              node.content.forEach((item: JSONContent) => {
                if (item.type === 'listItem' && item.content) {
                  item.content.forEach((para: JSONContent) => {
                    // Extract text directly from the node
                    let textContent = ''
                    if (para.content) {
                      para.content.forEach((child: JSONContent) => {
                        if (child.type === 'text') {
                          textContent += child.text ?? ''
                        }
                      })
                    }

                    const listParagraph = new Paragraph({
                      text: textContent,
                      ...(node.type === 'orderedList'
                        ? { numbering: { reference: 'default-numbering', level: 0 } }
                        : { bullet: { level: 0 } }
                      ),
                    })
                    paragraphs.push(listParagraph)
                  })
                }
              })
            }
            break

          case 'blockquote':
            if (node.content) {
              node.content.forEach((child: JSONContent) => {
                // Extract text directly from the node
                let textContent = ''
                if (child.content) {
                  child.content.forEach((para: JSONContent) => {
                    if (para.content) {
                      para.content.forEach((textNode: JSONContent) => {
                        if (textNode.type === 'text') {
                          textContent += (textNode.text ?? '') + ' '
                        }
                      })
                    }
                  })
                }

                paragraphs.push(
                  new Paragraph({
                    text: textContent.trim(),
                    indent: { left: 720 },
                    border: {
                      left: {
                        color: 'CCCCCC',
                        space: 144,
                        size: 4,
                        style: 'single',
                      },
                    },
                  })
                )
              })
            }
            break

          case 'hardBreak':
            paragraphs.push(new Paragraph({ text: '' }))
            break

          case 'codeBlock':
            const codeText = node.content
              ?.map((child: JSONContent) => child.type === 'text' ? child.text ?? '' : '')
              .join('') || ''
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: codeText,
                    font: 'Courier New',
                  }),
                ],
                shading: {
                  fill: 'F4F4F4',
                },
              })
            )
            break

          case 'table':
            // Convert table to simple text representation in DOCX
            if (node.content) {
              node.content.forEach((row: JSONContent) => {
                if (row.type === 'tableRow' && row.content) {
                  const rowCells: string[] = []
                  row.content.forEach((cell: JSONContent) => {
                    let cellText = ''
                    if (cell.content) {
                      cell.content.forEach((para: JSONContent) => {
                        if (para.content) {
                          para.content.forEach((child: JSONContent) => {
                            if (child.type === 'text') {
                              cellText += child.text ?? ''
                            }
                          })
                        }
                        cellText += ' '
                      })
                    }
                    rowCells.push(cellText.trim())
                  })
                  paragraphs.push(new Paragraph({
                    text: `| ${rowCells.join(' | ')} |`
                  }))
                }
              })
            }
            break
        }

        if (node.content && Array.isArray(node.content)) {
          node.content.forEach((child: JSONContent) => {
            if (child.type !== 'text' && child.type !== 'hardBreak') {
              paragraphs.push(...convertNodeToParagraph(child))
            }
          })
        }

        return paragraphs
      }

      const children: Paragraph[] = []
      if (json.content && Array.isArray(json.content)) {
        json.content.forEach((node: JSONContent) => {
          children.push(...convertNodeToParagraph(node))
        })
      }

      const doc = new Document({
        sections: [
          {
            children: children.length > 0 ? children : [new Paragraph({ text: 'Empty document' })],
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting DOCX:', error)
      alert('Error exporting DOCX. Please try again.')
    } finally {
      setExporting(null)
    }
  }


  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (file.type === 'text/html' || file.name.endsWith('.html')) {
        editor.commands.setContent(content)
      } else if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        // Simple markdown import (basic implementation)
        editor.commands.setContent(`<p>${content}</p>`)
      } else {
        editor.commands.setContent(`<p>${content}</p>`)
      }
    }
    reader.readAsText(file)
  }

  return (
    <TooltipProvider>
      <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all hover:scale-105 hover:shadow-md bg-white/90 hover:bg-white border-white/30 text-gray-800 font-semibold"
                >
                  <Download className="h-4 w-4  text-blue-600" />
                
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px] sm:w-auto min-w-[200px] sm:min-w-0">
                <DropdownMenuItem onClick={exportToHTML} disabled={exporting !== null}>
                  {exporting === 'html' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-orange-500" />
                  ) : (
                    <FileCode className="h-4 w-4 mr-2 text-orange-500" />
                  )}
                  Export as HTML
                </DropdownMenuItem>
            
                <DropdownMenuItem
                  onClick={exportToPDF}
                  disabled={exporting !== null}
                >
                  {exporting === 'pdf' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-red-500" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={exportToDocx}
                  disabled={exporting !== null}
                >
                  {exporting === 'docx' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
                  ) : (
                    <FileJson className="h-4 w-4 mr-2 text-blue-500" />
                  )}
                  Export as DOCX
                </DropdownMenuItem>
            
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export document in various formats</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="transition-all hover:scale-105 hover:shadow-md bg-white/90 hover:bg-white border-white/30 text-gray-800 font-semibold"
            >
              <Upload className="h-4 w-4  text-green-600" />
            
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import HTML or Text files</p>
          </TooltipContent>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.md,.txt"
          onChange={importFile}
          className="hidden"
        />
      </div>
    </TooltipProvider>
  )
}

