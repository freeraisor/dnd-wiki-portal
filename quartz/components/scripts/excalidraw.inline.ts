// Excalidraw renderer - FULL support without CDN
interface ExcalidrawElement {
  type: string
  x: number
  y: number
  width?: number
  height?: number
  link?: string
  text?: string
  fontSize?: number
  fontFamily?: number
  textAlign?: string
  verticalAlign?: string
  strokeColor?: string
  backgroundColor?: string
  fillStyle?: string
  strokeWidth?: number
  strokeStyle?: string
  roughness?: number
  opacity?: number
  angle?: number
  points?: number[][]
  fileId?: string
  isDeleted?: boolean
  boundElements?: any[]
  updated?: number
  locked?: boolean
  customData?: any
  [key: string]: any
}

interface ExcalidrawData {
  type: string
  version: number
  source: string
  elements: ExcalidrawElement[]
  appState: any
  files?: Record<
    string,
    {
      mimeType: string
      id: string
      dataURL: string
      created: number
    }
  >
}

// Initialize maps
function initExcalidrawMaps() {
  const containers = document.querySelectorAll(".excalidraw-map-container")

  containers.forEach((container) => {
    try {
      const dataAttr = container.getAttribute("data-excalidraw")
      if (!dataAttr) return

      const data: ExcalidrawData = JSON.parse(dataAttr)
      const canvas = container.querySelector(".excalidraw-map-canvas")
      if (!canvas) return

      renderExcalidraw(canvas as HTMLElement, data, container as HTMLElement)
    } catch (error: any) {
      console.error("Error rendering Excalidraw:", error)
      const canvas = container.querySelector(".excalidraw-map-canvas")
      if (canvas) {
        canvas.innerHTML = `
          <div class="excalidraw-error">
            <p>⚠️ Error: ${error.message}</p>
          </div>
        `
      }
    }
  })
}

