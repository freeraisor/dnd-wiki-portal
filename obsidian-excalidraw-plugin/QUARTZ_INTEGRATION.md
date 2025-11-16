# Quartz Integration for Obsidian Excalidraw Plugin

Эта документация описывает интеграцию Excalidraw карт в Quartz static site generator.

## Обзор

Мы реализовали поддержку `.excalidraw.md` файлов из Obsidian в Quartz, позволяя отображать интерактивные карты с возможностью масштабирования и перемещения.

## Формат данных Excalidraw

Obsidian Excalidraw Plugin хранит данные в следующем формате:

```markdown
---
excalidraw-plugin: parsed
---

# Excalidraw Data

## Drawing
\```compressed-json
[LZ-String compressed base64 data]
\```
%%
[Duplicate compressed data in comments]
%%
```

### Компрессия

- **Библиотека**: lz-string
- **Метод**: `LZString.compressToBase64()` / `LZString.decompressFromBase64()`
- **Формат**: Base64-encoded LZ-compressed JSON
- **Особенность**: Данные разбиты на строки через каждые ~256 символов

### Структура данных

После декомпрессии получается JSON объект:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://github.com/zsviczian/obsidian-excalidraw-plugin/...",
  "elements": [
    {
      "id": "unique-id",
      "type": "freedraw|rectangle|ellipse|text|line|arrow|image",
      "x": 0,
      "y": 0,
      "width": 100,
      "height": 100,
      "angle": 0,
      "strokeColor": "#000000",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "points": [[0, 0], [10, 10], ...],  // для freedraw, line, arrow
      ...
    }
  ],
  "appState": { ... },
  "files": { ... }
}
```

## Реализация в Quartz

### 1. Transformer (`quartz/plugins/transformers/excalidraw.ts`)

**Задача**: Извлекает и декомпрессирует данные Excalidraw во время сборки.

**Ключевые моменты**:
- Читает оригинальный markdown файл с диска (до обработки OFM transformer)
- Извлекает `compressed-json` код блок (может быть внутри `%%` комментариев)
- Декомпрессирует используя lz-string
- Сохраняет данные в `file.data.excalidraw`

```typescript
import LZString from "lz-string"

function decompressExcalidrawData(compressedData: string): ExcalidrawData | null {
  const cleaned = compressedData.replace(/\s+/g, "") // Remove all whitespace
  const decompressed = LZString.decompressFromBase64(cleaned)
  const parsed = JSON.parse(decompressed)
  return parsed.type === "excalidraw" ? parsed : null
}
```

### 2. Component (`quartz/components/ExcalidrawMap.tsx`)

**Задача**: Рендерит контейнер для карты и передает данные в data-атрибут.

**Ключевые моменты**:
- Проверяет frontmatter `excalidraw-plugin: parsed`
- Сериализует данные в JSON и помещает в `data-excalidraw` атрибут
- Создает контейнер `.excalidraw-map-container` и `.excalidraw-map-canvas`
- Скрывает UI элементы (sidebar, header, footer) для fullscreen отображения

### 3. Client Script (`quartz/components/scripts/excalidraw.inline.ts`)

**Задача**: Отрисовывает SVG карту с интерактивными элементами управления.

**Функциональность**:
- **Рендеринг элементов**: freedraw, rectangle, ellipse, text, line, arrow, image
- **Pan (перемещение)**: Drag мышью или touch на мобильных
- **Zoom (масштабирование)**: Колесико мыши или кнопки +/-
- **Элементы управления**: Кнопки zoom in, zoom out, reset

**Поддерживаемые типы элементов**:

| Тип | Реализация |
|-----|-----------|
| `freedraw` | SVG `<path>` с линиями через точки |
| `rectangle` | SVG `<rect>` |
| `ellipse` | SVG `<ellipse>` |
| `text` | SVG `<text>` с поддержкой wiki-links |
| `line` | SVG `<path>` |
| `arrow` | SVG `<path>` (без наконечника пока) |
| `image` | SVG `<image>` с data URL |

### 4. Layout (`quartz.layout.ts`)

**Задача**: Условное отображение ExcalidrawMap компонента.

```typescript
Component.ConditionalRender({
  component: Component.ExcalidrawMap(),
  condition: (page) => (page.fileData.frontmatter as any)?.["excalidraw-plugin"] === "parsed",
})
```

## Зависимости

```json
{
  "lz-string": "^1.5.0"
}
```

## Использование

1. Создайте `.excalidraw.md` файл в Obsidian с Excalidraw Plugin
2. Поместите файл в `content/` директорию Quartz
3. Запустите `npx quartz build`
4. Откройте сгенерированную страницу - карта будет отображаться в fullscreen режиме

## Управление картой

- **Перемещение**: Зажмите левую кнопку мыши и двигайте
- **Zoom**: Крутите колесико мыши или используйте кнопки +/-
- **Reset**: Кнопка ⟲ вернет начальный вид

## Известные ограничения

1. Стрелки отображаются как простые линии (без наконечников)
2. Roughness и другие стили Excalidraw не поддерживаются
3. Анимации отсутствуют
4. Группировка элементов не учитывается

## Будущие улучшения

- [ ] Поддержка наконечников стрелок
- [ ] Rough.js для roughness стилей
- [ ] Поддержка frames
- [ ] Pinch-to-zoom на мобильных
- [ ] Клавиатурные shortcuts для zoom/pan

## Ссылки

- [Obsidian Excalidraw Plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin)
- [lz-string Library](https://github.com/pieroxy/lz-string)
- [Quartz Documentation](https://quartz.jzhao.xyz/)
