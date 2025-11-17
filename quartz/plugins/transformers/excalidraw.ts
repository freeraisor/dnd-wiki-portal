import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import LZString from "lz-string"
import fs from "fs"
import path from "path"
import {
  FullSlug,
  TransformOptions,
  transformLink,
} from "../../util/path"

export interface ExcalidrawData {
  type: string
  version: number
  source: string
  elements: any[]
  appState: any
  files?: Record<string, any>
}

export interface Options {}

/**
 * Decompress Excalidraw data
 * Uses LZ-String decompression (same as Obsidian Excalidraw plugin)
 */
function decompressExcalidrawData(compressedData: string): ExcalidrawData | null {
  try {
    // Remove newlines and whitespace (Excalidraw adds newlines every 256 chars)
    const cleaned = compressedData.replace(/\s+/g, "")

    // Decompress using LZ-String
    const decompressed = LZString.decompressFromBase64(cleaned)

    if (!decompressed) {
      console.error("LZString decompression returned null for data length:", cleaned.length)
      console.error("Data preview:", cleaned.substring(0, 100))
      return null
    }

    // Parse JSON
    const parsed = JSON.parse(decompressed)

    if (parsed.type === "excalidraw") {
      return parsed as ExcalidrawData
    }

    return null
  } catch (e) {
    console.error("Failed to decompress Excalidraw data:", e)
    return null
  }
}

/**
 * Extract compressed-json from raw markdown text
 * This is needed because OFM transformer removes %% comments before AST parsing
 */
function extractCompressedJson(markdown: string): string | null {
  // Look for ```compressed-json blocks (may be inside %% comments)
  const regex = /```compressed-json\s*\n([\s\S]*?)\n```/
  const match = markdown.match(regex)
  return match ? match[1] : null
}

/**
 * Extract plain json from raw markdown text
 * For test/demo files that use plain JSON format
 */
function extractPlainJson(markdown: string): ExcalidrawData | null {
  // Look for ```json blocks with excalidraw data
  const regex = /```json\s*\n([\s\S]*?)\n```/
  const match = markdown.match(regex)
  if (!match) return null

  try {
    const parsed = JSON.parse(match[1])
    return parsed.type === "excalidraw" ? parsed : null
  } catch (e) {
    return null
  }
}

/**
 * Resolve wikilink to actual slug using Quartz's transformLink
 */
function resolveWikilink(
  wikilink: string,
  currentSlug: FullSlug,
  transformOptions: TransformOptions,
): string {
  // Extract the page name from [[Page Name]] or [[Page Name|Alias]]
  const match = wikilink.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/)
  if (!match) return wikilink

  const pageName = match[1].trim()

  // Use Quartz's transformLink to properly resolve the link
  try {
    return transformLink(currentSlug, pageName, transformOptions)
  } catch (e) {
    console.error(`Failed to resolve wikilink ${wikilink}:`, e)
    return wikilink
  }
}

/**
 * Find file in content directory using Quartz's resolution logic
 */
function findFileInContent(
  filename: string,
  contentRoot: string,
  currentFileDir: string,
): string | null {
  // Try multiple possible locations
  const possiblePaths = [
    path.join(currentFileDir, filename),
    path.join(currentFileDir, "..", filename),
    path.join(contentRoot, filename),
    path.join(contentRoot, "assets", filename),
    path.join(contentRoot, "attachments", filename),
  ]

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }

  return null
}

/**
 * Extract embedded files from markdown
 * Format: fileId: [[filename]]
 */
