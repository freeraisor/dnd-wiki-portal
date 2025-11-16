import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { Code } from "mdast"

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
              let excalidrawData: ExcalidrawData | null = null

              // Find the JSON code block with Excalidraw data
              visit(tree, "code", (node: Code) => {
                if (node.lang === "json" && node.value) {
                  try {
                    const parsed = JSON.parse(node.value)
                    if (parsed.type === "excalidraw") {
                      excalidrawData = parsed
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              })

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
