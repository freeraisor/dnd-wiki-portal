# Excalidraw Integration Patches for Quartz

Эти патчи добавляют поддержку интерактивных карт Excalidraw в Quartz v4.

## Что добавляется

- **Transformer плагин** (`quartz/plugins/transformers/excalidraw.ts`) - извлекает и декомпрессирует данные Excalidraw из Obsidian файлов
- **React компонент** (`quartz/components/ExcalidrawMap.tsx`) - рендерит карты Excalidraw
- **Клиентский скрипт** (`quartz/components/scripts/excalidraw.inline.ts`) - добавляет pan/zoom управление
- **Поддержка форматов**:
  - Сжатый JSON (из Obsidian Excalidraw плагина)
  - Обычный JSON (для тестовых файлов)
- **Управление картой**:
  - Перетаскивание мышкой (pan)
  - Зум колесом мыши
  - Кнопки zoom in/out
  - Touch поддержка для мобильных устройств

## Как применить патчи

### В новом репозитории Quartz:

```bash
# 1. Клонируй Quartz (если еще не клонировал)
git clone https://github.com/jackyzha0/quartz.git
cd quartz

# 2. Скопируй все .patch файлы в корень репозитория
cp /path/to/PATCHES/*.patch .

# 3. Примени все патчи по порядку
git am *.patch

# 4. Установи зависимости
npm install

# 5. Собери проект
npx quartz build
```

### В существующем проекте Quartz:

```bash
# Применить все патчи
git am /path/to/PATCHES/*.patch

# Или применить выборочно:
git apply /path/to/PATCHES/0001-Add-Excalidraw-map-integration-to-Quartz.patch
```

### Если возникают конфликты:

```bash
# Отменить текущий патч
git am --abort

# Применить с 3-way merge
git am -3 *.patch

# Или применить вручную и разрешить конфликты
git apply --reject *.patch
# Затем вручную исправь файлы с расширением .rej
```

## Список патчей

1. `0001` - Начальная интеграция Excalidraw в Quartz
2. `0002` - Добавление инструкций по настройке
3. `0003` - Добавление Obsidian Excalidraw плагина для редактирования
4. `0004` - Исправление рендеринга и добавление примеров
5. `0005` - Обновление документации с тестовыми картами
6. `0006` - Исправление передачи данных через data-атрибут
7. `0007` - Добавление тестового файла
8. `0008` - Исправление рендеринга - чтение файлов с диска + поддержка freedraw
9. `0009` - Добавление test-map.excalidraw.md
10. `0010` - Добавление pan/zoom управления и исправление instant rendering для SPA навигации
11. `0011` - Поддержка обычного JSON формата (для тестовых файлов)
12. `0012` - Исправление инвертированного направления zoom колесика

## Зависимости

Эти патчи добавляют следующие npm зависимости:

```json
{
  "@excalidraw/excalidraw": "latest",
  "lz-string": "^1.5.0"
}
```

Они будут установлены автоматически при `npm install` после применения патчей.

## Использование

После применения патчей и сборки, создай `.excalidraw.md` файлы в `content/`:

### Пример файла с Excalidraw картой:

```markdown
---
title: "Dungeon Map"
---

# My Dungeon

```excalidraw-compressed-json
{"type":"excalidraw","version":2,...}
```

Описание карты...
```

Или используй Obsidian с плагином Excalidraw для создания карт визуально.

## Troubleshooting

**Проблема**: Карты не отображаются
- Проверь, что в `quartz.config.ts` добавлен `Plugin.Excalidraw()`
- Проверь, что `ExcalidrawMap` компонент добавлен в layout
- Проверь консоль браузера на ошибки

**Проблема**: Ошибки декомпрессии
- Убедись, что установлен пакет `lz-string`
- Проверь, что данные в правильном формате (compressed-json или plain json)

**Проблема**: Zoom не работает
- Проверь, что файл `excalidraw.inline.ts` скомпилирован
- Обнови страницу с Ctrl+F5 (hard refresh)

## Лицензия

Эти патчи применяются к проекту Quartz, который распространяется под MIT лицензией.
