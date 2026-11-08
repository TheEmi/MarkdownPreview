type StatusBarProps = {
  words: number
  chars: number
  lines: number
  splitPercent: number
}

export function StatusBar({ words, chars, lines, splitPercent }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span>
        {words} word{words === 1 ? '' : 's'}
      </span>
      <span className="dot" aria-hidden="true" />
      <span>
        {chars} character{chars === 1 ? '' : 's'}
      </span>
      <span className="dot" aria-hidden="true" />
      <span>
        {lines} line{lines === 1 ? '' : 's'}
      </span>
      <span className="spacer" />
      <span className="muted">Draft saved locally · pane {Math.round(splitPercent)}%</span>
    </footer>
  )
}
