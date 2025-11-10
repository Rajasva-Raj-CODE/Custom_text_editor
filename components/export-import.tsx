"use client";

import React, { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Download,
  Upload,
  FileText,
  FileCode,
  FileJson,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from "docx";
import type { IBordersOptions, IRunOptions } from "docx";
import { cn } from "@/lib/utils";

type JSONContent = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: JSONContent[];
};

interface ExportImportProps {
  editor: Editor | null;
}

export function ExportImport({ editor }: ExportImportProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  if (!editor) return null;

  const unsupportedColorRegex = /(oklab|oklch|lab|lch)\(/i;
  const replaceUnsupportedColorFunctions = (value: string): string => {
    if (!value || !unsupportedColorRegex.test(value)) {
      return value;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    return value.replace(/(oklab|oklch|lab|lch)\([^)]*\)/gi, (match) => {
      if (ctx && typeof (ctx as CanvasRenderingContext2D).fillStyle === "string") {
        try {
          ctx.fillStyle = match;
          const resolved = ctx.fillStyle;
          if (resolved && !unsupportedColorRegex.test(resolved)) {
            return resolved;
          }
        } catch {
          // fall through to default
        }
      }
      return "#000000";
    });
  };

  const sanitizeElementColors = (element: HTMLElement) => {
    const styleAttr = element.getAttribute("style");
    if (styleAttr && unsupportedColorRegex.test(styleAttr)) {
      element.setAttribute("style", replaceUnsupportedColorFunctions(styleAttr));
    }

    Array.from(element.children).forEach((child) => {
      sanitizeElementColors(child as HTMLElement);
    });
  };

  const computedColorProperties = [
    "color",
    "backgroundColor",
    "borderColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
  ] as const;

  const applyComputedColorFallbacks = (element: HTMLElement) => {
    const computed = window.getComputedStyle(element);

    computedColorProperties.forEach((prop) => {
      const value = computed[prop];
      if (typeof value === "string" && unsupportedColorRegex.test(value)) {
        const fallback = replaceUnsupportedColorFunctions(value);
        if (fallback) {
          element.style[prop] = fallback;
        }
      }
    });

    Array.from(element.children).forEach((child) =>
      applyComputedColorFallbacks(child as HTMLElement)
    );
  };

  const exportToHTML = () => {
    try {
      setExporting("html");
      const content = editor.getHTML();
      const sheetSize = editor.storage.sheetSize?.getSheetSize();
      const mmToPx = 96 / 25.4;
      const widthPx = sheetSize ? sheetSize.width * mmToPx : 800;

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
      max-width: ${widthPx}px;
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
</html>`;

      const blob = new Blob([htmlDocument], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.html";
      a.click();
      URL.revokeObjectURL(url);
      setExporting(null);
    } catch (error) {
      console.error("Error exporting HTML:", error);
      alert("Error exporting HTML. Please try again.");
      setExporting(null);
    }
  };

  const exportToPDF = async () => {
    let wrapper: HTMLDivElement | null = null;
    let styleTag: HTMLStyleElement | null = null;

    try {
      setExporting("pdf");

      const html2pdf = (await import("html2pdf.js")).default;

      const content = editor.getHTML();
      const sheetSize = editor.storage.sheetSize?.getSheetSize();
      const mmToPx = 96 / 25.4;
      const widthPx = sheetSize ? sheetSize.width * mmToPx : 800;

      wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.inset = "0";
      wrapper.style.pointerEvents = "none";
      wrapper.style.zIndex = "-1";

      const container = document.createElement("div");
      container.setAttribute("id", "pdf-container");
      container.style.maxWidth = `${widthPx}px`;
      container.style.width = "100%";
      container.style.margin = "0 auto";
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "32px";
      container.style.fontFamily =
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      container.style.fontSize = "12pt";
      container.style.lineHeight = "1.6";
      container.style.color = "#1f2937";
      container.style.boxSizing = "border-box";
      container.style.letterSpacing = "0.01em";

      const sanitizedContent = replaceUnsupportedColorFunctions(content);
      const contentDiv = document.createElement("div");
      contentDiv.innerHTML = sanitizedContent;
      contentDiv.style.width = "100%";

      container.appendChild(contentDiv);
      wrapper.appendChild(container);
      document.body.appendChild(wrapper);
      sanitizeElementColors(container);
      applyComputedColorFallbacks(container);

      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      styleTag = document.createElement("style");
      styleTag.textContent = `
        #pdf-container { box-sizing: border-box; }
        #pdf-container h1 { font-size: 2em; margin: 1.5em 0 0.5em; font-weight: 700; }
        #pdf-container h2 { font-size: 1.75em; margin: 1.4em 0 0.5em; font-weight: 600; }
        #pdf-container h3 { font-size: 1.5em; margin: 1.2em 0 0.5em; font-weight: 600; }
        #pdf-container h4 { font-size: 1.3em; margin: 1em 0 0.4em; font-weight: 600; }
        #pdf-container h5 { font-size: 1.1em; margin: 0.8em 0 0.4em; font-weight: 600; }
        #pdf-container h6 { font-size: 1em; margin: 0.8em 0 0.4em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        #pdf-container p { margin: 0.9em 0; }
        #pdf-container ul,
        #pdf-container ol { margin: 0.9em 0 0.9em 1.5em; padding: 0; }
        #pdf-container li { margin: 0.4em 0; }
        #pdf-container img { max-width: 100%; height: auto; page-break-inside: avoid; border-radius: 4px; }
        #pdf-container table { border-collapse: collapse; width: 100%; margin: 1.2em 0; page-break-inside: avoid; table-layout: fixed; }
        #pdf-container table td,
        #pdf-container table th { border: 1pt solid #d1d5db; padding: 8pt 10pt; vertical-align: top; }
        #pdf-container pre { overflow-x: auto; page-break-inside: avoid; padding: 12pt; background: #f4f4f5; border-radius: 4px; font-size: 0.95em; }
        #pdf-container code { font-family: 'Courier New', monospace; }
        #pdf-container blockquote { margin: 1.2em 0; padding-left: 1em; border-left: 3px solid rgba(209,213,219,0.8); color: #4b5563; font-style: italic; }
        #pdf-container hr { border: none; border-top: 1pt solid #e5e7eb; margin: 1.5em 0; }
        @media print {
          html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #pdf-container table, #pdf-container img, #pdf-container pre { page-break-inside: avoid; }
        }
      `;
      document.head.appendChild(styleTag);

      const getPdfFormat = (): string | [number, number] => {
        if (!sheetSize) return "a4";
        const formatMap: Record<string, string | [number, number]> = {
          A4: "a4",
          A3: "a3",
          A5: "a5",
          Letter: "letter",
          Legal: "legal",
          Tabloid: [sheetSize.width, sheetSize.height],
        };
        return formatMap[sheetSize.type as string] || "a4";
      };

      const pdfFormat = getPdfFormat();
      const isCustomFormat = Array.isArray(pdfFormat);
      const deviceScale =
        typeof window !== "undefined" ? Math.min(3, Math.max(window.devicePixelRatio || 1.5, 2)) : 2;

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: "document.pdf",
        image: { type: "jpeg" as const, quality: 0.96 },
        html2canvas: {
          scale: deviceScale,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight,
          scrollX: 0,
          scrollY: 0,
        },
        pagebreak: {
          mode: ["css", "legacy"],
        },
        jsPDF: isCustomFormat
          ? {
              unit: "mm" as const,
              format: pdfFormat as [number, number],
              orientation: "portrait" as const,
            }
          : {
              unit: "mm" as const,
              format: pdfFormat as string,
              orientation: "portrait" as const,
            },
      };

      await html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error exporting PDF. Please try again.");
    } finally {
      if (styleTag?.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }
      if (wrapper?.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
      setExporting(null);
    }
  };

  const exportToDocx = async () => {
    try {
      setExporting("docx");

      const json = editor.getJSON() as JSONContent;

      type TextRunOptions = IRunOptions;
      type ListContext = { type: "bullet" | "numbered"; level: number };
      type DocxElement = Paragraph | Table;

      const headingLevels = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
        HeadingLevel.HEADING_4,
        HeadingLevel.HEADING_5,
        HeadingLevel.HEADING_6,
      ];

      const numberingConfig = [
        {
          reference: "numbered-list",
          levels: Array.from({ length: 9 }).map((_, level) => ({
            level,
            format: LevelFormat.DECIMAL,
            text: `%${level + 1}.`,
            alignment: AlignmentType.START,
            style: {
              paragraph: {
                indent: {
                  left: 720 * (level + 1),
                  hanging: 360,
                },
                spacing: {
                  before: 0,
                  after: 120,
                },
              },
            },
          })),
        },
        {
          reference: "bullet-list",
          levels: Array.from({ length: 9 }).map((_, level) => ({
            level,
            format: LevelFormat.BULLET,
            text: ["•", "◦", "▪"][level % 3],
            alignment: AlignmentType.START,
            style: {
              paragraph: {
                indent: {
                  left: 720 * (level + 1),
                  hanging: 360,
                },
                spacing: {
                  before: 0,
                  after: 120,
                },
              },
            },
          })),
        },
      ];

      const getRunOptionsFromMarks = (
        marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
      ): Partial<TextRunOptions> => {
        let options: Partial<TextRunOptions> = {};

        marks?.forEach((mark) => {
          switch (mark.type) {
            case "bold":
              options = { ...options, bold: true };
              break;
            case "italic":
              options = { ...options, italics: true };
              break;
            case "underline":
              options = {
                ...options,
                underline: { type: UnderlineType.SINGLE },
              };
              break;
            case "strike":
              options = { ...options, strike: true };
              break;
            case "code":
              options = {
                ...options,
                font: "Courier New",
                size: 22,
              };
              break;
            case "link":
              options = {
                ...options,
                underline: { type: UnderlineType.SINGLE },
                color: "0563C1",
                style: "Hyperlink",
              };
              break;
          }
        });

        return options;
      };

      const createTextRuns = (
        content: JSONContent[] = [],
        overrides: Partial<TextRunOptions> = {}
      ): TextRun[] => {
        const runs: TextRun[] = [];

        content.forEach((child) => {
          if (child.type === "text") {
            const text = child.text ?? "";
            const markOptions = getRunOptionsFromMarks(child.marks);
            const segments = text.split(/\r?\n/);

            segments.forEach((segment, index) => {
              runs.push(
                new TextRun({
                  text: segment,
                  ...markOptions,
                  ...overrides,
                })
              );
              if (index < segments.length - 1) {
                runs.push(new TextRun({ break: 1 }));
              }
            });

            if (!segments.length) {
              runs.push(
                new TextRun({
                  text: "",
                  ...markOptions,
                  ...overrides,
                })
              );
            }
          } else if (child.type === "hardBreak") {
            runs.push(new TextRun({ break: 1 }));
          } else if (child.type === "image") {
            const alt = (child.attrs?.alt as string) || (child.attrs?.title as string) || "Image";
            runs.push(
              new TextRun({
                text: `[Image: ${alt}]`,
                italics: true,
                ...overrides,
              })
            );
          }
        });

        if (runs.length === 0) {
          runs.push(new TextRun({ text: "", ...overrides }));
        }

        return runs;
      };

      const extractPlainText = (node?: JSONContent): string => {
        if (!node) return "";
        if (node.type === "text") return node.text ?? "";
        if (node.type === "hardBreak") return "\n";
        if (Array.isArray(node.content)) {
          return node.content.map((child) => extractPlainText(child)).join(" ").trim();
        }
        return "";
      };

      const createParagraph = (
        content: JSONContent[] | undefined,
        options: {
          listContext?: ListContext;
          spacing?: { before?: number; after?: number };
          indent?: { left?: number; right?: number; hanging?: number };
          border?: IBordersOptions;
          runOverrides?: Partial<TextRunOptions>;
        } = {}
      ): Paragraph => {
        const runs = createTextRuns(content ?? [], options.runOverrides);

        return new Paragraph({
          children: runs,
          spacing: {
            before: options.spacing?.before ?? 60,
            after: options.spacing?.after ?? 180,
            line: 360,
          },
          indent: options.indent,
          border: options.border,
          numbering: options.listContext
            ? {
                reference: options.listContext.type === "numbered" ? "numbered-list" : "bullet-list",
                level: Math.min(options.listContext.level, 8),
              }
            : undefined,
        });
      };

      const convertNodes = (nodes: JSONContent[] = [], context?: ListContext): DocxElement[] =>
        nodes.flatMap((node) => convertNode(node, context));

      const convertTableCellContent = (content: JSONContent[] = []): Paragraph[] => {
        const converted = convertNodes(content);
        const paragraphs: Paragraph[] = [];

        converted.forEach((element) => {
          if (element instanceof Paragraph) {
            paragraphs.push(element);
          } else if (element instanceof Table) {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: "[Table]", italics: true })],
                spacing: { after: 120 },
              })
            );
          }
        });

        return paragraphs.length ? paragraphs : [new Paragraph({ text: "" })];
      };

      const convertNode = (node: JSONContent, context?: ListContext): DocxElement[] => {
        if (!node || typeof node !== "object") return [];

        switch (node.type) {
          case "paragraph":
            return [
              createParagraph(node.content, {
                listContext: context,
              }),
            ];

          case "heading": {
            const levelRaw = Number(node.attrs?.level) || 1;
            const level = Math.max(1, Math.min(levelRaw, 6));

            return [
              new Paragraph({
                children: createTextRuns(node.content ?? []),
                heading: headingLevels[level - 1],
                spacing: { before: 240, after: 160 },
              }),
            ];
          }

          case "bulletList":
          case "orderedList": {
            const listType = node.type === "orderedList" ? "numbered" : "bullet";
            const nextLevel = Math.min((context?.level ?? -1) + 1, 8);
            const listItems: DocxElement[] = [];

            node.content?.forEach((item) => {
              if (item.type === "listItem") {
                listItems.push(...convertNode(item, { type: listType, level: nextLevel }));
              }
            });

            return listItems;
          }

          case "listItem": {
            const listChildren: DocxElement[] = [];

            node.content?.forEach((child) => {
              if (child.type === "paragraph") {
                listChildren.push(
                  createParagraph(child.content, {
                    listContext: context,
                    spacing: { after: 120 },
                  })
                );
              } else {
                listChildren.push(...convertNode(child, context));
              }
            });

            return listChildren;
          }

          case "blockquote": {
            const quotes: DocxElement[] = [];

            node.content?.forEach((child) => {
              const fallbackText = extractPlainText(child);
              quotes.push(
                createParagraph(
                  fallbackText
                    ? [
                        {
                          type: "text",
                          text: fallbackText,
                        },
                      ]
                    : child?.content ?? [],
                  {
                    runOverrides: { italics: true },
                    indent: { left: 720 },
                    border: {
                      left: {
                        color: "CCCCCC",
                        size: 12,
                        style: BorderStyle.SINGLE,
                      },
                    },
                    spacing: { before: 120, after: 120 },
                  }
                )
              );
            });

            return quotes;
          }

          case "codeBlock": {
            const codeLines =
              node.content
                ?.map((child) => (child.type === "text" ? child.text ?? "" : ""))
                .join("\n") || "";
            const segments = codeLines.split(/\r?\n/);
            const runs: TextRun[] = [];

            segments.forEach((segment, index) => {
              runs.push(
                new TextRun({
                  text: segment,
                  font: "Courier New",
                  size: 22,
                })
              );
              if (index < segments.length - 1) {
                runs.push(new TextRun({ break: 1 }));
              }
            });

            if (!runs.length) {
              runs.push(
                new TextRun({
                  text: "",
                  font: "Courier New",
                  size: 22,
                })
              );
            }

            return [
              new Paragraph({
                children: runs,
                shading: {
                  type: ShadingType.CLEAR,
                  color: "auto",
                  fill: "F4F4F4",
                },
                spacing: { before: 240, after: 240 },
                border: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
                },
              }),
            ];
          }

          case "table": {
            const rows =
              node.content
                ?.filter((row) => row.type === "tableRow")
                .map((row) => {
                  const cells =
                    row.content
                      ?.filter((cell) => cell.type === "tableCell")
                      .map(
                        (cell) =>
                          new TableCell({
                            margins: { top: 100, bottom: 100, left: 100, right: 100 },
                            children: convertTableCellContent(cell.content ?? []),
                            shading:
                              row === node.content?.[0]
                                ? {
                                    type: ShadingType.CLEAR,
                                    color: "auto",
                                    fill: "F7F7F7",
                                  }
                                : undefined,
                            borders: {
                              top: { style: BorderStyle.SINGLE, size: 8, color: "DDDDDD" },
                              bottom: { style: BorderStyle.SINGLE, size: 8, color: "DDDDDD" },
                              left: { style: BorderStyle.SINGLE, size: 8, color: "DDDDDD" },
                              right: { style: BorderStyle.SINGLE, size: 8, color: "DDDDDD" },
                            },
                          })
                      ) ?? [];
                  return new TableRow({ children: cells, cantSplit: true });
                }) ?? [];

            if (!rows.length) {
              return [];
            }

            return [
              new Table({
                width: { size: 100 * 50, type: WidthType.PERCENTAGE },
                layout: TableLayoutType.AUTOFIT,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: "DDDDDD" },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: "DDDDDD" },
                  left: { style: BorderStyle.SINGLE, size: 8, color: "DDDDDD" },
                  right: { style: BorderStyle.SINGLE, size: 8, color: "DDDDDD" },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" },
                  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" },
                },
                rows,
              }),
            ];
          }

          case "horizontalRule":
            return [
              new Paragraph({
                border: {
                  top: { style: BorderStyle.SINGLE, size: 12, color: "CCCCCC" },
                },
                spacing: { before: 240, after: 240 },
              }),
            ];

          case "image": {
            const alt = (node.attrs?.alt as string) || (node.attrs?.title as string) || "Image";

            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[Image: ${alt}]`,
                    italics: true,
                  }),
                ],
                spacing: { before: 120, after: 120 },
              }),
            ];
          }

          default:
            if (node.content && Array.isArray(node.content)) {
              return convertNodes(node.content, context);
            }
            if (node.text) {
              return [
                new Paragraph({
                  children: [new TextRun({ text: node.text })],
                }),
              ];
            }
            return [];
        }
      };

      const sectionChildren = convertNodes(json.content ?? []);

      const sheetSize = editor.storage.sheetSize?.getSheetSize();
      const mmToTwips = 56.6929133858;
      const pageWidth = sheetSize
        ? Math.round((sheetSize.width as number) * mmToTwips)
        : 11906;
      const pageHeight = sheetSize
        ? Math.round((sheetSize.height as number) * mmToTwips)
        : 16838;

      const doc = new Document({
        creator: "Custom Text Editor",
        title: "Document",
        styles: {
          default: {
            document: {
              run: {
                font: "Calibri",
                size: 24,
                color: "1f2937",
              },
              paragraph: {
                spacing: { before: 60, after: 180, line: 360 },
              },
            },
          },
        },
        numbering: { config: numberingConfig },
        sections: [
          {
            properties: {
              page: {
                size: {
                  width: pageWidth,
                  height: pageHeight,
                },
                margin: {
                  top: 1440,
                  bottom: 1440,
                  left: 1440,
                  right: 1440,
                },
              },
            },
            children:
              sectionChildren.length > 0
                ? sectionChildren
                : [new Paragraph({ text: "Empty document" })],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting DOCX:", error);
      alert("Error exporting DOCX. Please try again.");
    } finally {
      setExporting(null);
    }
  };

const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    const isAppend = true; // or confirm popup

    if (isAppend) {
      editor.commands.insertContent(content);
    } else {
      editor.commands.setContent(content);
    }
  };
  reader.readAsText(file);
};


  return (
    <TooltipProvider>
      <div className="flex w-full sm:w-auto justify-center ">
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="xs"
                  className="transition-all hover:scale-105 hover:shadow-md bg-white/90 hover:bg-white  text-gray-800 font-semibold"
                >
                  <Download className="h-4 w-4  text-blue-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px] sm:w-auto min-w-[200px] sm:min-w-0 bg-white shadow-lg border border-gray-200 ">
                <DropdownMenuItem
                  onClick={exportToHTML}
                  disabled={exporting !== null}
                  className={cn(
                    "cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-200 transition-colors"
                  )}
                >
                  {exporting === "html" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-orange-500" />
                  ) : (
                    <FileCode className="h-4 w-4 mr-2 text-orange-500" />
                  )}
                  Export as HTML
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={exportToPDF}
                  disabled={exporting !== null}
                  className={cn(
                    "cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-200 transition-colors"
                  )}
                >
                  {exporting === "pdf" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-red-500" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={exportToDocx}
                  disabled={exporting !== null}
                  className={cn(
                    "cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-200 transition-colors"
                  )}
                >
                  {exporting === "docx" ? (
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
              size="xs"
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
  );
}
