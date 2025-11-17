// Excalidraw Map Viewer with official library support
interface ExcalidrawElement {
  type: string
  x: number
  y: number
  width?: number
  height?: number
  link?: string
  [key: string]: any
}

interface ExcalidrawData {
  type: string
  version: number
  source: string
  elements: ExcalidrawElement[]
  appState: any
  files?: Record<string, any>
}

// Initialize Excalidraw maps
async function initExcalidrawMaps() {
  const mapContainers = document.querySelectorAll(".excalidraw-map-container")

  for (const container of mapContainers) {
    try {
      const dataAttr = container.getAttribute("data-excalidraw")
      if (!dataAttr) continue

      const data: ExcalidrawData = JSON.parse(dataAttr)
      const canvas = container.querySelector(".excalidraw-map-canvas")
      if (!canvas) continue

      // Try to load official Excalidraw library
      await renderExcalidrawMap(canvas as HTMLElement, data, container as HTMLElement)
    } catch (error: any) {
      console.error("Error rendering Excalidraw:", error)
      const canvas = container.querySelector(".excalidraw-map-canvas")
      if (canvas) {
        canvas.innerHTML = `
          <div class="excalidraw-error">
            <p>⚠️ Error loading map</p>
            <p class="error-details">${error.message}</p>
          </div>
        `
      }
    }
  }
}

// Render Excalidraw map
async function renderExcalidrawMap(
  container: HTMLElement,
  data: ExcalidrawData,
  mapContainer: HTMLElement,
) {
  try {
    // Try to use official Excalidraw library
    const ExcalidrawLib = await import("https://esm.sh/@excalidraw/excalidraw@0.18.0")
    await renderWithOfficial(container, data, mapContainer, ExcalidrawLib.exportToSvg)
  } catch (error) {
    console.warn("Failed to load official Excalidraw, using fallback:", error)
    // Fallback to custom renderer
    renderExcalidrawFallback(container, data, mapContainer)
  }
}

// Render with official library
async function renderWithOfficial(
  container: HTMLElement,
  data: ExcalidrawData,
  mapContainer: HTMLElement,
  exportToSvg: any,
) {
  // Process wiki-links in elements
  const processedElements = processWikiLinks(data.elements)

  // Generate SVG using official library
  const svg = await exportToSvg({
    elements: processedElements,
    appState: {
      ...data.appState,
      exportBackground: true,
      exportWithDarkMode: false,
      viewBackgroundColor: "#ffffff",
    },
    files: data.files || {},
  })

  // Configure SVG
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")

  // Add to container
  container.innerHTML = ""
  container.appendChild(svg)
  container.style.cursor = "grab"

  // Get viewBox for pan/zoom
  const vb = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, 800, 600]
  const initialViewBox = { x: vb[0], y: vb[1], width: vb[2], height: vb[3] }

  // Add pan/zoom
  const panZoom = new PanZoom(svg, container, initialViewBox)
  addControls(mapContainer, panZoom)

  // Make links clickable
  processClickableLinks(svg)
}

// Process wiki-links and convert them to URLs
function processWikiLinks(elements: ExcalidrawElement[]): ExcalidrawElement[] {
  return elements.map((el) => {
    if (el.link) {
      // Handle wiki-links: [[Page Name]] or [[Page Name|Alias]]
      const wikiLinkMatch = el.link.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/)
      if (wikiLinkMatch) {
        const pageName = wikiLinkMatch[1].trim()
        const urlPath = "/" + pageName.replace(/ /g, "-").toLowerCase()
        return { ...el, link: urlPath }
      }

      // Handle markdown links: [text](url)
      const mdLinkMatch = el.link.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (mdLinkMatch) {
        return { ...el, link: mdLinkMatch[2] }
      }
    }
    return el
  })
}

// Make links clickable in SVG
function processClickableLinks(svg: SVGElement) {
  const links = svg.querySelectorAll("a, text[href]")
  links.forEach((el) => {
    el.setAttribute("cursor", "pointer")
    el.setAttribute("style", "cursor: pointer;")
  })
}

// Add control buttons
function addControls(mapContainer: HTMLElement, panZoom: PanZoom) {
  const controls = document.createElement("div")
  controls.className = "excalidraw-controls"
  controls.innerHTML = `
    <button class="excalidraw-btn zoom-in" title="Zoom In">+</button>
    <button class="excalidraw-btn zoom-out" title="Zoom Out">−</button>
    <button class="excalidraw-btn reset" title="Reset View">⟲</button>
  `

  controls.querySelector(".zoom-in")?.addEventListener("click", () => panZoom.zoom(0.8))
  controls.querySelector(".zoom-out")?.addEventListener("click", () => panZoom.zoom(1.2))
  controls.querySelector(".reset")?.addEventListener("click", () => panZoom.resetView())

  mapContainer.appendChild(controls)
}

