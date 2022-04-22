import { unified } from "unified"
import NodeMonkey from "node-monkey"
import path from "path"
import fs from "fs"
import remarkParse from 'remark-parse';

NodeMonkey()

const mdPath = path.join(process.cwd(), "./src/md.md")

const md = fs.readFileSync(mdPath)
const mdStr = md.toString()

const result = unified().use(remarkParse).parse(mdStr)

console.log(mdStr)

console.log(result)

const PATH_LIMIT = 20;

const genCodeFileName = (resourcePath, start) => {
  const positionStr = `${start}`;
  const pathList = resourcePath.split("");
  const len = pathList.length;
  const pathCharCodeStr = pathList
    .slice(len - PATH_LIMIT, len)
    .map((char) => char.charCodeAt(0))
    .join("");

  return positionStr + pathCharCodeStr;
};

// 对解析结果进行处理
const createTemp = (child) => {
  let resultJson = []
  let pre = ""
  const wr = path.join(process.cwd(), "docs")

  if (fs.existsSync(`${wr}/assets.json`)) {
    const preStr = fs.readFileSync(`${wr}/assets.json`, { encoding: "utf-8" })
    resultJson = new Function(`return ${preStr}`)()
    pre = JSON.stringify(resultJson)
  }

  child.forEach((item,) => {
    if (item.type === "code" && item.lang === "jsx") {
      const offfset = item.position.start.offset
      const line = item.position.start.line
      // 查找是否存在老的
      const oldIndex = resultJson.findIndex(it => it.path === mdPath && it.offset === offfset && it.line === line)
      // 生成文件名称
      let filename;

      if (oldIndex === -1) {
        filename = genCodeFileName(mdPath, offfset)
        resultJson.push({
          offset: offfset,
          line: line,
          filename: `${filename}.js`,
          path: mdPath,
          value: item.value
        })
      }

      if (oldIndex !== -1) {
        // 判断内容是否一样，一样不进行更新
        if (resultJson[oldIndex].value !== item.value) {
          resultJson[oldIndex].value = item.value
          fs.writeFileSync(`${wr}/${resultJson[oldIndex].filename}`, item.value, { encoding: 'utf-8', flag: 'w+' })
        }
      } else {
        fs.writeFileSync(`${wr}/${filename}.js`, item.value, { encoding: 'utf-8', flag: 'w+' })
      }
    }
  })
  // 判断新的和老的是否一样，一样不进行生成
  if (pre !== JSON.stringify(resultJson)) {
    fs.writeFileSync(`${wr}/assets.json`, JSON.stringify(resultJson), {
      encoding: 'utf-8', flag: 'w+'
    })
  }
}

createTemp(result.children)


