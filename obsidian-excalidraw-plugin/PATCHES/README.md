# Патч для Obsidian Excalidraw Plugin

Этот патч добавляет исходный код Obsidian Excalidraw плагина и документацию по созданию D&D карт.

## Содержание патча

### 0001-Add-Obsidian-Excalidraw-plugin-for-map-editing.patch

Патч добавляет:
- Полный исходный код Obsidian Excalidraw плагина (для справки)
- **MAP_FEATURES.md** - Подробное руководство по созданию D&D карт
- Документацию по API плагина
- Примеры скриптов для создания карт
- Необходимые ассеты и конфигурации

**MAP_FEATURES.md** содержит инструкции как:
- Создавать карты с фоновыми изображениями
- Добавлять маркеры с вики-ссылками
- Рисовать зоны и области
- Реализовать "туман войны" (fog of war)
- Организовать слои карты
- Использовать элементы: прямоугольники, эллипсы, стрелки, текст с ссылками, эмодзи

## Как использовать

### Вариант 1: Установка официального плагина (рекомендуется)

```bash
# В Obsidian:
# 1. Settings → Community plugins → Browse
# 2. Найти "Excalidraw"
# 3. Установить плагин от Zsolt Viczian
# 4. Включить плагин
```

После установки можешь использовать документацию из патча:
- `MAP_FEATURES.md` - для создания D&D карт

### Вариант 2: Применение патчей к исходникам плагина

Если хочешь изучить или модифицировать плагин:

```bash
# Клонировать оригинальный репозиторий
git clone https://github.com/zsviczian/obsidian-excalidraw-plugin.git
cd obsidian-excalidraw-plugin

# Применить патч (добавит документацию)
git am /path/to/PATCHES/0001-Add-Obsidian-Excalidraw-plugin-for-map-editing.patch

# Собрать плагин
npm install
npm run build
```

### Вариант 3: Только документация

Если тебе нужна только документация, просто скопируй файл:
- `MAP_FEATURES.md` - в корень своего проекта

Этот файл не требует плагина и содержит всю необходимую информацию для создания карт в Excalidraw.

## Структура документации

### MAP_FEATURES.md

```markdown
# Возможности создания карт
1. Базовые элементы (прямоугольники, эллипсы, линии)
2. Текст и вики-ссылки
3. Фоновые изображения
4. Маркеры и точки интереса
5. Зоны и области
6. Туман войны
7. Слои и группировка
8. Примеры использования
```

## Практическое применение

### Создание карты подземелья:

1. В Obsidian создай файл `dungeon-map.excalidraw.md`
2. Используй инструменты Excalidraw:
   - Прямоугольники для комнат
   - Линии для коридоров
   - Текст с `[[wiki-links]]` для названий локаций
   - Эллипсы для зон действия заклинаний
   - Freedraw для произвольных форм
3. Сохрани файл (он будет содержать сжатые данные в блоке `excalidraw-compressed-json`)
4. Скопируй в `content/` папку Quartz
5. Собери Quartz: `npx quartz build`
6. Карта будет интерактивной с pan/zoom управлением!

### Пример файла:

```markdown
---
title: "Dungeon Level 1"
tags: [map, dungeon]
---

# First Level of the Ancient Dungeon

```excalidraw-compressed-json
{/* Сжатые данные Excalidraw */}
```

## Description
This map shows the entrance level...
```

## Полезные ссылки

- [Obsidian Excalidraw Plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin) - Официальный репозиторий
- [Excalidraw.com](https://excalidraw.com) - Онлайн версия (для тестирования)
- [Quartz v4 Documentation](https://quartz.jzhao.xyz/) - Документация Quartz

## Лицензия

Obsidian Excalidraw Plugin распространяется под MIT лицензией.
Этот патч добавляет только документацию и не изменяет функциональность плагина.

## Поддержка

Если встретишь проблемы с плагином, обращайся в:
- [Issues плагина](https://github.com/zsviczian/obsidian-excalidraw-plugin/issues)

Для создания карт используй документацию в MAP_FEATURES.md.