// Fallback custom renderer
function renderExcalidrawFallback(
  container: HTMLElement,
  data: ExcalidrawData,
  mapContainer: HTMLElement,
) {
  const { elements = [] } = data

  // Calculate bounds
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  elements.forEach((el) => {
    if (el.x !== undefined && el.y !== undefined) {
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + (el.width || 0))
      maxY = Math.max(maxY, el.y + (el.height || 0))
    }
  })

  const width = maxX - minX || 800
  const height = maxY - minY || 600
  const padding = 50

  const initialViewBox = {
    x: minX - padding,
    y: minY - padding,
    width: width + padding * 2,
    height: height + padding * 2,
  }

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")
  svg.setAttribute(
    "viewBox",
    `${initialViewBox.x} ${initialViewBox.y} ${initialViewBox.width} ${initialViewBox.height}`,
  )

  // Create defs for patterns
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  svg.appendChild(defs)

  // Process and render elements
  const processedElements = processWikiLinks(elements)

  processedElements.forEach((el) => {
    if (el.isDeleted) return

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    // Apply rotation
    if (el.angle && el.angle !== 0) {
      const cx = el.x + (el.width || 0) / 2
      const cy = el.y + (el.height || 0) / 2
      const degrees = (el.angle * 180) / Math.PI
      group.setAttribute("transform", `rotate(${degrees} ${cx} ${cy})`)
    }

    // Render by type
    if (el.type === "rectangle") {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", String(el.x))
      rect.setAttribute("y", String(el.y))
      rect.setAttribute("width", String(el.width))
      rect.setAttribute("height", String(el.height))
      rect.setAttribute("fill", el.backgroundColor || "transparent")
      rect.setAttribute("stroke", el.strokeColor || "#000")
      rect.setAttribute("stroke-width", String(el.strokeWidth || 1))
      rect.setAttribute("opacity", String((el.opacity || 100) / 100))
      group.appendChild(rect)
    } else if (el.type === "ellipse") {
      const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
      ellipse.setAttribute("cx", String(el.x + el.width / 2))
      ellipse.setAttribute("cy", String(el.y + el.height / 2))
      ellipse.setAttribute("rx", String(el.width / 2))
      ellipse.setAttribute("ry", String(el.height / 2))
      ellipse.setAttribute("fill", el.backgroundColor || "transparent")
      ellipse.setAttribute("stroke", el.strokeColor || "#000")
      ellipse.setAttribute("stroke-width", String(el.strokeWidth || 1))
      ellipse.setAttribute("opacity", String((el.opacity || 100) / 100))
      group.appendChild(ellipse)
    } else if (el.type === "text") {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
      text.setAttribute("x", String(el.x))
      text.setAttribute("y", String(el.y + (el.fontSize || 20)))
      text.setAttribute("font-size", String(el.fontSize || 20))
      text.setAttribute("fill", el.strokeColor || "#000")
      text.textContent = el.text || ""

      if (el.link) {
        const link = document.createElementNS("http://www.w3.org/2000/svg", "a")
        link.setAttribute("href", el.link)
        link.setAttribute("style", "cursor: pointer;")
        link.appendChild(text)
        group.appendChild(link)
      } else {
        group.appendChild(text)
      }
    } else if (el.type === "freedraw" && el.points && el.points.length > 0) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      let d = `M ${el.x + el.points[0][0]} ${el.y + el.points[0][1]}`
      for (let i = 1; i < el.points.length; i++) {
        d += ` L ${el.x + el.points[i][0]} ${el.y + el.points[i][1]}`
      }
      if (el.backgroundColor && el.backgroundColor !== "transparent") {
        d += " Z"
      }
      path.setAttribute("d", d)
      path.setAttribute(
        "fill",
        el.backgroundColor && el.backgroundColor !== "transparent" ? el.backgroundColor : "none",
      )
      path.setAttribute("stroke", el.strokeColor || "#000")
      path.setAttribute("stroke-width", String(el.strokeWidth || 1))
      path.setAttribute("opacity", String((el.opacity || 100) / 100))
      group.appendChild(path)
    } else if ((el.type === "line" || el.type === "arrow") && el.points && el.points.length > 0) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      let d = `M ${el.x + el.points[0][0]} ${el.y + el.points[0][1]}`
      for (let i = 1; i < el.points.length; i++) {
        d += ` L ${el.x + el.points[i][0]} ${el.y + el.points[i][1]}`
      }
      path.setAttribute("d", d)
      path.setAttribute("fill", "none")
      path.setAttribute("stroke", el.strokeColor || "#000")
      path.setAttribute("stroke-width", String(el.strokeWidth || 1))
      path.setAttribute("opacity", String((el.opacity || 100) / 100))
      group.appendChild(path)
    } else if (el.type === "image" && el.fileId) {
      const imageData = data.files?.[el.fileId]
      if (imageData && imageData.dataURL) {
        const image = document.createElementNS("http://www.w3.org/2000/svg", "image")
        image.setAttribute("x", String(el.x))
        image.setAttribute("y", String(el.y))
        image.setAttribute("width", String(el.width))
        image.setAttribute("height", String(el.height))
        image.setAttribute("href", imageData.dataURL)
        image.setAttribute("opacity", String((el.opacity || 100) / 100))
        group.appendChild(image)
      }
    }

    svg.appendChild(group)
  })

  container.innerHTML = ""
  container.appendChild(svg)
  container.style.cursor = "grab"

  const panZoom = new PanZoom(svg, container, initialViewBox)
  addControls(mapContainer, panZoom)
}

