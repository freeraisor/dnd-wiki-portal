# Map Features for D&D Wiki Portal

This document describes how to use the Excalidraw plugin for creating D&D maps with markers, zones, and fog of war.

## Quick Start: Creating a Map

### 1. Create New Map File
1. Create a new Excalidraw drawing (Ctrl/Cmd + P → "Create new drawing")
2. Name it with `.excalidraw.md` extension (e.g., `dungeon-level-1.excalidraw.md`)

### 2. Add Background Map Image
1. Open the Excalidraw file
2. Click "Insert Image" icon or use Ctrl/Cmd + Shift + I
3. Select your map image (PNG/JPG)
4. Resize to fit canvas
5. **Lock the background**: Right-click → Send to Back → Right-click → Lock

### 3. Add Map Markers

#### Text Markers with Links
1. Select Text tool (T)
2. Click on map location
3. Type marker text (e.g., "🚪 Entrance")
4. Right-click on text → "Create link"
5. Enter wiki-link: `[[entrance-description]]`

#### Icon Markers
1. Use emojis in text: 🚪🗡️💎⚔️🔥💀🏰🗝️📜⚡
2. Or insert small PNG icons as images

### 4. Create Zones

#### Danger Zones / Areas
1. Select Rectangle or Ellipse tool
2. Draw area on map
3. Set properties:
   - Fill: Red (#ff0000)
   - Opacity: 30%
   - Stroke: Red (#ff0000)
4. Right-click → "Create link" → `[[danger-zone-info]]`

#### Custom Zones
- Use Polygon tool for irregular shapes
- Use different colors for different zone types:
  - Red: Danger
  - Yellow: Caution
  - Green: Safe
  - Blue: Water/liquid

### 5. Fog of War

#### Basic Fog (Rectangle)
1. Select Rectangle tool
2. Draw over hidden areas
3. Set properties:
   - Fill: Black (#000000)
   - Opacity: 80%
   - Stroke: Transparent
4. Group multiple fog rectangles (Ctrl/Cmd + G)

#### Advanced Fog (Freedraw)
1. Select Freedraw tool
2. Draw irregular fog shapes
3. Fill with black, 80% opacity
4. Use eraser to reveal areas

#### Fog Management
- Create a "Fog" layer by grouping all fog elements
- To reveal: Delete fog elements or reduce opacity
- To hide: Add new fog elements

## Advanced Techniques

### Map Layers Organization

1. **Background Layer**: Locked map image
2. **Zones Layer**: Area markers
3. **Markers Layer**: Points of interest
4. **Fog Layer**: Hidden areas
5. **Notes Layer**: GM notes (can be hidden)

Use Groups (Ctrl/Cmd + G) to organize layers.

### Marker Templates

Create reusable marker styles:

**Entrance Marker**:
- Text: "🚪 Entrance"
- Font: 20px, Bold
- Color: Green

**Boss Marker**:
- Text: "💀 Boss"
- Font: 24px, Bold
- Color: Red

**Treasure Marker**:
- Text: "💎 Treasure"
- Font: 20px, Bold
- Color: Gold

### Grid Overlay

1. Enable grid: View → Show grid
2. Set grid size to match map scale
3. Use grid for accurate measurements

## Export Options

### For Obsidian (Local)
- Save as `.excalidraw.md` → Auto-synced with git

### For Quartz (Web)
- File will be automatically rendered on your wiki site
- All links will work
- Fog of war will be visible
- Zones will be interactive (clickable)

## Best Practices

1. **Always lock background image** to prevent accidental movement
2. **Use consistent colors** for zone types
3. **Group related elements** for easy management
4. **Name layers** using groups for organization
5. **Test links** before committing to git
6. **Keep fog elements** in separate group
7. **Use high contrast** for markers on dark maps

## Keyboard Shortcuts

- `T` - Text tool
- `R` - Rectangle
- `D` - Diamond
- `O` - Ellipse
- `A` - Arrow
- `L` - Line
- `P` - Freedraw
- `E` - Eraser
- `V` - Selection
- `Ctrl/Cmd + D` - Duplicate
- `Ctrl/Cmd + G` - Group
- `Ctrl/Cmd + Shift + G` - Ungroup

## Example Map Structure

```
content/maps/
├── worldmap.excalidraw.md
├── dungeon-l1.excalidraw.md
├── city-map.excalidraw.md
└── battle-arena.excalidraw.md
```

Each map file contains:
- Background image (embedded)
- Markers with wiki-links
- Zones with colors
- Fog of war elements
- All in single .excalidraw.md file

## Troubleshooting

### Map Image Not Showing
- Check image path
- Ensure image is in vault
- Try reinserting image

### Links Not Working
- Use double brackets: `[[page-name]]`
- Check target page exists
- Ensure no typos

### Fog Too Dark/Light
- Adjust opacity (70-90% recommended)
- Use pure black (#000000) for best results

### Performance Issues
- Reduce map image size (max 2000x2000px recommended)
- Use JPG instead of PNG for photos
- Limit number of elements

## Future Enhancements (Planned)

- Lasso tool for custom fog shapes
- One-click "Create Map" action
- Preset marker icons
- Fog brush tool
- Map templates

---

Created for D&D Wiki Portal
Using Obsidian Excalidraw Plugin
