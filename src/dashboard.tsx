import { NS } from '@ns';
import React from './lib/react'
import { formatDate, now, sleep } from './lib/time';
import { getHacknetProduction } from './lib/hacknet';
import { ps } from './lib/remote';
import { getMinChanceToWinClash, getWantedPenalty, moneyGainRate, wantedLevelGainRate } from './lib/gang';
import { list } from './lib/host';
import { getBonusPercent, getSafeCheats } from './lib/go';
import { getStaminaPercentage } from './lib/bladeburner';
import { getTotalPosition } from './lib/stock';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL')

  ns.atExit(() => ns.ui.closeTail())
  ns.ui.openTail()

  const paddingBottom = 14
  const [windowWidth, windowHeight] = ns.ui.windowSize()
  const [dashboardWidth, dashboardHeight] = [400, windowHeight - paddingBottom]
  ns.ui.resizeTail(dashboardWidth, dashboardHeight)
  ns.ui.moveTail(windowWidth - dashboardWidth, 0)

  ns.clearLog()
  ns.printRaw(<Dashboard ns={ns} />)

  for (; ;) {
    await ns.asleep(24 * 60 * 60 * 1000)
  }
}

export function Dashboard({ ns }: { ns: NS }) {
  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!divRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.getBoundingClientRect().height;
        const [windowWidth, windowHeight] = ns.ui.windowSize()

        ns.ui.resizeTail(
          Math.min(windowWidth, 400),
          Math.min(windowHeight - 20, height + 40),
        );
      }
    });
    observer.observe(divRef.current);

    return () => observer.disconnect();
  }, []);

  return <div ref={divRef}>
    <Time />
    <Home ns={ns} />
    <Income ns={ns} />
    <Hack ns={ns} />
    <Hardware ns={ns} />
    <IPvGO ns={ns} />
    <Gang ns={ns} />
    <Bladeburner ns={ns} />
  </div >
}

export function Time() {
  return <TimeTicker interval={1000} render={() =>
    <Stat label='time' value={formatDate(now())} />
  } />
}

export function Home({ ns }: { ns: NS }) {
  return <TimeTicker interval={200} render={() => {
    const process = ps(ns).filter(p => p.host == 'home')
    const usedRam = ns.getServerUsedRam('home')
    const maxRam = ns.getServerMaxRam('home')
    return <Section title={`Home`} >
      <Stat label="process" value={process.length} />
      <Stat label="ram" value={<ProgressBar value={usedRam / maxRam} width={20} />} />
    </Section>
  }} />
}

export function Income({ ns }: { ns: NS }) {
  return <Section title='Income'>
    <TimeTicker interval={2000} render={() => {
      const farmIncome = ps(ns, 'farm.js').reduce((a, c) => a + ns.getScriptIncome(c.filename, c.host, ...c.args), 0)
      return <>
        <Stat label="hack" value={`$${ns.formatNumber(farmIncome)} / sec`} style={MoneyStyle} />
        <Stat label="hacknet (estimate)" value={`$${ns.formatNumber(getHacknetProduction(ns))} / sec`} style={MoneyStyle} />
      </>
    }} />

    <Ticker
      nextWait={() => ns.stock.hasTIXAPIAccess() ? ns.stock.nextUpdate() : ns.asleep(2000)}
      render={() => {
        if (!ns.stock.hasTIXAPIAccess()) return null

        const stockIncome = ps(ns, 'stock.js').reduce((a, c) => a + ns.getScriptIncome(c.filename, c.host, ...c.args), 0)

        return <>
          <Stat label="stock" value={`$${ns.formatNumber(stockIncome)} / sec`} style={MoneyStyle} />
          <Stat label="position" value={`$${ns.formatNumber(getTotalPosition(ns))}`} style={MoneyStyle} />
        </>
      }}
    />

    <TimeTicker interval={2000} render={() =>
      ns.gang.inGang() ?
        <Stat label="gang" value={`$${ns.gang.inGang() ? ns.formatNumber(moneyGainRate(ns)) : 0} / sec`} style={MoneyStyle} />
        : null
    } />
  </Section>
}

export function Hack({ ns }: { ns: NS }) {
  return <Section title='Hack'>
    <TimeTicker interval={2000} render={() => {
      const purchasedProgram = ns.singularity.getDarkwebPrograms().filter(program => ns.fileExists(program)).length
      const totalProgram = ns.singularity.getDarkwebPrograms().length

      const rooted = list(ns, { onlyNuked: true }).length
      const discovered = list(ns).length
      const backdoorInstalled = list(ns, { onlyBackdoorInstalled: true }).length

      return <>
        <Stat label="program" value={`${purchasedProgram} / ${totalProgram}`} />
        <Stat label="root" value={`${rooted} / ${discovered}`} />
        <Stat label="backdoor" value={`${backdoorInstalled} / ${rooted}`} />
      </>
    }} />
  </Section>
}

