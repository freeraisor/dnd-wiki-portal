# [◀ Excalidraw 自动化使用指南](./readme.md)

> 此说明当前更新至 `768aebf`。

【[English](../../ExcalidrawScriptsEngine.md) | 简体中文】

[![脚本引擎](https://user-images.githubusercontent.com/14358394/145684531-8d9c2992-59ac-4ebc-804a-4cce1777ded2.jpg)](https://youtu.be/hePJcObHIso)

## 简介

请将你的 ExcalidrawAutomate 脚本放入 Excalidraw 设置中定义的文件夹中。脚本文件夹不能是你的 Vault 根目录。

![image](https://user-images.githubusercontent.com/14358394/145673547-b4f57d01-3643-40f9-abfd-14c3bfa5ab93.png)

EA 脚本可以是 markdown 文件、纯文本文件或 .js 文件。唯一的要求是它们必须包含有效的 JavaScript 代码。

![image](https://user-images.githubusercontent.com/14358394/145673674-bb59f227-8eea-43dc-83b8-4d750e1920a8.png)

你可以通过 Obsidian 命令面板从 Excalidraw 访问你的脚本。

![image](https://user-images.githubusercontent.com/14358394/145673652-6b1713e2-edc8-4bc8-8246-3f8df8a4b273.png)

这样你就可以像设置其他 Obsidian 命令一样，为你喜欢的脚本分配快捷键。

![image](https://user-images.githubusercontent.com/14358394/145673633-83b6c969-cead-429b-9721-fd047f980279.png)

## 脚本开发

Excalidraw 脚本会自动接收两个对象：

- `ea`：脚本引擎会初始化 `ea` 对象，包括设置调用脚本时的活动视图为当前视图。
- `utils`：我从 [QuickAdd](https://github.com/chhoumann/quickadd/blob/master/docs/QuickAddAPI.md) 借用了一些实用函数，但目前并非所有 QuickAdd 实用函数都在 Excalidraw 中实现。目前可用的函数如下。详见下方示例。
  - `inputPrompt: (header: string, placeholder?: string, value?: string, buttons?: [{caption:string, action:Function}])`
    - 打开一个提示框请求输入。返回输入的字符串。
    - 你需要使用 await 等待 inputPrompt 的结果。
    - `buttons.action(input: string) => string`。按钮动作将接收当前输入字符串。如果动作返回 null，输入将保持不变。如果动作返回字符串，inputPrompt 将解析为该值。
```typescript
let fileType = "";
const filename = await utils.inputPrompt (
  "Filename for new document",
  "Placeholder",
  "DefaultFilename.md",
  [
    {
      caption: "Markdown",
      action: ()=>{fileType="md";return;}
		},
    {
      caption: "Excalidraw",
      action: ()=>{fileType="ex";return;}
    }
  ]
);

```
  - `suggester: (displayItems: string[], items: any[], hint?: string, instructions?:Instruction[])`
    - 打开一个建议器。显示 displayItems 并返回 items[] 中对应的项。
    - 你需要使用 await 等待 suggester 的结果。
    - 如果用户取消(按ESC键)，suggester 将返回 `undefined`
    - Hint(提示)和 instructions(说明)参数是可选的。
    ```typescript
      interface Instruction {
        command: string;
        purpose: string;
      }
    ```
  - 脚本可以有设置。这些设置作为插件设置的一部分存储，用户也可以通过 Obsidian 插件设置窗口更改。
    - 你可以使用 `ea.getScriptSettings()` 访问当前脚本的设置，并使用 `ea.setScriptSettings(settings:any)` 存储设置值
    - 在插件设置中显示脚本设置的规则如下：
      - 如果设置是简单的字面量(布尔值、数字、字符串)，这些将按原样显示在设置中。设置的名称将作为值的键。
    ```javascript
    ea.setScriptSettings({ 
      "value 1": true, 
      "value 2": 1,
      "value 3": "my string"
    })
    ```
    ![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/SimpleSettings.jpg)
      - 如果设置是一个对象并遵循以下结构，则可以添加描述和值集。也可以使用 `hidden` 键从用户界面中隐藏值。
      ```javascript
      ea.setScriptSettings({
        "value 1": {
          "value": true,
          "description": "This is the description for my boolean value"
        },
        "value 2": {
          "value": 1,
          "description": "This is the description for my numeric value"
        },
        "value 3": {
          "value": "my string",
          "description": "This is the description for my string value",
          "valueset": ["allowed 1","allowed 2","allowed 3"]
        },
        "value 4": {
          "value": "my value",
          "hidden": true
        }        
      });
      ```
      ![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/ComplexSettings.jpg)

---------

## Excalidraw 自动化脚本示例

这些脚本可以在 GitHub [这个](https://github.com/zsviczian/obsidian-excalidraw-plugin/tree/master/ea-scripts)文件夹 📂 中下载为 `.md` 文件。

### 为选中元素添加边框

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-box-elements.jpg)

此脚本将在 Excalidraw 中当前选中的元素周围添加一个包围框

```javascript
if(!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("1.5.21")) {
  new Notice("This script requires a newer version of Excalidraw. Please install the latest version.");
  return;
}

settings = ea.getScriptSettings();
//check if settings exist. If not, set default values on first run
if(!settings["Default padding"]) {
	settings = {
		"Prompt for padding?": true,
	  "Default padding" : {
			value: 10,
		  description: "Padding between the bounding box of the selected elements, and the box the script creates"
		}
	};
	ea.setScriptSettings(settings);
}

let padding = settings["Default padding"].value;

if(settings["Prompt for padding?"]) {
	padding = parseInt (await utils.inputPrompt("padding?","number",padding.toString()));
}

if(isNaN(padding)) {
  new Notice("The padding value provided is not a number");
  return;
}
elements = ea.getViewSelectedElements();
const box = ea.getBoundingBox(elements);
color = ea
        .getExcalidrawAPI()
        .getAppState()
        .currentItemStrokeColor;
//uncomment for random color:
//color = '#'+(Math.random()*0xFFFFFF<<0).toString(16).padStart(6,"0");
ea.style.strokeColor = color;
id = ea.addRect(
	box.topX - padding,
	box.topY - padding,
	box.width + 2*padding,
	box.height + 2*padding
);
ea.copyViewElementsToEAforEditing(elements);
ea.addToGroup([id].concat(elements.map((el)=>el.id)));
ea.addElementsToView(false);
```

----

### 用箭头连接选中的元素

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-connect-elements.jpg)

此脚本将用箭头连接两个对象。如果任一对象是一组分组元素（例如，一个文本元素与一个包围它的矩形分组），脚本会识别这些组，并将箭头连接到组中最大的对象（假设你想将箭头连接到文本元素周围的框）。
```javascript
if(!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("1.5.21")) {
  new Notice("This script requires a newer version of Excalidraw. Please install the latest version.");
  return;
}

settings = ea.getScriptSettings();
//set default values on first run
if(!settings["Starting arrowhead"]) {
	settings = {
	  "Starting arrowhead" : {
			value: "none",
      valueset: ["none","arrow","triangle","bar","dot"]
		},
		"Ending arrowhead" : {
			value: "triangle",
      valueset: ["none","arrow","triangle","bar","dot"]
		},
		"Line points" : {
			value: 1,
      description: "Number of line points between start and end"
		}
	};
	ea.setScriptSettings(settings);
}

const arrowStart = settings["Starting arrowhead"].value === "none" ? null : settings["Starting arrowhead"].value;
const arrowEnd = settings["Ending arrowhead"].value === "none" ? null : settings["Ending arrowhead"].value;
const linePoints = Math.floor(settings["Line points"].value);

const elements = ea.getViewSelectedElements();
ea.copyViewElementsToEAforEditing(elements);
groups = ea.getMaximumGroups(elements);

if(groups.length !== 2) {
  //unfortunately getMaxGroups returns duplicated resultset for sticky notes
  //needs additional filtering
  cleanGroups=[];
  idList = [];
  for (group of groups) {
    keep = true;
    for(item of group) if(idList.contains(item.id)) keep = false;
    if(keep) {
      cleanGroups.push(group);
      idList = idList.concat(group.map(el=>el.id))
    }
  }
  if(cleanGroups.length !== 2) return;
  groups = cleanGroups;
}

els = [ 
  ea.getLargestElement(groups[0]),
  ea.getLargestElement(groups[1])
];

ea.style.strokeColor = els[0].strokeColor;
ea.style.strokeWidth = els[0].strokeWidth;
ea.style.strokeStyle = els[0].strokeStyle;
ea.style.strokeSharpness = els[0].strokeSharpness;

ea.connectObjects(
  els[0].id,
  null,
  els[1].id,
  null, 
  {
	endArrowHead: arrowEnd,
	startArrowHead: arrowStart, 
	numberOfPoints: linePoints
  }
);
ea.addElementsToView();
```

----
### 反转选中的箭头

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-reverse-arrow.jpg)

反转选中元素范围内**箭头**的方向。

```javascript
elements = ea.getViewSelectedElements().filter((el)=>el.type==="arrow");
if(!elements || elements.length===0) return;
elements.forEach((el)=>{
	const start = el.startArrowhead;
	el.startArrowhead = el.endArrowhead;
	el.endArrowhead = start;
});
ea.copyViewElementsToEAforEditing(elements);
ea.addElementsToView();
```

----

### 设置选中元素的线条宽度

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-stroke-width.jpg)

当你缩放自由绘制的草图并想要减小或增加它们的线条宽度时，这个脚本会很有帮助。
```javascript
let width = (ea.getViewSelectedElement().strokeWidth??1).toString();
width = await utils.inputPrompt("Width?","number",width);
const elements=ea.getViewSelectedElements();
ea.copyViewElementsToEAforEditing(elements);
ea.getElements().forEach((el)=>el.strokeWidth=width);
ea.addElementsToView();
```

----

### 设置网格大小

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-grid.jpg)

Excalidraw 中默认的网格大小是 20。目前通过用户界面无法更改网格大小。
```javascript
const grid = parseInt(await utils.inputPrompt("Grid size?",null,"20"));
const api = ea.getExcalidrawAPI();
let appState = api.getAppState();
appState.gridSize = grid;
api.updateScene({
  appState,
  commitToHistory:false
});
```

----

### 设置元素尺寸和位置

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-dimensions.jpg)

目前在 Excalidraw 中还没有办法指定对象的精确位置和大小。你可以使用以下简单脚本来解决这个问题。
```javascript
const elements = ea.getViewSelectedElements();
if(elements.length === 0) return;
const el = ea.getLargestElement(elements);
const sizeIn = [el.x,el.y,el.width,el.height].join(",");
let res = await utils.inputPrompt("x,y,width,height?",null,sizeIn);
res = res.split(",");
if(res.length !== 4) return;
let size = [];
for (v of res) {
  const i = parseInt(v);
  if(isNaN(i)) return;
  size.push(i);
}
el.x = size[0];
el.y = size[1];
el.width = size[2];
el.height = size[3];
ea.copyViewElementsToEAforEditing([el]);
ea.addElementsToView();
```

----

### 项目符号

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-bullet-point.jpg)

此脚本会在选中的每个文本元素的左上角添加一个小圆圈，并将文本和"项目符号"组合成一个组。
```javascript
elements = ea.getViewSelectedElements().filter((el)=>el.type==="text");
ea.copyViewElementsToEAforEditing(elements);
const padding = 10;
elements.forEach((el)=>{
  ea.style.strokeColor = el.strokeColor;
  const size = el.fontSize/2;
  const ellipseId = ea.addEllipse(
    el.x-padding-size,
    el.y+size/2,
    size,
    size
  );
  ea.addToGroup([el.id,ellipseId]);
});
ea.addElementsToView();
```

----

### 按行分割文本

**!!!需要 Excalidraw 1.5.1 或更高版本**

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-split-lines.jpg)

