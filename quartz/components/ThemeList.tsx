import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ThemeList = ({ fileData }: QuartzComponentProps) => {
  const themes = (fileData.frontmatter?.themes ?? []) as string[]
  if (themes.length === 0) return null

  return (
    <section class="theme-list">
      <h3>Themes:</h3>
      <ul>
        {themes.map((raw) => {
          const clean = raw.replace(/^\[\[|\]\]$/g, "")
          return (
            <li>
              {/* ссылка ведёт на саму страницу-тему */}
              <a href={`/${clean}.html`}>{clean}</a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default (() => ThemeList) satisfies QuartzComponentConstructor