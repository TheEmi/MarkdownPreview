import type { ReactNode } from 'react'

type ToolbarProps = {
  onFormat: (action: FormatAction) => void
  onCopyHtml: () => void
  onExportMd: () => void
  onExportHtml: () => void
  onClear: () => void
  onResetSample: () => void
  copyLabel: string
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  syncScroll: boolean
  onToggleSyncScroll: () => void
  viewMode: ViewMode
  onViewMode: (mode: ViewMode) => void
}

export type FormatAction =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'heading'
  | 'link'
  | 'code'
  | 'codeblock'
  | 'ul'
  | 'ol'
  | 'quote'
  | 'hr'

export type ViewMode = 'split' | 'editor' | 'preview'

export function Toolbar({
  onFormat,
  onCopyHtml,
  onExportMd,
  onExportHtml,
  onClear,
  onResetSample,
  copyLabel,
  theme,
  onToggleTheme,
  syncScroll,
  onToggleSyncScroll,
  viewMode,
  onViewMode,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <div className="brand-text">
          <span className="brand-name">Inkflow</span>
          <span className="brand-tag">Markdown studio</span>
        </div>
      </div>

      <div className="toolbar-group format-group" role="toolbar" aria-label="Formatting">
        <ToolButton label="Bold" shortcut="Ctrl+B" onClick={() => onFormat('bold')}>
          <strong>B</strong>
        </ToolButton>
        <ToolButton label="Italic" shortcut="Ctrl+I" onClick={() => onFormat('italic')}>
          <em>I</em>
        </ToolButton>
        <ToolButton label="Strikethrough" onClick={() => onFormat('strike')}>
          <span className="strike">S</span>
        </ToolButton>
        <span className="sep" />
        <ToolButton label="Heading" onClick={() => onFormat('heading')}>
          H
        </ToolButton>
        <ToolButton label="Link" shortcut="Ctrl+K" onClick={() => onFormat('link')}>
          <span className="linkish">a</span>
        </ToolButton>
        <ToolButton label="Inline code" onClick={() => onFormat('code')}>
          {'</>'}
        </ToolButton>
        <ToolButton label="Code block" onClick={() => onFormat('codeblock')}>
          {'{ }'}
        </ToolButton>
        <span className="sep" />
        <ToolButton label="Bullet list" onClick={() => onFormat('ul')}>
          •≡
        </ToolButton>
        <ToolButton label="Numbered list" onClick={() => onFormat('ol')}>
          1.
        </ToolButton>
        <ToolButton label="Quote" onClick={() => onFormat('quote')}>
          “
        </ToolButton>
        <ToolButton label="Horizontal rule" onClick={() => onFormat('hr')}>
          —
        </ToolButton>
      </div>

      <div className="toolbar-group actions-group">
        <div className="segmented" role="group" aria-label="View mode">
          <button
            type="button"
            className={viewMode === 'editor' ? 'active' : ''}
            onClick={() => onViewMode('editor')}
            title="Editor only"
          >
            Edit
          </button>
          <button
            type="button"
            className={viewMode === 'split' ? 'active' : ''}
            onClick={() => onViewMode('split')}
            title="Split view"
          >
            Split
          </button>
          <button
            type="button"
            className={viewMode === 'preview' ? 'active' : ''}
            onClick={() => onViewMode('preview')}
            title="Preview only"
          >
            Preview
          </button>
        </div>

        <button
          type="button"
          className={`ghost ${syncScroll ? 'on' : ''}`}
          onClick={onToggleSyncScroll}
          title="Toggle scroll sync"
          aria-pressed={syncScroll}
        >
          Sync scroll
        </button>

        <button
          type="button"
          className="ghost"
          onClick={onToggleTheme}
          title="Toggle theme"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? 'Moon' : 'Sun'}
        </button>

        <details className="menu">
          <summary>File</summary>
          <div className="menu-panel">
            <button type="button" onClick={onExportMd}>
              Download .md
            </button>
            <button type="button" onClick={onExportHtml}>
              Download .html
            </button>
            <button type="button" onClick={onResetSample}>
              Load sample
            </button>
            <button type="button" className="danger" onClick={onClear}>
              Clear draft
            </button>
          </div>
        </details>

        <button type="button" className="primary" onClick={onCopyHtml}>
          {copyLabel}
        </button>
      </div>
    </header>
  )
}

function ToolButton({
  label,
  shortcut,
  onClick,
  children,
}: {
  label: string
  shortcut?: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="tool"
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
    >
      {children}
    </button>
  )
}