将文本块按行分割成单独的文本元素，以便更容易重新组织
```javascript
elements = ea.getViewSelectedElements().filter((el)=>el.type==="text");
elements.forEach((el)=>{
  ea.style.strokeColor = el.strokeColor;
  ea.style.fontFamily  = el.fontFamily;
  ea.style.fontSize    = el.fontSize;
  const text = el.text.split("\n");
  for(i=0;i<text.length;i++) {
	ea.addText(el.x,el.y+i*el.height/text.length,text[i]);
  }
});
ea.addElementsToView();
ea.deleteViewElements(elements);
```

----

### 设置文本对齐方式

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-text-align.jpg)

设置文本块的对齐方式（居中、右对齐、左对齐）。如果你想为选择文本对齐方式设置键盘快捷键，这个脚本会很有用。
```javascript
elements = ea.getViewSelectedElements().filter((el)=>el.type==="text");
if(elements.length===0) return;
let align = ["left","right","center"];
align = await utils.suggester(align,align);
elements.forEach((el)=>el.textAlign = align);
ea.copyViewElementsToEAforEditing(elements);
ea.addElementsToView();
```

----

### 设置字体

![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-font-family.jpg)

设置文本块的字体(Virgil、Helvetica、Cascadia)。如果你想为选择字体设置键盘快捷键，这个功能会很有用。
```javascript
elements = ea.getViewSelectedElements().filter((el)=>el.type==="text");
if(elements.length===0) return;
let font = ["Virgil","Helvetica","Cascadia"];
font = parseInt(await utils.suggester(font,["1","2","3"]));
if (isNaN(font)) return;
elements.forEach((el)=>el.fontFamily = font);
ea.copyViewElementsToEAforEditing(elements);
ea.addElementsToView();
```
