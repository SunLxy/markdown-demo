/*
 * @Author: SunLxy
 * @Date: 2022-04-27 10:42:09
 * @LastEditTime: 2022-04-27 12:04:57
 * @LastEditors: SunLxy
 * @Description: In User Settings Edit
 * @FilePath: /markdown/src/imports copy.js
 */
import NodeMonkey from "node-monkey"
import path from "path"
import fs from "fs"

import ReactMarkdown from "react-markdown"
import React from "react";

NodeMonkey()

const mdPath = path.join(process.cwd(), "./src/md.md")
const md = fs.readFileSync(mdPath)

const mdStr = md.toString()



const checkNode = ({ node, inline, children, ...rest }) => {
  // const line = node.position.start.line;
  const TagName = node.tagName;
  const lg = Object.keys(rest).length
  if (lg) {
    return `<${TagName} {...${JSON.stringify(rest)}} >${children}</${TagName}>`
  }
  return `<${TagName} >${children}</${TagName}>`
};


const code = ReactMarkdown({
  children: mdStr,
  components: {
    code: checkNode
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
// fs.writeFileSync("hdj.js", JSON.stringify(code), { encoding: "utf-8" })


