import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  gfm: true,
  breaks: false,
})

export function renderMarkdown(source: string): string {
  const raw = marked.parse(source, { async: false }) as string
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
  })
}

export function wrapDocument(bodyHtml: string, title = 'Document'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    line-height: 1.65;
    max-width: 42rem;
    margin: 2rem auto;
    padding: 0 1.25rem;
    color: #1a1a1a;
  }
  @media (prefers-color-scheme: dark) {
    body { color: #ececec; background: #121212; }
  }
  pre {
    overflow-x: auto;
    padding: 1rem;
    border-radius: 8px;
    background: #f4f4f4;
  }
  @media (prefers-color-scheme: dark) {
    pre { background: #1e1e1e; }
  }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 0.4rem 0.6rem; }
  blockquote {
    margin-left: 0;
    padding-left: 1rem;
    border-left: 3px solid #888;
    color: #555;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function countStats(source: string) {
  const trimmed = source.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  const chars = source.length
  const lines = source.length === 0 ? 0 : source.split('\n').length
  return { words, chars, lines }
}
