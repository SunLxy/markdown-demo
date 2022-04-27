// import { unified } from "unified"
const NodeMonkey = require("node-monkey")
const path = require("path")
const fs = require("fs")
const remarkParse = require("remark-parse");
const remarkRehype = require('remark-rehype');
const unified = require('unified');
const toHast = require("mdast-util-to-hast")
const toHtml = require("hast-util-to-html")

const gfm = require('remark-gfm');
const slug = require('rehype-slug');
const headings = require('rehype-autolink-headings');
const rehypeRaw = require('rehype-raw');
const rehypeAttrs = require('rehype-attr');
const rehypePrism = require('rehype-prism-plus');
const rehypeRewrite = require('rehype-rewrite')
// const { parse } = require("@babel/parser")
// const traverse = require("@babel/traverse")
// const t = require("@babel/types")
// const generate = require("@babel/generator")
// const { transform } = require("@babel/standalone")
NodeMonkey()


const mdPath = path.join(process.cwd(), "./src/md.md")
const md = fs.readFileSync(mdPath)
const mdStr = md.toString()
const result = unified()
  .use(remarkParse)
  .use(gfm)
  .use(remarkRehype, { allowDangerousHtml: true }).parse(mdStr)
const rehypePlugins = [
  [rehypePrism, { ignoreMissing: true }],
  rehypeRaw,
  slug,
  headings,
  [rehypeRewrite, { rewrite: rehypeRewriteHandle }],
  [rehypeAttrs, { properties: 'attr' }],
  ...(other.rehypePlugins || []),
];

console.log(result)































// const getCodeString = (data = [], code = "") => {
//   data.forEach((node) => {
//     if (node.type === "text") {
//       code += node.value;
//     } else if (
//       node.type === "element" &&
//       node.children &&
//       Array.isArray(node.children)
//     ) {
//       code += getCodeString(node.children);
//     }
//   });
//   return code;
// };
// const child = result.children

// // const getHtml = (children, isHead = false) => {
// //   const hast = toHast({
// //     children,
// //     type: "root"
// //   })
// //   if (isHead) {
// //     return getCodeString(hast.children || []);
// //   }
// //   console.log(hast)
// //   const html = toHtml(hast)
// //   return html
// // }

// // jsx  tsx 之类需要展示效果的这种取之间的内容
// const getSpace = (endIndex, child) => {
//   // 结束的下标
//   const space = []
//   const head = []
//   // 到第一个heading结束
//   let current = endIndex - 1
//   let start;
//   const loop = () => {
//     const item = child[current]
//     if (item && item.type === "heading") {
//       start = item.position.start.line
//       current = -1
//       head.push(item)
//     } else if (item && item.type === "code") {
//       current = -1
//     } else {
//       current = current - 1
//       space.push(item)
//     }
//     if (current !== -1) {
//       loop()
//     }
//   }
//   loop()
//   return {
//     start,
//     end: start !== undefined ? child[endIndex].position.start.line : undefined,
//     desc: getHtml(space),
//     head: getHtml(head, true),
//   }
// }


// function babelTransform2(input, filename) {
//   return transform(input, {
//     filename,
//     presets: ["env", "es2015", "react", "typescript"],
//   });
// }


// const isShowNode = (ignoreRows = [], line) => {
//   let isShow = false;
//   let i = 0;
//   let lg = ignoreRows.length;
//   while (i < lg) {
//     const { start, end } = ignoreRows[i];
//     if (start <= line && line < end) {
//       isShow = true;
//       break;
//     }
//     i++;
//   }
//   return isShow;
// };

// const getCode = (child) => {

//   const ignoreRows = []
//   const filesValue = {}
//   // 第一遍先获取 code 及其标题简介之类的
//   child.forEach((item, index) => {
//     if (item.type === "code" && ["jsx", "tsx"].includes(item.lang || "")) {
//       const { start, end, head, desc } = getSpace(index, child)
//       if (typeof start === "number") {
//         ignoreRows.push({
//           start,
//           end
//         })
//       }
//       filesValue[index] = {
//         head,
//         desc,
//         value: item.value,
//         fun: `baseDom${index}`
//       }
//     }
//   })
//   let renderStr = ``
//   let baseComponent = ``
//   child.forEach((item, index) => {
//     const line = item.position.start.line;
//     if (isShowNode(ignoreRows, line)) {
//       return;
//     }

//     if (item.type === "code" && ["jsx", "tsx"].includes(item.lang || "") && filesValue[index]) {
//       const { head, value, desc, fun } = filesValue[index]
//       // 先判断 是否引入 react
//       const isReact = /import React.+from "react"/.test(value)
//       const tran = isReact ? value : `import React from "react"\n ${value}`
//       const code = babelTransform2(tran, `${fun}.${item.lang}`).code
//       const str = `${code}`
//         .replace(
//           `Object.defineProperty(exports, \"__esModule\", {\n  value: true\n});`,
//           ""
//         )
//         .replace(`exports["default"] = void 0;`, "")
//         .replace(`exports["default"] = _default;`, `return _react["default"].createElement(_default)`)
//       baseComponent += `
//       function ${fun}(){
//         ${str}
//       }\n`
//       renderStr += `<Code head={${JSON.stringify(head)}} value={${JSON.stringify(value)}} desc={${JSON.stringify(desc)}} >{${fun}()}</Code> \n `
//     } else {
//       renderStr += `${getHtml([item])} \n `
//     }
//   })