// Main render function
function renderExcalidraw(
  container: HTMLElement,
  data: ExcalidrawData,
  mapContainer: HTMLElement,
) {
  const { elements = [], files = {} } = data

  // Calculate bounds
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  elements.forEach((el) => {
    if (el.isDeleted) return
    minX = Math.min(minX, el.x)
    minY = Math.min(minY, el.y)
    maxX = Math.max(maxX, el.x + (el.width || 0))
    maxY = Math.max(maxY, el.y + (el.height || 0))
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
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")

  // Create defs for patterns and filters
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  svg.appendChild(defs)

  // Create background rectangle (uses CSS variable for color)
  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  background.setAttribute("class", "excalidraw-background")
  background.setAttribute("x", String(initialViewBox.x))
  background.setAttribute("y", String(initialViewBox.y))
  background.setAttribute("width", String(initialViewBox.width))
  background.setAttribute("height", String(initialViewBox.height))
  background.setAttribute("fill", "var(--light)")
  svg.appendChild(background)

  // Helper: create fill patterns
  const patternCounter = { value: 0 }
  const createPattern = (fillStyle: string, color: string) => {
    const id = `pattern-${patternCounter.value++}`
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern")
    pattern.setAttribute("id", id)
    pattern.setAttribute("patternUnits", "userSpaceOnUse")
    pattern.setAttribute("width", "8")
    pattern.setAttribute("height", "8")

    if (fillStyle === "hachure") {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.setAttribute("x1", "0")
      line.setAttribute("y1", "0")
      line.setAttribute("x2", "8")
      line.setAttribute("y2", "8")
      line.setAttribute("stroke", color)
      line.setAttribute("stroke-width", "1")
      pattern.appendChild(line)
    } else if (fillStyle === "cross-hatch") {
      const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line1.setAttribute("x1", "0")
      line1.setAttribute("y1", "0")
      line1.setAttribute("x2", "8")
      line1.setAttribute("y2", "8")
      line1.setAttribute("stroke", color)
      line1.setAttribute("stroke-width", "1")
      pattern.appendChild(line1)

      const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line2.setAttribute("x1", "0")
      line2.setAttribute("y1", "8")
      line2.setAttribute("x2", "8")
      line2.setAttribute("y2", "0")
      line2.setAttribute("stroke", color)
      line2.setAttribute("stroke-width", "1")
      pattern.appendChild(line2)
    } else if (fillStyle === "dots") {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("cx", "4")
      circle.setAttribute("cy", "4")
      circle.setAttribute("r", "1")
      circle.setAttribute("fill", color)
      pattern.appendChild(circle)
    }

    defs.appendChild(pattern)
    return `url(#${id})`
  }

  // Helper: get fill
  const getFill = (el: ExcalidrawElement) => {
    if (!el.backgroundColor || el.backgroundColor === "transparent") {
      return "transparent"
    }
    if (el.fillStyle === "solid" || !el.fillStyle) {
      return el.backgroundColor
    }
    return createPattern(el.fillStyle, el.backgroundColor)
  }

  // Sort elements by z-order
  const sortedElements = [...elements].sort((a, b) => {
    const indexA = a.index || "a0"
    const indexB = b.index || "a0"
    return indexA.localeCompare(indexB)
  })

  // Render each element
  sortedElements.forEach((el) => {
    if (el.isDeleted) return

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    // Apply rotation
    if (el.angle && el.angle !== 0) {
      const cx = el.x + (el.width || 0) / 2
      const cy = el.y + (el.height || 0) / 2
      const degrees = (el.angle * 180) / Math.PI
      group.setAttribute("transform", `rotate(${degrees} ${cx} ${cy})`)
    }

    // Apply opacity to group
    if (el.opacity && el.opacity < 100) {
      group.setAttribute("opacity", String(el.opacity / 100))
    }

    // Render by type
    if (el.type === "rectangle") {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", String(el.x))
      rect.setAttribute("y", String(el.y))
      rect.setAttribute("width", String(el.width || 0))
      rect.setAttribute("height", String(el.height || 0))
      rect.setAttribute("fill", getFill(el))
      rect.setAttribute("stroke", el.strokeColor || "#000")
      rect.setAttribute("stroke-width", String(el.strokeWidth || 1))

      if (el.strokeStyle === "dashed") {
        rect.setAttribute("stroke-dasharray", "8,8")
      } else if (el.strokeStyle === "dotted") {
        rect.setAttribute("stroke-dasharray", "2,4")
      }

      if (el.roundness) {
        const radius =
          typeof el.roundness === "number"
            ? el.roundness
            : Math.min(el.width || 0, el.height || 0) * 0.1
        rect.setAttribute("rx", String(radius))
        rect.setAttribute("ry", String(radius))
      }

      group.appendChild(rect)
    } else if (el.type === "ellipse") {
      const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
      ellipse.setAttribute("cx", String(el.x + (el.width || 0) / 2))
      ellipse.setAttribute("cy", String(el.y + (el.height || 0) / 2))
      ellipse.setAttribute("rx", String((el.width || 0) / 2))
      ellipse.setAttribute("ry", String((el.height || 0) / 2))
      ellipse.setAttribute("fill", getFill(el))
      ellipse.setAttribute("stroke", el.strokeColor || "#000")
      ellipse.setAttribute("stroke-width", String(el.strokeWidth || 1))

      if (el.strokeStyle === "dashed") {
        ellipse.setAttribute("stroke-dasharray", "8,8")
      } else if (el.strokeStyle === "dotted") {
        ellipse.setAttribute("stroke-dasharray", "2,4")
      }

      group.appendChild(ellipse)
    } else if (el.type === "diamond") {
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
      const cx = el.x + (el.width || 0) / 2
      const cy = el.y + (el.height || 0) / 2
      const points = [
        `${cx},${el.y}`,
        `${el.x + (el.width || 0)},${cy}`,
        `${cx},${el.y + (el.height || 0)}`,
        `${el.x},${cy}`,
      ].join(" ")
      polygon.setAttribute("points", points)
      polygon.setAttribute("fill", getFill(el))
      polygon.setAttribute("stroke", el.strokeColor || "#000")
      polygon.setAttribute("stroke-width", String(el.strokeWidth || 1))
      group.appendChild(polygon)
    } else if (el.type === "text") {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
      text.setAttribute("x", String(el.x))
      text.setAttribute("y", String(el.y + (el.fontSize || 20)))
      text.setAttribute("font-size", String(el.fontSize || 20))
      text.setAttribute("fill", el.strokeColor || "#000")

      // Handle text alignment
      if (el.textAlign === "center") {
        text.setAttribute("x", String(el.x + (el.width || 0) / 2))
        text.setAttribute("text-anchor", "middle")
      } else if (el.textAlign === "right") {
        text.setAttribute("x", String(el.x + (el.width || 0)))
        text.setAttribute("text-anchor", "end")
      }

      text.textContent = el.text || ""

      // Handle links (already resolved at build time)
      if (el.link) {
        const link = document.createElementNS("http://www.w3.org/2000/svg", "a")
        link.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", el.link)
        link.setAttribute("href", el.link)
        link.setAttribute("style", "cursor: pointer;")
        link.appendChild(text)
        group.appendChild(link)
      } else {
        group.appendChild(text)
      }
    } else if (el.type === "freedraw") {
      if (el.points && el.points.length > 0) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        let d = `M ${el.x + el.points[0][0]} ${el.y + el.points[0][1]}`
        for (let i = 1; i < el.points.length; i++) {
          d += ` L ${el.x + el.points[i][0]} ${el.y + el.points[i][1]}`
        }

        // Only close the path if first and last points are close (closed shape)
        const firstPoint = el.points[0]
        const lastPoint = el.points[el.points.length - 1]
        const threshold = 5 // pixels
        const isClosed =
          Math.abs(firstPoint[0] - lastPoint[0]) < threshold &&
          Math.abs(firstPoint[1] - lastPoint[1]) < threshold

        if (isClosed && el.backgroundColor && el.backgroundColor !== "transparent") {
          d += " Z"
        }

        path.setAttribute("d", d)
        path.setAttribute(
          "fill",
          isClosed && el.backgroundColor && el.backgroundColor !== "transparent"
            ? getFill(el)
            : "none",
        )
        path.setAttribute("stroke", el.strokeColor || "#000")
        path.setAttribute("stroke-width", String(el.strokeWidth || 1))
        path.setAttribute("stroke-linecap", "round")
        path.setAttribute("stroke-linejoin", "round")
        group.appendChild(path)
      }
    } else if (el.type === "line" || el.type === "arrow") {
      if (el.points && el.points.length > 0) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        let d = `M ${el.x + el.points[0][0]} ${el.y + el.points[0][1]}`
        for (let i = 1; i < el.points.length; i++) {
          d += ` L ${el.x + el.points[i][0]} ${el.y + el.points[i][1]}`
        }
        path.setAttribute("d", d)
        path.setAttribute("fill", "none")
        path.setAttribute("stroke", el.strokeColor || "#000")
        path.setAttribute("stroke-width", String(el.strokeWidth || 1))

        if (el.strokeStyle === "dashed") {
          path.setAttribute("stroke-dasharray", "8,8")
        } else if (el.strokeStyle === "dotted") {
          path.setAttribute("stroke-dasharray", "2,4")
        }

        // Add arrowhead for arrows
        if (el.type === "arrow" && el.points.length >= 2) {
          const markerId = `arrowhead-${patternCounter.value++}`
          const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
          marker.setAttribute("id", markerId)
          marker.setAttribute("markerWidth", "10")
          marker.setAttribute("markerHeight", "10")
          marker.setAttribute("refX", "9")
          marker.setAttribute("refY", "3")
          marker.setAttribute("orient", "auto")
          marker.setAttribute("markerUnits", "strokeWidth")

          const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
          arrowPath.setAttribute("d", "M0,0 L0,6 L9,3 z")
          arrowPath.setAttribute("fill", el.strokeColor || "#000")
          marker.appendChild(arrowPath)

          defs.appendChild(marker)
          path.setAttribute("marker-end", `url(#${markerId})`)
        }

        group.appendChild(path)
      }
    } else if (el.type === "image" && el.fileId) {
      const fileData = files[el.fileId]
      if (fileData && fileData.dataURL) {
        const image = document.createElementNS("http://www.w3.org/2000/svg", "image")
        image.setAttribute("class", "excalidraw-embedded-image")
        image.setAttribute("x", String(el.x))
        image.setAttribute("y", String(el.y))
        image.setAttribute("width", String(el.width || 0))
        image.setAttribute("height", String(el.height || 0))
        image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", fileData.dataURL)
        image.setAttribute("href", fileData.dataURL)
        group.appendChild(image)
      } else {
        console.warn(`Image file not found: ${el.fileId}`)
      }
    }

    svg.appendChild(group)
  })

  // Add to container
  container.innerHTML = ""
  container.appendChild(svg)
  container.style.cursor = "grab"

  // Add pan/zoom
  const panZoom = new PanZoom(svg, container, initialViewBox)

  // Add controls
  const controls = document.createElement("div")
  controls.className = "excalidraw-controls"
  controls.innerHTML = `
    <button class="excalidraw-btn zoom-in" title="Zoom In">+</button>
    <button class="excalidraw-btn zoom-out" title="Zoom Out">−</button>
    <button class="excalidraw-btn reset" title="Reset View">⟲</button>
    <button class="excalidraw-btn theme-toggle" title="Toggle Dark Mode">🌙</button>
  `

  controls.querySelector(".zoom-in")?.addEventListener("click", () => panZoom.zoom(0.8))
  controls.querySelector(".zoom-out")?.addEventListener("click", () => panZoom.zoom(1.2))
  controls.querySelector(".reset")?.addEventListener("click", () => panZoom.resetView())

  // Theme toggle - integrates with Quartz global theme
  const themeToggleBtn = controls.querySelector(".theme-toggle")

  // Helper function to apply theme-specific styling
  const applyTheme = (theme: "light" | "dark") => {
    if (theme === "dark") {
      // Apply invert filter to entire SVG (inverts lightness while preserving hue)
      svg.style.filter = "invert(93%) hue-rotate(180deg)"
      // Apply counter-filter to images so they appear correctly
      const images = svg.querySelectorAll(".excalidraw-embedded-image")
      images.forEach((img) => {
        ;(img as SVGElement).style.filter = "invert(93%) hue-rotate(180deg)"
      })
      ;(themeToggleBtn as HTMLElement).textContent = "☀️"
      ;(themeToggleBtn as HTMLElement).title = "Toggle Light Mode"
    } else {
      svg.style.filter = ""
      const images = svg.querySelectorAll(".excalidraw-embedded-image")
      images.forEach((img) => {
        ;(img as SVGElement).style.filter = ""
      })
      ;(themeToggleBtn as HTMLElement).textContent = "🌙"
      ;(themeToggleBtn as HTMLElement).title = "Toggle Dark Mode"
    }
  }

  // Initialize theme from Quartz global theme
  const currentTheme = (document.documentElement.getAttribute("saved-theme") ||
    "light") as "light" | "dark"
  applyTheme(currentTheme)

  // Listen for theme changes from Quartz (syncs with other theme toggles)
  document.addEventListener("themechange", (e: any) => {
    applyTheme(e.detail.theme)
  })

  // Toggle Quartz global theme when button is clicked
  themeToggleBtn?.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("saved-theme") === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("saved-theme", newTheme)
    localStorage.setItem("theme", newTheme)

    // Emit theme change event for other components
    const event = new CustomEvent("themechange", {
      detail: { theme: newTheme },
    })
    document.dispatchEvent(event)
  })

  mapContainer.appendChild(controls)
}

// Pan and Zoom
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
