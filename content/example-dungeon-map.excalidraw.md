---
excalidraw-plugin: parsed
tags: [excalidraw, map, dungeon, example]
title: Example Dungeon Map
---

# Example Dungeon Map

This is a simple example map demonstrating the Excalidraw integration with interactive markers and zones.

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "type": "rectangle",
      "id": "fog-1",
      "x": 600,
      "y": 150,
      "width": 80,
      "height": 100,
      "strokeColor": "#000000",
      "backgroundColor": "#000000",
      "fillStyle": "solid",
      "strokeWidth": 1,
      "opacity": 80
    },
    {
      "type": "rectangle",
      "id": "room-1",
      "x": 100,
      "y": 100,
      "width": 300,
      "height": 200,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "#f0f0f0",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "opacity": 100
    },
    {
      "type": "rectangle",
      "id": "room-2",
      "x": 450,
      "y": 100,
      "width": 250,
      "height": 200,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "#f0f0f0",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "opacity": 100
    },
    {
      "type": "text",
      "id": "marker-1",
      "x": 200,
      "y": 180,
      "text": "Entrance Hall",
      "fontSize": 20,
      "fontFamily": 1,
      "textAlign": "center",
      "strokeColor": "#1971c2",
      "link": "[[entrance-hall]]",
      "width": 150,
      "height": 25
    },
    {
      "type": "text",
      "id": "marker-2",
      "x": 520,
      "y": 180,
      "text": "Treasure Room",
      "fontSize": 20,
      "fontFamily": 1,
      "textAlign": "center",
      "strokeColor": "#e67700",
      "link": "[[treasure-room]]",
      "width": 150,
      "height": 25
    },
    {
      "type": "ellipse",
      "id": "zone-1",
      "x": 480,
      "y": 130,
      "width": 80,
      "height": 80,
      "strokeColor": "#e67700",
      "backgroundColor": "#fab005",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "opacity": 30
    },
    {
      "type": "text",
      "id": "marker-3",
      "x": 110,
      "y": 130,
      "text": "🚪",
      "fontSize": 32,
      "fontFamily": 1,
      "strokeColor": "#1e1e1e",
      "width": 32,
      "height": 32
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  }
}
```

## Map Features

This example demonstrates:
- **Two rooms**: Connected dungeon chambers
- **Interactive markers**: Click "Entrance Hall" or "Treasure Room" to navigate
- **Highlight zone**: Yellow zone marking treasure area
- **Fog of war**: Black area hiding unexplored section
- **Icon**: Door emoji at entrance
