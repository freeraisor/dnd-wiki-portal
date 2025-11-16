// Excalidraw Map Viewer
document.addEventListener("DOMContentLoaded", () => {
  const mapContainers = document.querySelectorAll(".excalidraw-map-canvas")

  mapContainers.forEach(async (container) => {
    const fileSlug = container.id.replace("excalidraw-", "")

    try {
      // Get excalidraw data from page data
      const pageData = (window as any).__QUARTZ_DATA__
      if (!pageData || !pageData.excalidraw) {
        console.warn("No Excalidraw data found for", fileSlug)
        return
      }

      const data = pageData.excalidraw

      // For now, show a simple SVG preview
      // TODO: Integrate full @excalidraw/excalidraw component
      renderExcalidrawPreview(container, data)
    } catch (error: any) {
      console.error("Error rendering Excalidraw:", error)
      container.innerHTML = `
            <div class="excalidraw-error">
              <p>⚠️ Error loading map</p>
              <p class="error-details">${error.message}</p>
            </div>
          `
    }
  })
})

function renderExcalidrawPreview(container: Element, data: any) {
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
  const padding = 20

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("width", "100%")
  svg.setAttribute("height", "100%")
  svg.setAttribute(
    "viewBox",
    `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`,
  )
  svg.style.maxHeight = "600px"

  // Render elements
  elements.forEach((el: any) => {
    if (el.isDeleted) return

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    if (el.type === "rectangle") {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", el.x)
      rect.setAttribute("y", el.y)
      rect.setAttribute("width", el.width)
      rect.setAttribute("height", el.height)
      rect.setAttribute("fill", el.backgroundColor || "transparent")
      rect.setAttribute("stroke", el.strokeColor || "#000")
      rect.setAttribute("stroke-width", el.strokeWidth || 1)
      rect.setAttribute("opacity", (el.opacity || 100) / 100)
      group.appendChild(rect)
    } else if (el.type === "ellipse") {
      const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
      ellipse.setAttribute("cx", el.x + el.width / 2)
      ellipse.setAttribute("cy", el.y + el.height / 2)
      ellipse.setAttribute("rx", el.width / 2)
      ellipse.setAttribute("ry", el.height / 2)
      ellipse.setAttribute("fill", el.backgroundColor || "transparent")
      ellipse.setAttribute("stroke", el.strokeColor || "#000")
      ellipse.setAttribute("stroke-width", el.strokeWidth || 1)
      ellipse.setAttribute("opacity", (el.opacity || 100) / 100)
      group.appendChild(ellipse)
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

  container.innerHTML = ""
  container.appendChild(svg)
}
