/*
 * @Author: SunLxy
 * @Date: 2022-04-27 10:42:09
 * @LastEditTime: 2022-04-27 13:20:26
 * @LastEditors: SunLxy
 * @Description: In User Settings Edit
 * @FilePath: /markdown/src/importscopy.js
 */
import NodeMonkey from "node-monkey"
import path from "path"
import fs from "fs"
import gfm from 'remark-gfm';
import slug from 'rehype-slug';
import headings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeAttrs from 'rehype-attr';
import rehypePrism from 'rehype-prism-plus';
import ReactMarkdown from "react-markdown"

NodeMonkey()

const mdPath = path.join(process.cwd(), "./src/md.md")
const md = fs.readFileSync(mdPath)

const mdStr = md.toString()

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


const checkNode = ({ node, inline, children, ...rest }, isCode) => {
  // const line = node.position.start.line;
  const TagName = node.tagName;
  const properties = getProperties(rest)
  // isCode
  if (isCode) {
    return `<${TagName} ${properties} children={\`${children}\`} />`
  }
  return `<${TagName} ${properties}>${children}</${TagName}>`
};
const rehypePlugins = [
  [rehypePrism, { ignoreMissing: true }],
  rehypeRaw,
  slug,
  headings,
  [rehypeAttrs, { properties: 'attr' }],
];
const remarkPlugins = [gfm];

const code = ReactMarkdown({
  children: mdStr,
  rehypePlugins,
  remarkPlugins,
  components: {
    code: (props) => checkNode(props, true)
  }
})


const loops = (child) => {
  let code = ''
  child.forEach((item) => {
    if (typeof item === "string") {
      code += item
    } else {
      code += getLoops(item)
    }
  })
  return code
}


const getLoops = (item) => {
  let code = ""
  const tagName = typeof item.type === "symbol" ? "React.Fragment" : item.type
  const { children, ...rest } = item.props || {}
  const childs = loops(children || [])
  const lg = Object.keys(rest).length
  if (lg && typeof tagName === "string") {
    code += `<${tagName} {...${JSON.stringify(rest)}} >${childs}</${tagName}>`
  } else if (typeof tagName === "string") {
    code += `<${tagName}>${childs}</${tagName}>`
  } else if (typeof tagName === "function") {
    code += tagName(item.props || {})
  }
  return code
}

console.log(code,)