export function Hardware({ ns }: { ns: NS }) {
  return <Section title='Hardware'>
    <TimeTicker interval={2000} render={() => {
      const purchasedServerRam = ns.getPurchasedServers().map(host => ns.getServerMaxRam(host)).reduce((a, c) => a + c, 0)

      return <>
        <Stat label="home RAM" value={ns.formatRam(ns.getServerMaxRam('home'))} />
        <Stat label="home cores" value={ns.getServer('home').cpuCores} />
        <Stat label="purchased server" value={`${ns.getPurchasedServers().length} / ${ns.getPurchasedServerLimit()}`} />
        <Stat label="purchased server RAM" value={ns.formatRam(purchasedServerRam)} />
      </>
    }} />
  </Section>
}

export function HomeRAM({ ns }: { ns: NS }) {
  return <TimeTicker interval={200} render={() => {
    const used = ns.getServerUsedRam('home')
    const max = ns.getServerMaxRam('home')
    return <Stat label="home RAM usage" value={<ProgressBar value={used / max} width={20} />} />
  }} />
}

export function IPvGO({ ns }: { ns: NS }) {
  return <TimeTicker interval={2000} render={() =>
    <Section title='IPvGO subnet'>
      <Stat label="opponent" value={`${ns.go.getOpponent()}`} />
      <Stat label="safe cheats" value={`${ns.formatNumber(getSafeCheats(ns))}`} />
      <Stat label="hacknet production bonus" value={`${ns.formatPercent(getBonusPercent(ns, 'Netburners'))}`} />
      <Stat label="crime success rate bonus" value={`${ns.formatPercent(getBonusPercent(ns, 'Slum Snakes'))}`} />
      <Stat label="hacking money bonus" value={`${ns.formatPercent(getBonusPercent(ns, 'The Black Hand'))}`} />
      <Stat label="combat level bonus" value={`${ns.formatPercent(getBonusPercent(ns, 'Tetrads'))}`} />
      <Stat label="reputation gain bonus" value={`${ns.formatPercent(getBonusPercent(ns, 'Daedalus'))}`} />
      <Stat label="hacking speed bonus" value={`${ns.formatPercent(getBonusPercent(ns, 'Illuminati'))}`} />
    </Section >
  } />
}

export function Gang({ ns }: { ns: NS }) {
  return <Ticker
    nextWait={() => ns.gang.inGang() ? ns.gang.nextUpdate() : ns.asleep(2000)}
    render={() => !ns.gang.inGang() ? null :
      <Section title='Gang'>
        <Stat label="member" value={`${ns.gang.getMemberNames().length} / ${12}`} />
        <Stat label="wanted level" value={`${ns.formatNumber(ns.gang.getGangInformation().wantedLevel)}`} />
        <Stat label="wanted level gain rate" value={`${ns.formatNumber(wantedLevelGainRate(ns))} / sec`} />
        <Stat label="wanted level penalty" value={`${ns.formatPercent(getWantedPenalty(ns))}`} />
        <Stat label="territory" value={`${ns.formatPercent(ns.gang.getGangInformation().territory)}`} />
        <Stat label="clash win rate" value={`${ns.formatPercent(getMinChanceToWinClash(ns))}`} />
      </Section>}
  />
}

export function Bladeburner({ ns }: { ns: NS }) {
  return <Ticker
    nextWait={() => ns.bladeburner.inBladeburner() ? ns.bladeburner.nextUpdate() : ns.asleep(2000)}
    render={() => !ns.bladeburner.inBladeburner() ? null :
      <Section title='Bladeburner'>
        <Stat label="rank" value={`${ns.formatNumber(ns.bladeburner.getRank())}`} />
        <Stat label="stamina" value={`${ns.formatPercent(getStaminaPercentage(ns))}`} />
        <Stat label="chaos" value={`${ns.formatNumber(ns.bladeburner.getCityChaos(ns.bladeburner.getCity()))}`} />
      </Section>}
  />
}

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

export function ProgressBar({
  value,
  width = 40,
}: {
  value: number
  width?: number
}) {
  const fillChar = '|'
  const emptyChar = '-'

  const clamped = Math.min(Math.max(value, 0), 1)
  const filled = Math.floor(clamped * width)
  const empty = width - filled

  const bar = `[${fillChar.repeat(filled)}${emptyChar.repeat(empty)}]`

  return <div style={{ marginLeft: '1em' }}>{bar}</div>
}

export function Section({ title, children, opened = true }: {
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