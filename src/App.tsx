import { useEffect, useMemo, useRef, useState } from 'react'
import { StatusBar } from './components/StatusBar'
import { Toolbar, type FormatAction, type ViewMode } from './components/Toolbar'
import { applyFormat } from './lib/formatSelection'
import { countStats, renderMarkdown, wrapDocument } from './lib/markdown'
import { SAMPLE_MARKDOWN } from './lib/sample'
import { usePersistedState } from './hooks/usePersistedState'
import './App.css'

const STORAGE_KEYS = {
  draft: 'inkflow.draft',
  theme: 'inkflow.theme',
  split: 'inkflow.split',
  sync: 'inkflow.syncScroll',
  view: 'inkflow.viewMode',
} as const

function downloadFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [markdown, setMarkdown] = usePersistedState(STORAGE_KEYS.draft, SAMPLE_MARKDOWN)
  const [theme, setTheme] = usePersistedState<'light' | 'dark'>(STORAGE_KEYS.theme, 'light')
  const [splitPercent, setSplitPercent] = usePersistedState(STORAGE_KEYS.split, 50)
  const [syncScroll, setSyncScroll] = usePersistedState(STORAGE_KEYS.sync, true)
  const [viewMode, setViewMode] = usePersistedState<ViewMode>(STORAGE_KEYS.view, 'split')
  const [copyLabel, setCopyLabel] = useState('Copy HTML')
  const [isDragging, setIsDragging] = useState(false)

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const syncingFrom = useRef<'editor' | 'preview' | null>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  const html = useMemo(() => renderMarkdown(markdown), [markdown])
  const stats = useMemo(() => countStats(markdown), [markdown])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (event: PointerEvent) => {
      const workspace = workspaceRef.current
      if (!workspace) return
      const rect = workspace.getBoundingClientRect()
      const next = ((event.clientX - rect.left) / rect.width) * 100
      setSplitPercent(Math.min(75, Math.max(25, next)))
    }

    const onUp = () => setIsDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isDragging, setSplitPercent])

  const applyEditorFormat = (action: FormatAction) => {
    const el = editorRef.current
    if (!el) return
    const result = applyFormat(
      { value: markdown, start: el.selectionStart, end: el.selectionEnd },
      action,
    )
    setMarkdown(result.value)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(result.start, result.end)
    })
  }

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopyLabel('Copied!')
      window.setTimeout(() => setCopyLabel('Copy HTML'), 1600)
    } catch {
      setCopyLabel('Copy failed')
      window.setTimeout(() => setCopyLabel('Copy HTML'), 1600)
    }
  }

  const handleScroll = (source: 'editor' | 'preview') => {
    if (!syncScroll || syncingFrom.current) return
    const editor = editorRef.current
    const preview = previewRef.current
    if (!editor || !preview) return

    syncingFrom.current = source
    if (source === 'editor') {
      const ratio = editor.scrollTop / Math.max(1, editor.scrollHeight - editor.clientHeight)
      preview.scrollTop = ratio * Math.max(0, preview.scrollHeight - preview.clientHeight)
    } else {
      const ratio = preview.scrollTop / Math.max(1, preview.scrollHeight - preview.clientHeight)
      editor.scrollTop = ratio * Math.max(0, editor.scrollHeight - editor.clientHeight)
    }
    requestAnimationFrame(() => {
      syncingFrom.current = null
    })
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      if (!meta) return

      const key = event.key.toLowerCase()
      const inEditor = event.target === editorRef.current

      if (key === 'e' && event.shiftKey) {
        event.preventDefault()
        void copyHtml()
        return
      }

      if (!inEditor) return

      if (key === 'b') {
        event.preventDefault()
        applyEditorFormat('bold')
      } else if (key === 'i') {
        event.preventDefault()
        applyEditorFormat('italic')
      } else if (key === 'k') {
        event.preventDefault()
        applyEditorFormat('link')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const showEditor = viewMode !== 'preview'
  const showPreview = viewMode !== 'editor'
  const editorWidth =
    viewMode === 'split' ? `${splitPercent}%` : viewMode === 'editor' ? '100%' : '0%'
  const previewWidth =
    viewMode === 'split' ? `${100 - splitPercent}%` : viewMode === 'preview' ? '100%' : '0%'

  return (
    <div className="app">
      <Toolbar
        onFormat={applyEditorFormat}
        onCopyHtml={() => void copyHtml()}
        onExportMd={() => downloadFile('document.md', markdown, 'text/markdown;charset=utf-8')}
        onExportHtml={() =>
          downloadFile(
            'document.html',
            wrapDocument(html, 'Inkflow export'),
            'text/html;charset=utf-8',
          )
        }
        onClear={() => {
          if (window.confirm('Clear the current draft?')) setMarkdown('')
        }}
        onResetSample={() => setMarkdown(SAMPLE_MARKDOWN)}
        copyLabel={copyLabel}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        syncScroll={syncScroll}
        onToggleSyncScroll={() => setSyncScroll(!syncScroll)}
        viewMode={viewMode}
        onViewMode={setViewMode}
      />

      <div
        className={`workspace ${isDragging ? 'dragging' : ''} mode-${viewMode}`}
        ref={workspaceRef}
      >
        {showEditor && (
          <section className="pane editor-pane" style={{ width: editorWidth }}>
            <div className="pane-label">Markdown</div>
            <textarea
              ref={editorRef}
              className="editor"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onScroll={() => handleScroll('editor')}
              spellCheck={false}
              aria-label="Markdown editor"
              placeholder="Start writing Markdown…"
            />
          </section>
        )}

        {viewMode === 'split' && (
          <div
            className="splitter"
            role="separator"
            aria-orientation="vertical"
            aria-valuemin={25}
            aria-valuemax={75}
            aria-valuenow={Math.round(splitPercent)}
            aria-label="Resize editor and preview"
            onPointerDown={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
          />
        )}

        {showPreview && (
          <section className="pane preview-pane" style={{ width: previewWidth }}>
            <div className="pane-label">Preview</div>
            <div
              ref={previewRef}
              className="preview"
              onScroll={() => handleScroll('preview')}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </section>
        )}
      </div>

      <StatusBar
        words={stats.words}
        chars={stats.chars}
        lines={stats.lines}
        splitPercent={viewMode === 'split' ? splitPercent : viewMode === 'editor' ? 100 : 0}
      />
    </div>
  )
}
