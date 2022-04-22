import { unified } from "unified"
import NodeMonkey from "node-monkey"
import path from "path"
import fs from "fs"
import remarkParse from 'remark-parse';

NodeMonkey()

const md = fs.readFileSync(path.join(process.cwd(), "./src/md.md"))

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
      const oldIndex = resultJson.findIndex(it => it.path === "src/md.md" && it.offset === offfset)
      const filename = genCodeFileName("src/md.md", offfset)
      if (oldIndex === -1) {
        resultJson.push({
          offset: offfset,
          filename: `${filename}.js`,
          path: "src/md.md",
          value: item.value
        })
      }
      if (oldIndex !== -1) {
        if (resultJson[oldIndex].value !== item.value) {
          resultJson[oldIndex].value = item.value
          fs.writeFileSync(`${wr}/${resultJson[oldIndex].filename}`, item.value, { encoding: 'utf-8', flag: 'w+' })
        }
      } else {
        fs.writeFileSync(`${wr}/${filename}.js`, item.value, { encoding: 'utf-8', flag: 'w+' })
      }
    }
  })
  if (pre !== JSON.stringify(resultJson)) {
    fs.writeFileSync(`${wr}/assets.json`, JSON.stringify(resultJson), {
      encoding: 'utf-8', flag: 'w+'
    })
  }
}

createTemp(result.children)


