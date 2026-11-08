import type { FormatAction } from '../components/Toolbar'

export type TextSelection = {
  value: string
  start: number
  end: number
}

export type FormatResult = {
  value: string
  start: number
  end: number
}

export function applyFormat(selection: TextSelection, action: FormatAction): FormatResult {
  const { value, start, end } = selection
  const selected = value.slice(start, end)

  const wrap = (before: string, after = before, placeholder = 'text') => {
    if (selected) {
      const next = value.slice(0, start) + before + selected + after + value.slice(end)
      return {
        value: next,
        start: start + before.length,
        end: start + before.length + selected.length,
      }
    }
    const insert = before + placeholder + after
    const next = value.slice(0, start) + insert + value.slice(end)
    return {
      value: next,
      start: start + before.length,
      end: start + before.length + placeholder.length,
    }
  }

  const prefixLines = (prefix: string) => {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEndIndex = value.indexOf('\n', end)
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex
    const block = value.slice(lineStart, lineEnd)
    const lines = block.split('\n')
    const formatted = lines
      .map((line, i) => {
        if (prefix === '1. ') return `${i + 1}. ${line}`
        return `${prefix}${line}`
      })
      .join('\n')
    const next = value.slice(0, lineStart) + formatted + value.slice(lineEnd)
    return {
      value: next,
      start: lineStart,
      end: lineStart + formatted.length,
    }
  }

  switch (action) {
    case 'bold':
      return wrap('**')
    case 'italic':
      return wrap('*')
    case 'strike':
      return wrap('~~')
    case 'code':
      return wrap('`')
    case 'link': {
      if (selected) {
        const next = value.slice(0, start) + `[${selected}](https://)` + value.slice(end)
        const urlStart = start + selected.length + 3
        return { value: next, start: urlStart, end: urlStart + 'https://'.length }
      }
      return wrap('[', '](https://)', 'link text')
    }
    case 'heading':
      return prefixLines('## ')
    case 'ul':
      return prefixLines('- ')
    case 'ol':
      return prefixLines('1. ')
    case 'quote':
      return prefixLines('> ')
    case 'hr': {
      const insert = `${start > 0 && value[start - 1] !== '\n' ? '\n' : ''}---\n`
      const next = value.slice(0, start) + insert + value.slice(end)
      const caret = start + insert.length
      return { value: next, start: caret, end: caret }
    }
    case 'codeblock': {
      if (selected) {
        const block = `\`\`\`\n${selected}\n\`\`\``
        const next = value.slice(0, start) + block + value.slice(end)
        return { value: next, start: start + 4, end: start + 4 + selected.length }
      }
      const block = '```\ncode\n```'
      const next = value.slice(0, start) + block + value.slice(end)
      return { value: next, start: start + 4, end: start + 8 }
    }
    default:
      return selection
  }
}
