import NodeMonkey from "node-monkey"
import path from "path"
import fs from "fs"

import { VFile } from 'vfile'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

NodeMonkey()

const mdPath = path.join(process.cwd(), "./src/md.md")
const md = fs.readFileSync(mdPath)
const mdStr = md.toString()

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })

const file = new VFile()
file.value = mdStr
const child = processor.parse(file)
const hastNode = processor.runSync(child, file)



// jsx  tsx 之类需要展示效果的这种取之间的内容
const getSpace = (
  endIndex,
  child
) => {
  // 结束的下标
  // 到第一个heading结束
  let current = endIndex - 1;
  let start;
  const loop = () => {
    const item = child[current];
    if (item && item.type === "heading") {
      start = item.position.start.line;
      current = -1;
    } else if (item && item.type === "code") {
      current = -1;
    } else {
      current = current - 1;
    }
    if (current !== -1) {
      loop();
    }
  };
  loop();
  return {
    start,
    end:
      typeof start === "number"
        ? child[endIndex].position.start.line
        : undefined,
  };
};

const getIgnore = (child) => {
  const ignoreRows = []
  const filesValue = {}
  // 第一遍先获取 code 及其标题简介位置之类的
  child.forEach((item, index) => {
    const line = item.position.start.line
    if (item.type === "code" && ["jsx", "tsx"].includes(item.lang || "")) {
      const { start, end, } = getSpace(index, child);
      if (typeof start === "number") {
        ignoreRows.push({
          start,
          end,
        });
      }
      filesValue[line] = {
        ...item,
        transform: "转换的代码",
      }
    }
  });
  return {
    ignoreRows,
    filesValue,
  }
}

const stepTwo = (ignoreRows, child) => {
  return ignoreRows.map((item) => {
    const findIndexStart = child.findIndex((it) => it.type === "element" && it.position && it.position.start.line === item.start) - 1
    const findIndexEnd = child.findIndex((it) => it.type === "element" && it.position && it.position.start.line === item.end) - 1
    return {
      start: findIndexStart,
      end: findIndexEnd,
    }
  })
}

const Ignore = getIgnore(child.children)

const isShowNode = (
  ignoreRows = [],
  index
) => {
  let isShow = true;
  let i = 0;
  let lg = ignoreRows.length;
  while (i < lg) {
    const { start, end } = ignoreRows[i];
    if (start <= index && index < end) {
      isShow = false;
      break;
    }
    i++;
  }
  return isShow;
};
const newIgnore = stepTwo(Ignore.ignoreRows, hastNode.children)

// console.log("hastNode", hastNode)
// console.log("child", Ignore.ignoreRows )

// 拼接字符串
const getProperties = (properties) => {
  let str = ''
  Object.entries(properties).forEach(([key, value]) => {
    if (typeof value === "function") {
      str += ` ${key}={${value.toString()}} `
    } else if (Array.isArray(value)) {
      str += ` ${key}="${value.join(' ')}" `
    } else if (Object.prototype.toString.call(value) === "[object Object]") {
      str += ` ${key}={${JSON.stringify(value)}} `
    } else if (typeof value === "string") {
      str += ` ${key}="${value}" `
    } else {
      str += ` ${key}={${value}} `
    }
  })
  return str
}

const createElementStr = (item, ignore, isIgnore = false,) => {
  let code = ''
  if (item.type === "root") {
    code = loop(item.children, ignore, isIgnore)
  } else if (item.type === "element") {
    const result = loop(item.children, ignore, isIgnore)
    const TagName = item.tagName
    const properties = getProperties(item.properties || {})
    if (TagName && TagName === "code") {
      code += `<${TagName} ${properties} children={\`${result}\`} />`
    } else {
      code += `<${TagName} ${properties}>${result}</${TagName}>`
    }
  } else if (item.type === "text") {
    code += `${item.value}`
  }
  return code
}

const loop = (child, ignore = [], isIgnore) => {
  let code = ""
  child.forEach((item, index) => {
    if (isIgnore && !isShowNode(ignore, index)) {

    } else {
      code += createElementStr(item, ignore, false)
    }
  })
  return code
}
const result = createElementStr(hastNode, newIgnore, true)
// console.log("hastNode", hastNode)
console.log("child", result)






















// const loops = (child) => {
//   let code = ''
//   child.forEach((item) => {
//     if (typeof item === "string") {
//       code += item
//     } else {
//       code += getLoops(item)
//     }
//   })
//   return code
// }


// const getLoops = (item) => {
//   let code = ""
//   const tagName = typeof item.type === "symbol" ? "React.Fragment" : item.type
//   const { children, ...rest } = item.props || {}
//   const childs = loops(children || [])
//   const lg = Object.keys(rest).length
//   if (lg && typeof tagName === "string") {
//     code += `<${tagName} {...${JSON.stringify(rest)}} >${childs}</${tagName}>`
//   } else if (typeof tagName === "string") {
//     code += `<${tagName}>${childs}</${tagName}>`
//   } else if (typeof tagName === "function") {
//     code += tagName(item.props || {})
//   }
//   return code
// }


