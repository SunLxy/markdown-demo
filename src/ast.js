import NodeMonkey from "node-monkey"
import path from "path"
import fs from "fs"
NodeMonkey()

import { VFile } from 'vfile'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

import gfm from 'remark-gfm';
import slug from 'rehype-slug';
import headings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeAttrs from 'rehype-attr';
import { refractor } from 'refractor';
import rehypePrism from 'rehype-prism-plus';

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

// console.log(refractor.highlight("const a = 12;const is = a > 12 ", "js"))



console.log(hastNode)