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

    // Serialize data for client-side rendering
    const dataJson = JSON.stringify(excalidrawData)

    return (
      <div
        class={classNames(displayClass, "excalidraw-map-container")}
        data-excalidraw={dataJson}
      >
        <div class="excalidraw-map-canvas" id={`excalidraw-${fileData.slug}`}>
          {/* Canvas will be rendered by client-side script */}
        </div>
      </div>
    )
  }

  ExcalidrawMap.afterDOMLoaded = excalidrawScript

  ExcalidrawMap.css = `
    /* Hide everything for Excalidraw maps */
    body[data-slug$=".excalidraw"] .left.sidebar,
    body[data-slug$=".excalidraw"] .right.sidebar,
    body[data-slug$=".excalidraw"] .page-header,
    body[data-slug$=".excalidraw"] article,
    body[data-slug$=".excalidraw"] .page-footer,
    body[data-slug$=".excalidraw"] footer {
      display: none !important;
    }

    body[data-slug$=".excalidraw"] .center {
      max-width: 100%;
      margin: 0;
      padding: 0;
    }

    .excalidraw-map-container {
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      background: white;
      overflow: hidden;
      z-index: 1;
    }

    .excalidraw-map-canvas {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .excalidraw-map-canvas svg {
      max-width: 95%;
      max-height: 95%;
      width: auto;
      height: auto;
    }

    .excalidraw-error {
      padding: 2rem;
      text-align: center;
      color: var(--red);
    }

    .excalidraw-controls {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 10;
    }

    .excalidraw-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 1px solid var(--lightgray);
      background: var(--light);
      color: var(--dark);
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }

    .excalidraw-btn:hover {
      background: var(--lightgray);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .excalidraw-btn:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  `

  return ExcalidrawMap
}) satisfies QuartzComponentConstructor
