import { WindowControls } from '../components/WindowControls'

export function TitleBar() {
  return (
    <div
      className="flex h-8 shrink-0 items-center justify-end border-b border-border bg-card"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <WindowControls />
      </div>
    </div>
  )
}
