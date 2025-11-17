// Excalidraw Map Viewer with Pan and Zoom
function initExcalidrawMaps() {
  const mapContainers = document.querySelectorAll(".excalidraw-map-container")

  mapContainers.forEach(async (container) => {
    try {
      // Get excalidraw data from data attribute
      const dataAttr = container.getAttribute("data-excalidraw")
      if (!dataAttr) {
        console.warn("No Excalidraw data found")
        return
      }

      const data = JSON.parse(dataAttr)
      const canvas = container.querySelector(".excalidraw-map-canvas")
      if (!canvas) {
        console.warn("No canvas element found")
        return
      }

      // Render the map
      renderExcalidrawPreview(canvas as HTMLElement, data, container as HTMLElement)
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
  })
}

// Initialize on both initial load and SPA navigation
document.addEventListener("DOMContentLoaded", initExcalidrawMaps)
document.addEventListener("nav", initExcalidrawMaps)

class PanZoom {
  private svg: SVGElement
  private container: HTMLElement
  private viewBox: { x: number; y: number; width: number; height: number }
  private scale = 1
  private isPanning = false
  private startPoint = { x: 0, y: 0 }
  private endPoint = { x: 0, y: 0 }

  constructor(svg: SVGElement, container: HTMLElement) {
    this.svg = svg
    this.container = container

    // Get initial viewBox
    const vb = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, 800, 600]
    this.viewBox = { x: vb[0], y: vb[1], width: vb[2], height: vb[3] }

    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Mouse events for panning
    this.container.addEventListener("mousedown", this.onMouseDown.bind(this))
    this.container.addEventListener("mousemove", this.onMouseMove.bind(this))
    this.container.addEventListener("mouseup", this.onMouseUp.bind(this))
    this.container.addEventListener("mouseleave", this.onMouseUp.bind(this))

    // Touch events for mobile
    this.container.addEventListener("touchstart", this.onTouchStart.bind(this), {
      passive: false,
    })
    this.container.addEventListener("touchmove", this.onTouchMove.bind(this), {
      passive: false,
    })
    this.container.addEventListener("touchend", this.onTouchEnd.bind(this))

    // Wheel for zoom
    this.container.addEventListener("wheel", this.onWheel.bind(this), { passive: false })
  }

  private getPoint(event: MouseEvent | Touch) {
    const rect = this.container.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  private onMouseDown(event: MouseEvent) {
    this.isPanning = true
    this.startPoint = this.getPoint(event)
    this.endPoint = this.startPoint
    this.container.style.cursor = "grabbing"
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isPanning) return

    this.endPoint = this.getPoint(event)
    const dx = (this.endPoint.x - this.startPoint.x) * (this.viewBox.width / this.container.clientWidth)
    const dy =
      (this.endPoint.y - this.startPoint.y) * (this.viewBox.height / this.container.clientHeight)

    this.viewBox.x -= dx
    this.viewBox.y -= dy
    this.updateViewBox()

    this.startPoint = this.endPoint
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
      this.endPoint = this.startPoint
    }
  }

  private onTouchMove(event: TouchEvent) {
    if (!this.isPanning || event.touches.length !== 1) return

    event.preventDefault()
    this.endPoint = this.getPoint(event.touches[0])
    const dx = (this.endPoint.x - this.startPoint.x) * (this.viewBox.width / this.container.clientWidth)
    const dy =
      (this.endPoint.y - this.startPoint.y) * (this.viewBox.height / this.container.clientHeight)

    this.viewBox.x -= dx
    this.viewBox.y -= dy
    this.updateViewBox()

    this.startPoint = this.endPoint
  }

  private onTouchEnd() {
    this.isPanning = false
  }

  private onWheel(event: WheelEvent) {
    event.preventDefault()

    const delta = event.deltaY > 0 ? 0.9 : 1.1
    this.zoom(delta, this.getPoint(event))
  }

  public zoom(factor: number, point?: { x: number; y: number }) {
    const oldScale = this.scale
    this.scale *= factor

    // Limit zoom
    if (this.scale < 0.1) {
      this.scale = 0.1
      return
    }
    if (this.scale > 10) {
      this.scale = 10
      return
    }

    if (point) {
      // Zoom towards mouse position
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

  public reset(initialViewBox: { x: number; y: number; width: number; height: number }) {
    this.scale = 1
    this.viewBox = { ...initialViewBox }
    this.updateViewBox()
  }

  private updateViewBox() {
    this.svg.setAttribute(
      "viewBox",
      `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`,
    )
  }
}

function renderExcalidrawPreview(container: HTMLElement, data: any, mapContainer: HTMLElement) {
  // Simple preview renderer
  const { elements = [], appState = {} } = data

  // Calculate bounds
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  elements.forEach((el: any) => {
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

  // Sort elements by fractional index for correct z-order
  const sortedElements = [...elements].sort((a: any, b: any) => {
    const indexA = a.index || "a0"
    const indexB = b.index || "a0"
    return indexA.localeCompare(indexB)
  })

  // Helper function to apply common styles
  const applyStyles = (element: SVGElement, el: any) => {
    element.setAttribute("stroke", el.strokeColor || "#000")
    element.setAttribute("stroke-width", String(el.strokeWidth || 1))
    element.setAttribute("opacity", String((el.opacity || 100) / 100))

    // Apply stroke style (dashed, dotted)
    if (el.strokeStyle === "dashed") {
      element.setAttribute("stroke-dasharray", "8,8")
    } else if (el.strokeStyle === "dotted") {
      element.setAttribute("stroke-dasharray", "2,4")
    }
  }

  // Helper function to calculate rotation center and apply transform
  const applyRotation = (group: SVGElement, el: any) => {
    if (el.angle && el.angle !== 0) {
      const cx = el.x + (el.width || 0) / 2
      const cy = el.y + (el.height || 0) / 2
      const degrees = (el.angle * 180) / Math.PI
      group.setAttribute("transform", `rotate(${degrees} ${cx} ${cy})`)
    }
  }

  // Render elements
  sortedElements.forEach((el: any) => {
    if (el.isDeleted) return

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
    applyRotation(group, el)

    if (el.type === "rectangle") {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", el.x)
      rect.setAttribute("y", el.y)
      rect.setAttribute("width", el.width)
      rect.setAttribute("height", el.height)
      rect.setAttribute("fill", el.backgroundColor || "transparent")
      applyStyles(rect, el)
      group.appendChild(rect)
    } else if (el.type === "ellipse") {
      const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
      ellipse.setAttribute("cx", el.x + el.width / 2)
      ellipse.setAttribute("cy", el.y + el.height / 2)
      ellipse.setAttribute("rx", el.width / 2)
      ellipse.setAttribute("ry", el.height / 2)
      ellipse.setAttribute("fill", el.backgroundColor || "transparent")
      applyStyles(ellipse, el)
      group.appendChild(ellipse)
    } else if (el.type === "diamond") {
      // Diamond is a rotated square - render as polygon
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
      const cx = el.x + el.width / 2
      const cy = el.y + el.height / 2
      const points = [
        `${cx},${el.y}`, // top
        `${el.x + el.width},${cy}`, // right
        `${cx},${el.y + el.height}`, // bottom
        `${el.x},${cy}`, // left
      ].join(" ")
      polygon.setAttribute("points", points)
      polygon.setAttribute("fill", el.backgroundColor || "transparent")
      applyStyles(polygon, el)
      group.appendChild(polygon)
    } else if (el.type === "text") {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
      text.setAttribute("x", el.x)
      text.setAttribute("y", el.y + (el.fontSize || 20))
      text.setAttribute("font-size", el.fontSize || 20)
      text.setAttribute("fill", el.strokeColor || "#000")
      text.textContent = el.text || ""

      if (el.link) {
        const link = document.createElementNS("http://www.w3.org/2000/svg", "a")
        const wikiLink = el.link.match(/\[\[(.+?)\]\]/)
        if (wikiLink) {
          const href = "/" + wikiLink[1].replace(/ /g, "-").toLowerCase()
          link.setAttribute("href", href)
          link.appendChild(text)
          group.appendChild(link)
        } else {
          group.appendChild(text)
        }
      } else {
        group.appendChild(text)
      }
    } else if (el.type === "freedraw") {
      // Handle freehand drawing
      if (el.points && el.points.length > 0) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

        // Convert points array to SVG path
        let d = `M ${el.x + el.points[0][0]} ${el.y + el.points[0][1]}`
        for (let i = 1; i < el.points.length; i++) {
          d += ` L ${el.x + el.points[i][0]} ${el.y + el.points[i][1]}`
        }
        // Auto-close path if it has backgroundColor (for fog of war)
        if (el.backgroundColor && el.backgroundColor !== "transparent") {
          d += " Z"
        }

        path.setAttribute("d", d)
        path.setAttribute("fill", el.backgroundColor || "none")
        path.setAttribute("stroke-linecap", "round")
        path.setAttribute("stroke-linejoin", "round")
        applyStyles(path, el)

        group.appendChild(path)
      }
    } else if (el.type === "line" || el.type === "arrow") {
      // Handle lines and arrows
      if (el.points && el.points.length > 0) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

        let d = `M ${el.x + el.points[0][0]} ${el.y + el.points[0][1]}`
        for (let i = 1; i < el.points.length; i++) {
          d += ` L ${el.x + el.points[i][0]} ${el.y + el.points[i][1]}`
        }

        path.setAttribute("d", d)
        path.setAttribute("fill", "none")
        applyStyles(path, el)

        group.appendChild(path)
      }
    } else if (el.type === "image" && el.fileId) {
      // Handle images
      const imageData = data.files?.[el.fileId]
      if (imageData && imageData.dataURL) {
        const image = document.createElementNS("http://www.w3.org/2000/svg", "image")
        image.setAttribute("x", el.x)
        image.setAttribute("y", el.y)
        image.setAttribute("width", el.width)
        image.setAttribute("height", el.height)
        image.setAttribute("href", imageData.dataURL)
        group.appendChild(image)
      }
    }

    svg.appendChild(group)
  })

  // Clear container and add SVG
  container.innerHTML = ""
  container.appendChild(svg)
  container.style.cursor = "grab"

  // Initialize pan and zoom
  const panZoom = new PanZoom(svg, container)

  // Add control buttons
  const controls = document.createElement("div")
  controls.className = "excalidraw-controls"
  controls.innerHTML = `
    <button class="excalidraw-btn zoom-in" title="Zoom In">+</button>
    <button class="excalidraw-btn zoom-out" title="Zoom Out">−</button>
    <button class="excalidraw-btn reset" title="Reset View">⟲</button>
  `

  const zoomInBtn = controls.querySelector(".zoom-in")
  const zoomOutBtn = controls.querySelector(".zoom-out")
  const resetBtn = controls.querySelector(".reset")

  zoomInBtn?.addEventListener("click", () => panZoom.zoom(0.8))
  zoomOutBtn?.addEventListener("click", () => panZoom.zoom(1.2))
  resetBtn?.addEventListener("click", () => panZoom.reset(initialViewBox))

  mapContainer.appendChild(controls)
}
