import NodeMonkey from "node-monkey"
import path from "path"
import fs from "fs"

import { VFile } from 'vfile'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

import gfm from 'remark-gfm';
import slug from 'rehype-slug';
import headings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeAttrs from 'rehype-attr';
import rehypePrism from 'rehype-prism-plus';
import { transform } from "@babel/standalone";

/**
 * 名称问题  使用对应的最终所属行号进行后缀命名
 * 
 * 1. 把 copyNode 代码放入一个文件中  例如：copyNode2
 * 2. 把 code 代码放入一个文件中   例如：code2
 * 3. 把 head和desc 放入一个文件中   例如：headAndDesc2
 * 
 * **/

function babelTransform2(input, filename) {
  return transform(input, {
    filename,
    presets: ["env", "es2015", "react", "typescript"],
  });
}

const getTransformValue2 = (str, filename, line) => {
  const isReact = /import React.+from "react"/.test(str);
  // 先判断 是否引入 react
  const tran = isReact ? str : `import React from "react"\n ${str}`;
  const code = `${babelTransform2(tran, `${filename}`).code}`
    .replace(
      `Object.defineProperty(exports, \"__esModule\", {\n  value: true\n});`,
      ""
    )
    .replace(`exports["default"] = void 0;`, "")
    .replace(
      `exports["default"] = _default;`,
      `return _react["default"].createElement(_default)`
    );

  return `function Base${line}(){
    ${code}
  }`;
};



NodeMonkey()


const rehypePlugins = [
  [rehypePrism, { ignoreMissing: true }],
  rehypeRaw,
  slug,
  headings,
  [rehypeAttrs, { properties: 'attr' }],
];
const remarkPlugins = [gfm];

const mdPath = path.join(process.cwd(), "./src/md.md")
const md = fs.readFileSync(mdPath)
const mdStr = md.toString()

const processor = unified()
  .use(remarkParse)
  .use(remarkPlugins)
  .use(remarkRehype, {
    allowDangerousHtml: true
  })
  .use(rehypePlugins || [])

const file = new VFile()
file.value = mdStr
const child = processor.parse(file)
const hastNode = processor.runSync(child, file)

// -------------------  jsx  tsx 之类需要展示效果的这种取之间的内容 ----------------
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

// --------------  获取忽略的内容   ------------------- 
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
          line,
        });
      }
      filesValue[line] = {
        ...item,
        // babel 转换后的 代码，最后需要拼接到结果文件中去的
        transform: getTransformValue2(item.value, `${index}.${item.lang}`, line),
      }
    }
  });
  return {
    ignoreRows,
    filesValue,
  }
}
// ----------------  查询转转换为dom之后的位置   -------------------- 
const stepTwo = (ignoreRows, child) => {
  return ignoreRows.map((item) => {
    const findIndexStart = child.findIndex((it) => it.type === "element" && it.position && it.position.start.line === item.start)
    const findIndexEnd = child.findIndex((it) => it.type === "element" && it.position && it.position.start.line === item.end)
    return {
      start: findIndexStart,
      end: findIndexEnd,
      line: item.line
    }
  })
}

const Ignore = getIgnore(child.children)

// -------------   判断是否需要展示 ----------------
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


// ----------------- 标签属性 拼接字符串  -------------------- 
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
// ---------------------- 替换 特殊符号 -------------------
const SymbolMap = new Map([
  ["{", "&#123;"],
  ["}", "&#125;"],
  [">", "&gt;"],
  ["<", "&lt;"],
  ["=", "&#61;"],
  [">=", "&lt;&#61;"],
  ["<=", "&gt;&#61;"],
  ["\\", "&#92;"],
  ["</", "&lt;&#47;"],
  ["=>", "&#61;&gt;"],
  ["/>", "&#47;&gt;"],
])

const transformSymbol = (str) => {
  if (SymbolMap.get(`${str}`.trim())) {
    return SymbolMap.get(`${str}`.trim())
  }
  return str
}

const newPreMap = new Map([])

const getPreMapStr = (findEndIndex) => {
  const { start, end, line } = newIgnore[findEndIndex]
  const head = newPreMap.get(start)
  let desc = ``
  let i = start
  while (i < end) {
    i++;
    desc += newPreMap.get(i) || ""
  }
  return {
    head,
    desc,
    line
  }
}

// ---------------   拼接标签      -----------------
const createElementStr = (item, ignore, isIgnore = false, findEndIndex = -1) => {
  let code = ''
  if (item.type === "root") {
    code = loop(item.children, ignore, isIgnore)
  } else if (item.type === "element") {
    const result = loop(item.children, ignore, isIgnore)
    const TagName = item.tagName
    const properties = getProperties(item.properties || {})
    // 这个位置需要判断内容 判断是否是一个 pre 标签 ，子集是 code ，并且是 jsx 或 tsx 语言的需要替换成其他组件进行渲染效果
    if (findEndIndex >= 0) {
      const { head, desc, line: lines } = getPreMapStr(findEndIndex)
      const line = item.position.start.line

      code += `<Code 
      ${properties}
       copyNode={\`${Ignore.filesValue[line].value || ""}\`} 
       desc={<React.Fragment>${desc}</React.Fragment>}
       head={<React.Fragment>${head}</React.Fragment>}
       code={<React.Fragment>${result}</React.Fragment>}
      >{Base${line}()}</Code>`
    } else {
      code += `<${TagName} ${properties}>${result}</${TagName}>`
    }
  } else if (item.type === "text") {
    code += `${transformSymbol(item.value)}`
  }
  return code
}

const loop = (child, ignore = [], isIgnore) => {
  let code = ""
  child.forEach((item, index) => {
    if (isIgnore && !isShowNode(ignore, index)) {
      // 这块需要记录转换后的代码，便于后面直接使用
      const pre = createElementStr(item, ignore, false, -1)
      if (pre !== "\n") {
        newPreMap.set(index, pre)
      }
    } else {
      const findEndIndex = ignore.findIndex((its) => its.end === index)
      code += createElementStr(item, ignore, false, isIgnore ? findEndIndex : -1)
    }
  })
  return code
}

const result = createElementStr(hastNode, newIgnore, true)
// console.log("hastNode", )

const getBaseCodeStr = (filesValue) => {
  let codeStr = ''
  Object.entries(filesValue).forEach(([key, item]) => {
    codeStr += `${item.transform}\n`
  })
  return codeStr
}
console.log(hastNode)


fs.writeFileSync("/Users/lusun/Carefree/md-code-preview/examples/src/da4.jsx", `
import React from "react";
import "./markdown.less"

${getBaseCodeStr(Ignore.filesValue)}

const Code = (props)=>{

  console.log(props)

  return <div>
  {props.children}
  </div>
}

export default () => {
  return (<div className="wmde-markdown wmde-markdown-color">
    ${result}
    </div>)
}
`, { encoding: "utf-8" })