// Pan and Zoom class
class PanZoom {
  private svg: SVGElement
  private container: HTMLElement
  private viewBox: { x: number; y: number; width: number; height: number }
  private initialViewBox: { x: number; y: number; width: number; height: number }
  private scale = 1
  private isPanning = false
  private startPoint = { x: 0, y: 0 }

  constructor(
    svg: SVGElement,
    container: HTMLElement,
    initialViewBox: { x: number; y: number; width: number; height: number },
  ) {
    this.svg = svg
    this.container = container
    this.initialViewBox = { ...initialViewBox }
    this.viewBox = { ...initialViewBox }
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.container.addEventListener("mousedown", (e) => this.onMouseDown(e))
    this.container.addEventListener("mousemove", (e) => this.onMouseMove(e))
    this.container.addEventListener("mouseup", () => this.onMouseUp())
    this.container.addEventListener("mouseleave", () => this.onMouseUp())
    this.container.addEventListener("wheel", (e) => this.onWheel(e), { passive: false })

    this.container.addEventListener("touchstart", (e) => this.onTouchStart(e), { passive: false })
    this.container.addEventListener("touchmove", (e) => this.onTouchMove(e), { passive: false })
    this.container.addEventListener("touchend", () => this.onMouseUp())
  }

  private getPoint(event: MouseEvent | Touch) {
    const rect = this.container.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  private onMouseDown(event: MouseEvent) {
    if ((event.target as HTMLElement).closest("a")) return
    this.isPanning = true
    this.startPoint = this.getPoint(event)
    this.container.style.cursor = "grabbing"
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isPanning) return
    const endPoint = this.getPoint(event)
    const dx = (endPoint.x - this.startPoint.x) * (this.viewBox.width / this.container.clientWidth)
    const dy = (endPoint.y - this.startPoint.y) * (this.viewBox.height / this.container.clientHeight)
    this.viewBox.x -= dx
    this.viewBox.y -= dy
    this.updateViewBox()
    this.startPoint = endPoint
  }

  private onMouseUp() {
    this.isPanning = false
    this.container.style.cursor = "grab"
  }

  private onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      event.preventDefault()
      this.isPanning = true
      this.startPoint = this.getPoint(event.touches[0])
    }
  }

  private onTouchMove(event: TouchEvent) {
    if (!this.isPanning || event.touches.length !== 1) return
    event.preventDefault()
    const endPoint = this.getPoint(event.touches[0])
    const dx = (endPoint.x - this.startPoint.x) * (this.viewBox.width / this.container.clientWidth)
    const dy = (endPoint.y - this.startPoint.y) * (this.viewBox.height / this.container.clientHeight)
    this.viewBox.x -= dx
    this.viewBox.y -= dy
    this.updateViewBox()
    this.startPoint = endPoint
  }

  private onWheel(event: WheelEvent) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    this.zoom(delta, this.getPoint(event))
  }

  public zoom(factor: number, point?: { x: number; y: number }) {
    const oldScale = this.scale
    this.scale *= factor

    if (this.scale < 0.1) {
      this.scale = 0.1
      return
    }
    if (this.scale > 10) {
      this.scale = 10
      return
    }

    if (point) {
      const scaleChange = factor - 1
      const viewX = this.viewBox.x + (point.x / this.container.clientWidth) * this.viewBox.width
      const viewY = this.viewBox.y + (point.y / this.container.clientHeight) * this.viewBox.height
      this.viewBox.x += viewX * scaleChange
      this.viewBox.y += viewY * scaleChange
    }

    this.viewBox.width /= factor
    this.viewBox.height /= factor
    this.updateViewBox()
  }

  public resetView() {
    this.scale = 1
    this.viewBox = { ...this.initialViewBox }
    this.updateViewBox()
  }

  private updateViewBox() {
    this.svg.setAttribute(
      "viewBox",
      `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`,
    )
  }
}

// Initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExcalidrawMaps)
} else {
  initExcalidrawMaps()
}

document.addEventListener("nav", initExcalidrawMaps)
