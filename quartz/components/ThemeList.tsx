import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ThemeList = ({ fileData }: QuartzComponentProps) => {
  const themes = (fileData.frontmatter?.themes ?? []) as string[]
  if (themes.length === 0) return null

  return (
    <section class="theme-list">
      <h3>Themes:</h3>
      <ul>
      {themes.map((raw) => {
          // убираем возможные кавычки + [[wikilink]]
          const clean = raw
            .replace(/^['"]?\[\[/, "")
            .replace(/\]\]['"]?$/, "")
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