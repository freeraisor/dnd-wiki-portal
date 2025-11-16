# Setup Instructions for Excalidraw Map Integration

This guide explains how to set up and use the Excalidraw map feature for your D&D Wiki Portal.

## Prerequisites

- Node.js >= 20
- npm >= 9.3.1
- Obsidian with Excalidraw plugin installed

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@excalidraw/excalidraw` - For rendering Excalidraw drawings
- React compatibility layer via `@preact/compat`
- All other Quartz dependencies

### 2. Install Obsidian Excalidraw Plugin

The Excalidraw plugin code is included in `obsidian-excalidraw-plugin/` folder for reference and documentation.

**To install in Obsidian:**

1. Open Obsidian Settings → Community plugins
2. Browse community plugins
3. Search for "Excalidraw"
4. Install "Excalidraw" by @zsviczian
5. Enable the plugin

### 3. Build Quartz

```bash
npx quartz build
```

Or for development with live reload:

```bash
npx quartz build --serve
```

## Creating Maps

### Method 1: Using Obsidian Excalidraw Plugin

1. In Obsidian, create a new Excalidraw drawing (Ctrl/Cmd + P → "Create new drawing")
2. Name it with `.excalidraw.md` extension (e.g., `dungeon-level-1.excalidraw.md`)
3. Insert your map image:
   - Click "Insert Image" or Ctrl/Cmd + Shift + I
   - Select your map image (PNG/JPG)
   - Resize to fit canvas
4. Lock the background:
   - Right-click on image → "Send to Back"
   - Right-click again → "Lock"
5. Add markers and zones:
   - Use Text tool (T) for markers
   - Add wiki-links: Right-click text → "Create link" → `[[page-name]]`
   - Use shapes for zones (Rectangle, Ellipse)
   - Set opacity for semi-transparent zones
6. Add fog of war:
   - Draw black rectangles (opacity 80%) over hidden areas
   - Use Freedraw tool for irregular fog shapes
7. Save and commit to git

### Map File Structure

```
content/maps/
├── worldmap.excalidraw.md        # Map file
├── dungeon-l1.excalidraw.md      # Another map
└── city-map.excalidraw.md        # Yet another
```

### Frontmatter Example

```yaml
---
excalidraw-plugin: parsed
tags: [excalidraw, map, dungeon]
title: Dungeon Level 1
---
```

The `excalidraw-plugin: parsed` is automatically added by the Obsidian plugin.

## How It Works

### In Obsidian (Editing)

1. You edit maps using the Excalidraw plugin
2. Maps are saved as `.excalidraw.md` files
3. JSON drawing data is embedded in the markdown
4. Images can be embedded or linked
5. All data is stored in git-friendly format

### In Quartz (Display)

1. ExcalidrawTransformer parses `.excalidraw.md` files
2. Extracts JSON drawing data
3. ExcalidrawMap component renders the map
4. SVG preview is generated from drawing data
5. Wiki-links are converted to site links
6. Maps are interactive (zoom, pan)

## Features

### Supported Elements

- ✅ Background images (locked layer)
- ✅ Text markers with links
- ✅ Shapes (rectangles, ellipses, polygons)
- ✅ Fog of war (black semi-transparent shapes)
- ✅ Zones (colored semi-transparent areas)
- ✅ Arrows and lines
- ✅ Freehand drawings

### Interactive Features

- Zoom and pan (on rendered site)
- Clickable wiki-links
- Statistics display (markers, zones, elements)
- Responsive design
- Dark/light mode support

## Configuration

### Quartz Config

The Excalidraw transformer is already configured in `quartz.config.ts`:

```typescript
Plugin.Excalidraw(), // Support for Excalidraw maps
```

### Layout

ExcalidrawMap component is conditionally rendered in `quartz.layout.ts`:

```typescript
Component.ConditionalRender({
  component: Component.ExcalidrawMap(),
  condition: (page) => (page.fileData.frontmatter as any)?.[" excalidraw-plugin"] === "parsed",
}),
```

## Testing Locally

### 1. Create Example Map

Create `content/example-map.excalidraw.md`:

```markdown
---
excalidraw-plugin: parsed
tags: [example]
title: Example Map
---

# Example Map

\```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "type": "text",
      "id": "text-1",
      "x": 100,
      "y": 100,
      "text": "Test Marker",
      "link": "[[test-page]]",
      "fontSize": 20
    }
  ],
  "appState": {
    "viewBackgroundColor": "transparent"
  }
}
\```
```

### 2. Build and Serve

```bash
npx quartz build --serve
```

### 3. Open in Browser

Navigate to `http://localhost:8080/example-map` to see the rendered map.

## Troubleshooting

### Maps Not Rendering

1. Check frontmatter has `excalidraw-plugin: parsed`
2. Verify JSON is valid (check console for errors)
3. Ensure transformer is in config: `Plugin.Excalidraw()`
4. Rebuild: `npx quartz build`

### Links Not Working

1. Use double brackets: `[[page-name]]`
2. Check target page exists
3. Verify link format in JSON

### Build Errors

If you get dependency errors:

```bash
rm -rf node_modules package-lock.json
npm install
```

If you get React errors:

- Check that `react` and `react-dom` are aliased to `@preact/compat` in package.json

### Performance Issues

- Reduce map image size (recommended max: 2000x2000px)
- Use JPG instead of PNG for photos
- Limit number of elements per map
- Consider splitting large maps into multiple smaller maps

## Advanced Usage

### Custom Markers

See `obsidian-excalidraw-plugin/MAP_FEATURES.md` for detailed guide on:
- Creating custom marker templates
- Using emojis as icons
- Organizing layers
- Fog of war techniques

### Scripting

The Excalidraw plugin supports scripts. See `obsidian-excalidraw-plugin/ea-scripts/` for examples.

### Export Options

Maps can be exported as:
- PNG (from Obsidian)
- SVG (from Obsidian)
- JSON (included in .excalidraw.md)

## Git Workflow

### Committing Maps

```bash
git add content/maps/
git commit -m "Add dungeon level 1 map"
git push
```

### Collaboration

Multiple people can edit maps:
1. Pull latest changes
2. Edit map in Obsidian
3. Commit and push
4. Others pull changes

Maps are text-based (JSON), so git merge works well.

## Deployment

### GitHub Pages

```bash
npx quartz build
# Deploy public/ folder to GitHub Pages
```

### Other Hosts

Build and deploy the `public/` folder to any static hosting:
- Netlify
- Vercel
- Cloudflare Pages

## Documentation

- **Plugin docs**: `obsidian-excalidraw-plugin/README.md`
- **Map features**: `obsidian-excalidraw-plugin/MAP_FEATURES.md`
- **Quartz docs**: https://quartz.jzhao.xyz

## Support

For issues related to:
- **Excalidraw plugin**: https://github.com/zsviczian/obsidian-excalidraw-plugin
- **Quartz**: https://github.com/jackyzha0/quartz
- **This integration**: Create issue in your repo

## Next Steps

1. Install dependencies: `npm install`
2. Install Obsidian Excalidraw plugin
3. Create your first map
4. Build and test locally
5. Deploy to production

Happy mapping! 🗺️
