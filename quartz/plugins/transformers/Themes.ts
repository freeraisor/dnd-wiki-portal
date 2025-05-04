// quartz/plugins/transformers/themes.ts
import { QuartzTransformerPlugin } from "../types"
import { Root, Heading, List, ListItem, Paragraph, Text, Link } from "mdast"

export interface Options {
  property?: string
}

export const Themes: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { property: "themes", ...userOpts }
  const clean = (s: string) => s.trim().replace(/^\[\[/, "").replace(/\]\]$/, "")

  return {
    name: "Themes",
    markdownPlugins() {
      return [
        () => (tree: Root, file) => {
          const raw = (file.data as any)?.frontmatter?.[opts.property]
          const themes: string[] =
            Array.isArray(raw) ? raw :
            typeof raw === "string" ? [raw] : []

          if (!themes.length) return

          const heading: Heading = {
            type: "heading",
            depth: 1,
            children: [{ type: "text", value: "Themes:" } as Text],
          }

          const list: List = { type: "list", ordered: false, spread: true, children: [] }

          themes.forEach((t) => {
            const val = clean(t)
            const para: Paragraph = {
              type: "paragraph",
              children: [
                {
                  type: "link",
                  url: val,
                  title: null,
                  children: [{ type: "text", value: val } as Text],
                } as Link,
              ],
            }
            list.children.push({ type: "listItem", spread: false, children: [para] } as ListItem)
          })

          const hr = { type: "thematicBreak" } as any

          tree.children.unshift(hr)
          tree.children.unshift(list)
          tree.children.unshift(heading)
        },
      ]
    },
  }
}
