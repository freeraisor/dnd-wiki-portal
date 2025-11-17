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
    /* Hide everything for Excalidraw maps except the map itself */
    body[data-slug$=".excalidraw"] .left.sidebar,
    body[data-slug$=".excalidraw"] .right.sidebar,
    body[data-slug$=".excalidraw"] .page-footer,
    body[data-slug$=".excalidraw"] footer,
    body[data-slug$=".excalidraw.md"] .left.sidebar,
    body[data-slug$=".excalidraw.md"] .right.sidebar,
    body[data-slug$=".excalidraw.md"] .page-footer,
    body[data-slug$=".excalidraw.md"] footer {
      display: none !important;
    }

    /* Hide article content entirely */
    body[data-slug$=".excalidraw"] article,
    body[data-slug$=".excalidraw.md"] article {
      display: none !important;
    }

    /* Hide article content entirely */
    body[data-slug$=".excalidraw"] article {
      display: none !important;
    }

    /* Only keep the Excalidraw container within the header area */
    body[data-slug$=".excalidraw"] .page-header {
      padding: 0;
      margin: 0;
    }

    body[data-slug$=".excalidraw"] .page-header .popover-hint {
      padding: 0;
    }

    body[data-slug$=".excalidraw"] .page-header .popover-hint > *:not(.excalidraw-map-container) {
      display: none !important;
    }

    body[data-slug$=".excalidraw"] .center,
    body[data-slug$=".excalidraw.md"] .center {
      max-width: 100%;
      margin: 0;
      padding: 0;
    }

    body[data-slug$=".excalidraw"] #quartz-body,
    body[data-slug$=".excalidraw.md"] #quartz-body {
      padding: 0;
    }

    body[data-slug$=".excalidraw"],
    body[data-slug$=".excalidraw.md"] {
      overflow: hidden;
    }

    .excalidraw-map-container {
      width: 100vw;
      height: 100vh;
      position: fixed;
      inset: 0;
      background: #ffffff;
      overflow: hidden;
      z-index: 1000;
    }

    .excalidraw-map-container.dark-theme {
      background: #1e1e1e;
    }

    .excalidraw-map-canvas {
      width: 100%;
      height: 100%;
    }

    .excalidraw-map-canvas svg {
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      display: block;
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