//   const render = `
// import React from "react"

//   ${baseComponent}\n
//   const Code = (props) => {
//   return <div>
//     {props.children}
//   </div>
// }
//   export default ()=>{
//     return <React.Fragment>
//     ${renderStr}
//     </React.Fragment>
//   }
//   `
//   fs.writeFileSync("./a.js", render, { encoding: "utf-8", flag: "w+" })
// }

// getCode(child)


// console.log(child)

























// const docblock = parse(code);
// console.log(docblock);
//  comment-parser  解析 注释
// const [parsed] = parse(zs)
// console.log(parsed.tags)

// if (parsed) {
//   const tags = parsed.tags
//   let comments = {}
//   if (tags.length) {
//     tags.forEach((item) => {
//       if (/title:/.test(item.tag) && !comments.title) {
//         comments.title = item.name
//       } else if (/description:/.test(item.tag) && !comments.description) {
//         comments.description = item.name
//       }
//     })
//   }
//   console.log(comments)
// }

// const ast = parse(code, {
//   // 在严格模式下解析并允许模块声明
//   sourceType: 'module',
//   plugins: [
//     'jsx',
//     'typescript',
//     'classProperties',
//     'dynamicImport',
//     'exportDefaultFrom',
//     'exportNamespaceFrom',
//     'functionBind',
//     'nullishCoalescingOperator',
//     'objectRestSpread',
//     'optionalChaining',
//     'decorators-legacy',
//   ],
// });


// const deps = {
//   // uiw: null,
//   // react:"React",
// }

// const depsOther = {
//   // uiw:  ["Button"],
//   // react:  ["useEffect", "useState"]
// }


// // console.log(ast)
// traverse.default(ast, {
//   ImportDeclaration: (node) => {
//     const { source, specifiers } = node.node
//     const type = source.value
//     specifiers.forEach((nodes) => {
//       if (t.isImportDefaultSpecifier(nodes)) {
//         deps[type] = nodes.local.name
//       } else if (t.isImportSpecifier(nodes)) {
//         depsOther[type] = (depsOther[type] || []).concat([nodes.local.name])
//       }
//     })
//     console.log("node", specifiers)
//   }
// })

// console.log(deps, depsOther)





















// const mdPath = path.join(process.cwd(), "./src/md.md")

// const md = fs.readFileSync(mdPath)
// const mdStr = md.toString()

// const result = unified().use(remarkParse).parse(mdStr)

// console.log(mdStr)

// console.log(result)

// const PATH_LIMIT = 20;

// const genCodeFileName = (resourcePath, start) => {
//   const positionStr = `${start}`;
//   const pathList = resourcePath.split("");
//   const len = pathList.length;
//   const pathCharCodeStr = pathList
//     .slice(len - PATH_LIMIT, len)
//     .map((char) => char.charCodeAt(0))
//     .join("");

//   return positionStr + pathCharCodeStr;
// };

// // 对解析结果进行处理
// const createTemp = (child) => {
//   let resultJson = []
//   let pre = ""
//   const wr = path.join(process.cwd(), "docs")

//   if (fs.existsSync(`${wr}/assets.json`)) {
//     const preStr = fs.readFileSync(`${wr}/assets.json`, { encoding: "utf-8" })
//     resultJson = new Function(`return ${preStr}`)()
//     pre = JSON.stringify(resultJson)
//   }

//   child.forEach((item,) => {
//     if (item.type === "code" && ["jsx", "js", "ts", "tsx"].includes(item.lang)) {
//       const offfset = item.position.start.offset
//       const line = item.position.start.line
//       // 查找是否存在老的
//       const oldIndex = resultJson.findIndex(it => it.path === mdPath && it.offset === offfset && it.line === line)
//       // 生成文件名称
//       let filename;

//       if (oldIndex === -1) {
//         filename = genCodeFileName(mdPath, offfset) + `.${item.lang}`
//         resultJson.push({
//           offset: offfset,
//           line: line,
//           filename: `${filename}`,
//           path: mdPath,
//           value: item.value
//         })
//       }

//       if (oldIndex !== -1) {
//         // 判断内容是否一样，一样不进行更新
//         if (resultJson[oldIndex].value !== item.value) {
//           resultJson[oldIndex].value = item.value
//           fs.writeFileSync(`${wr}/${resultJson[oldIndex].filename}`, item.value, { encoding: 'utf-8', flag: 'w+' })
//         }
//       } else {
//         fs.writeFileSync(`${wr}/${filename}`, item.value, { encoding: 'utf-8', flag: 'w+' })
//       }
//     }
//   })
//   // 判断新的和老的是否一样，一样不进行生成
//   if (pre !== JSON.stringify(resultJson)) {
//     fs.writeFileSync(`${wr}/assets.json`, JSON.stringify(resultJson), {
//       encoding: 'utf-8', flag: 'w+'
//     })
//   }
// }

// createTemp(result.children)


