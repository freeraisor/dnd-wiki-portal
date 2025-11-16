// @ts-ignore
import excalidrawScript from "./scripts/excalidraw.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

interface ExcalidrawData {
  type: string
  version: number
  source: string
  elements: any[]
  appState: any
  files?: Record<string, any>
}

export default (() => {
  const ExcalidrawMap: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const excalidrawData = (fileData as any).excalidraw as ExcalidrawData | undefined

    if (!excalidrawData) {
      return null
    }

    // Extract basic info
    const elements = excalidrawData.elements || []
    const markerCount = elements.filter((el) => el.type === "text" && el.link).length
    const zoneCount = elements.filter(
      (el) =>
        (el.type === "rectangle" || el.type === "ellipse") &&
        el.backgroundColor &&
        el.opacity &&
        el.opacity < 100,
    ).length

    return (
      <div class={classNames(displayClass, "excalidraw-map-container")}>
        <div class="excalidraw-map-header">
          <h3>🗺️ Interactive Map</h3>
          <div class="excalidraw-map-stats">
            <span class="excalidraw-stat">
              <span class="excalidraw-stat-icon">📍</span>
              {markerCount} markers
            </span>
            <span class="excalidraw-stat">
              <span class="excalidraw-stat-icon">🎯</span>
              {zoneCount} zones
            </span>
            <span class="excalidraw-stat">
              <span class="excalidraw-stat-icon">📐</span>
              {elements.length} elements
            </span>
          </div>
        </div>

        <div class="excalidraw-map-viewer">
          <div class="excalidraw-map-canvas" id={`excalidraw-${fileData.slug}`}>
            {/* Canvas will be rendered by client-side script */}
          </div>
        </div>

        <div class="excalidraw-map-footer">
          <p class="excalidraw-map-note">
            💡 This is an Excalidraw map. Open in Obsidian to edit.
          </p>
        </div>
      </div>
    )
  }

  ExcalidrawMap.afterDOMLoaded = excalidrawScript

  ExcalidrawMap.css = `
    .excalidraw-map-container {
      margin: 2rem 0;
      border: 1px solid var(--gray);
      border-radius: 8px;
      overflow: hidden;
      background: var(--light);
    }

    .excalidraw-map-header {
      padding: 1rem;
      background: var(--lightgray);
      border-bottom: 1px solid var(--gray);
    }

    .excalidraw-map-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
    }

    .excalidraw-map-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: var(--gray);
    }

    .excalidraw-stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .excalidraw-stat-icon {
      font-size: 1.1em;
    }

    .excalidraw-map-viewer {
      padding: 1rem;
      background: white;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .excalidraw-map-canvas {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .excalidraw-map-canvas svg {
      max-width: 100%;
      height: auto;
    }

    .excalidraw-map-footer {
      padding: 0.75rem 1rem;
      background: var(--lightgray);
      border-top: 1px solid var(--gray);
    }

    .excalidraw-map-note {
      margin: 0;
      font-size: 0.85rem;
      color: var(--gray);
    }

    .excalidraw-error {
      padding: 2rem;
      text-align: center;
      color: var(--red);
    }

    .error-details {
      font-size: 0.85rem;
      color: var(--gray);
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .excalidraw-map-stats {
        flex-direction: column;
        gap: 0.5rem;
      }

      .excalidraw-map-viewer {
        min-height: 300px;
      }
    }
  `

  return ExcalidrawMap
}) satisfies QuartzComponentConstructor
