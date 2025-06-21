import React from './react'
import { sleep } from './time'
import { percentageBarString } from './tui'

export function TimeTicker({ interval, render }: {
  interval: number,
  render: () => React.ReactNode
}) {
  return <Ticker
    nextWait={() => sleep(interval)}
    render={render}
  />
}

export function Ticker({
  nextWait,
  render,
}: {
  nextWait: () => Promise<unknown>
  render: () => React.ReactNode
}) {
  const [, tick] = React.useState(0)

  React.useEffect(() => {
    let cancel = false

    async function loop() {
      while (!cancel) {
        await nextWait()

        if (cancel) break

        // trigger update
        tick(t => t + 1)
      }
    }

    loop()

    return () => {
      cancel = true
    }
  }, [nextWait])

  return <>{render()}</>
}

export function Bar({
  value,
  width = 25,
}: {
  value: number
  width?: number
}) {
  return <div style={{ marginLeft: '1em' }}>{percentageBarString(value, width)}</div>
}

export function Section({ title, children, opened = false }: {
  title: string,
  children: React.ReactNode
  opened?: boolean
}) {
  const [open, setOpen] = React.useState(opened);
  return <div>
    <div
      style={{ cursor: 'pointer', fontWeight: 'bold' }}
      onClick={() => setOpen(!open)}
    >
      [{open ? '-' : '+'}] {title}
    </div>
    {open && <div style={{ marginLeft: '1em' }}>{children}</div>}
  </div>
}

export function Stat({ label, value, style }: {
  label: string,
  value: React.ReactNode
  style?: React.CSSProperties
}) {
  return <div style={{ ...style, display: 'flex', justifyContent: 'space-between', margin: '0.2em' }}>
    <div>{label}</div> <div>{value}</div>
  </div>
}

export const MoneyStyle: React.CSSProperties = { color: '#FFD700' }