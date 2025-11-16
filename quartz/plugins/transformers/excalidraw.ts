import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { Code } from "mdast"
import LZString from "lz-string"
import fs from "fs"
import path from "path"

export interface ExcalidrawData {
  type: string
  version: number
  source: string
  elements: any[]
  appState: any
  files?: Record<string, any>
}

export interface Options {}

const defaultOptions: Options = {}

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
      console.error("LZString decompression returned null")
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
 * Transformer plugin for Excalidraw drawings
 * Parses .excalidraw.md files and extracts drawing data
 */
export const Excalidraw: QuartzTransformerPlugin<Partial<Options> | undefined> = (
  userOpts,
) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "Excalidraw",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, file) => {
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

              const compressedData = extractCompressedJson(rawMarkdown)

              if (compressedData) {
                excalidrawData = decompressExcalidrawData(compressedData)
              }

              // Store data for component to use
              if (excalidrawData) {
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
