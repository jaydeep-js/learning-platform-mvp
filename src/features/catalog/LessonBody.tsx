import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

/* The default sanitize schema strips class attributes and raw divs; the
   articles use <div class="callout"> for the design system's callout box,
   so exactly that (and nothing more) is allowlisted. */
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'div'],
  attributes: {
    ...defaultSchema.attributes,
    div: [['className', 'callout']],
    code: [['className', /^language-./]],
  },
} as typeof defaultSchema

/* Renders a lesson's stored markdown into the prototype's .prose typography. */
export default function LessonBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