function extractEmbeddedFiles(
  markdown: string,
  filePath: string,
  contentRoot: string,
): Record<string, any> {
  const files: Record<string, any> = {}

  // Find ## Embedded Files section
  const embeddedFilesRegex = /## Embedded Files\s*\n([\s\S]*?)(?=\n##|\n%%|$)/
  const match = markdown.match(embeddedFilesRegex)

  if (!match) return files

  const embeddedSection = match[1]
  // Parse lines like: 367320ff60f16efa87ee5734a2ef5a86c4fd9e33: [[5.png]]
  const lineRegex = /([a-f0-9]+):\s*\[\[([^\]]+)\]\]/g
  let lineMatch

  const baseDir = path.dirname(filePath)

  while ((lineMatch = lineRegex.exec(embeddedSection)) !== null) {
    const fileId = lineMatch[1]
    const filename = lineMatch[2]

    // Find the file using proper resolution
    const resolvedPath = findFileInContent(filename, contentRoot, baseDir)

    if (resolvedPath) {
      try {
        const fileBuffer = fs.readFileSync(resolvedPath)
        const base64 = fileBuffer.toString("base64")

        // Determine MIME type
        const ext = path.extname(filename).toLowerCase()
        let mimeType = "image/png"
        if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg"
        else if (ext === ".gif") mimeType = "image/gif"
        else if (ext === ".svg") mimeType = "image/svg+xml"
        else if (ext === ".webp") mimeType = "image/webp"

        files[fileId] = {
          mimeType,
          id: fileId,
          dataURL: `data:${mimeType};base64,${base64}`,
          created: Date.now(),
        }

        console.log(`Loaded embedded file: ${filename} as ${fileId}`)
      } catch (e) {
        console.error(`Failed to read embedded file ${filename}:`, e)
      }
    } else {
      console.warn(`Could not find embedded file: ${filename}`)
    }
  }

  return files
}

/**
 * Transformer plugin for Excalidraw drawings
 * Parses .excalidraw.md files and extracts drawing data
 */
export const Excalidraw: QuartzTransformerPlugin<Partial<Options> | undefined> = (
  _userOpts,
) => {

  return {
    name: "Excalidraw",
    markdownPlugins(ctx) {
      return [
        () => {
          return (_tree: Root, file) => {
            const frontmatter = file.data.frontmatter as any

            // Check if this is an Excalidraw file
            if (frontmatter && frontmatter["excalidraw-plugin"] === "parsed") {
              const filePath = file.history?.[0]
              let excalidrawData: ExcalidrawData | null = null

              // Read the original file from disk to get content before OFM removes %% comments
              let rawMarkdown = ""
              if (filePath && fs.existsSync(filePath)) {
                rawMarkdown = fs.readFileSync(filePath, "utf-8")
              }

              // Try compressed format first (real Obsidian files)
              const compressedData = extractCompressedJson(rawMarkdown)
              if (compressedData) {
                excalidrawData = decompressExcalidrawData(compressedData)
              }

              // Fallback to plain JSON format (test/demo files)
              if (!excalidrawData) {
                excalidrawData = extractPlainJson(rawMarkdown)
              }

              // Store data for component to use
              if (excalidrawData && filePath) {
                const currentSlug = file.data.slug!
                const contentRoot = ctx.argv.directory

                // Transform options for link resolution
                const transformOptions: TransformOptions = {
                  strategy: "shortest",
                  allSlugs: ctx.allSlugs,
                }

                // Extract embedded files if any
                const embeddedFiles = extractEmbeddedFiles(rawMarkdown, filePath, contentRoot)

                // Merge embedded files with existing files
                if (Object.keys(embeddedFiles).length > 0) {
                  excalidrawData.files = {
                    ...excalidrawData.files,
                    ...embeddedFiles,
                  }
                  console.log(`Added ${Object.keys(embeddedFiles).length} embedded files`)
                }

                // Resolve wikilinks in elements
                if (excalidrawData.elements) {
                  for (const element of excalidrawData.elements) {
                    if (element.link) {
                      const originalLink = element.link
                      const resolvedLink = resolveWikilink(
                        originalLink,
                        currentSlug,
                        transformOptions,
                      )
                      element.link = resolvedLink
                      if (resolvedLink !== originalLink) {
                        console.log(`Resolved link: ${originalLink} -> ${resolvedLink}`)
                      }
                    }
                  }
                }

                file.data.excalidraw = excalidrawData

                // Mark this as an Excalidraw map type
                if (!frontmatter.type) {
                  frontmatter.type = "excalidraw-map"
                }
              }
            }
          }
        },
      ]
    },
  }
}

export default Excalidraw
