import { NS } from '@ns';
import React from './lib/react'
import { forever, formatTime, now } from './lib/time';
import { getHacknetHashRate, getHacknetProduction } from './lib/hacknet';
import { ps } from './lib/remote';
import { getMinChanceToWinClash, getWantedPenalty, maxGangMembers, moneyGainRate, respectGainRate, wantedLevelGainRate } from './lib/gang';
import { list } from './lib/host';
import { getBonusPercent, getSafeCheats } from './lib/go';
import { getNextBlackOpRequiredRank, getOperationTimeReduction, getStaminaPercentage } from './lib/bladeburner';
import { getSymbols, getTotalPosition } from './lib/stock';
import { getAssets } from './lib/stock';
import { Bar, MoneyStyle, Section, Stat, Ticker, TimeTicker } from './lib/ui';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL')

  ns.atExit(() => ns.ui.closeTail())
  ns.ui.openTail()

  ns.clearLog()
  ns.printRaw(<Dashboard ns={ns} />)

  await forever()
}

export function Dashboard({ ns }: { ns: NS }) {
  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!divRef.current) return;

    const TAIL_WIDTH = 400
    const TAIL_TOP_MARGIN = 20;
    const TAIL_PADDING = 40;

    const [windowWidth,] = ns.ui.windowSize()
    ns.ui.moveTail(windowWidth - TAIL_WIDTH, 0)

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const elementHeight = entry.target.getBoundingClientRect().height;
        const [windowWidth, windowHeight] = ns.ui.windowSize()

        ns.ui.resizeTail(
          Math.min(windowWidth, TAIL_WIDTH),
          Math.min(windowHeight - TAIL_TOP_MARGIN, elementHeight + TAIL_PADDING),
        );
      }
    });
    observer.observe(divRef.current);

    return () => observer.disconnect();
  }, []);

  return <div ref={divRef}>
    <Time />
    <Assets ns={ns} />
    <Production ns={ns} />
    <Hack ns={ns} />
    <Hacknet ns={ns} />
    <Sleeves ns={ns} />
    <Stock ns={ns} />
    <Bladeburner ns={ns} />
    <Gang ns={ns} />
    <IPvGO ns={ns} />
    <Home ns={ns} />
    <PurchasedServer ns={ns} />
  </div >
}

export function Time() {
  return <TimeTicker interval={100} render={() => <>
    <Stat label='time' value={formatTime(now())} />
    <Stat label='liveness' value={<Bar value={(Math.sin(now() / 5000 * Math.PI * 2) + 1) / 2} />} />
  </>} />
}

export function Assets({ ns }: { ns: NS }) {
  return <TimeTicker interval={1000} render={() =>
    <Stat label='assets' value={`$${ns.formatNumber(getAssets(ns))}`} style={MoneyStyle} />
  } />
}

export function Home({ ns }: { ns: NS }) {
  return <TimeTicker interval={200} render={() => {
    const process = ps(ns).filter(p => p.host == 'home')
    const usedRam = ns.getServerUsedRam('home')
    const maxRam = ns.getServerMaxRam('home')
    return <Section title={`Home`} >
      <Stat label='ram' value={ns.formatRam(ns.getServerMaxRam('home'))} />
      <Stat label='cores' value={ns.getServer('home').cpuCores} />
      <Stat label='process' value={process.length} />
      <Stat label='ram usage' value={<Bar value={usedRam / maxRam} />} />
    </Section>
  }} />
}

export function Production({ ns }: { ns: NS }) {
  return <Section title='Production'>
    <TimeTicker interval={2000} render={() => {
      const farmIncome = ps(ns, 'farm.js').reduce((a, c) => a + ns.getScriptIncome(c.filename, c.host, ...c.args), 0)
      const stockIncome = ps(ns, 'stock.js').reduce((a, c) => a + ns.getScriptIncome(c.filename, c.host, ...c.args), 0)

      return <>
        <Stat label='hack' value={`$${ns.formatNumber(farmIncome)} / sec`} style={MoneyStyle} />
        <Stat label='hacknet (estimate)' value={`$${ns.formatNumber(getHacknetProduction(ns))} / sec`} style={MoneyStyle} />
        {ns.stock.hasTIXAPIAccess() ? <Stat label='stock' value={`$${ns.formatNumber(stockIncome)} / sec`} style={MoneyStyle} /> : null}
        {ns.gang.inGang() ? <Stat label='gang' value={`$${ns.gang.inGang() ? ns.formatNumber(moneyGainRate(ns)) : 0} / sec`} style={MoneyStyle} /> : null}
      </>
    }} />
  </Section>
}

export function Hack({ ns }: { ns: NS }) {
  return <Section title='Hack'>
    <TimeTicker interval={2000} render={() => {
      const purchasedProgram = ns.singularity.getDarkwebPrograms().filter(program => ns.fileExists(program)).length
      const totalProgram = ns.singularity.getDarkwebPrograms().length

      const nuked = list(ns, { includeNetwork: true, nuked: true }).length
      const discovered = list(ns, { includeNetwork: true }).length
      const backdoorInstalled = list(ns, { includeNetwork: true, backdoorInstalled: true }).length

      return <>
        <Stat label='program' value={`${purchasedProgram} / ${totalProgram}`} />
        <Stat label='nuked' value={`${nuked} / ${discovered}`} />
        <Stat label='backdoor' value={`${backdoorInstalled} / ${discovered}`} />
      </>
    }} />
  </Section>
}

export function PurchasedServer({ ns }: { ns: NS }) {
  return <Section title='Purchased server'>
    <TimeTicker interval={2000} render={() =>
      <>
        <Stat label='servers' value={`${ns.getPurchasedServers().length} / ${ns.getPurchasedServerLimit()}`} />
        <Stat label='ram' value={ns.formatRam(ns.getPurchasedServers().map(ns.getServerMaxRam).reduce((a, c) => a + c, 0))} />
      </>
    } />
  </Section>
}

export function Hacknet({ ns }: { ns: NS }) {
  return <TimeTicker interval={2000} render={() =>
    <Section title='Hacknet'>
      <Stat label='nodes' value={`${ns.hacknet.numNodes()} / ${ns.hacknet.maxNumNodes()}`} />
      <Stat label='hash' value={`${ns.formatNumber(ns.hacknet.numHashes())} / ${ns.formatNumber(ns.hacknet.hashCapacity())}`} />
      <Stat label='hash rate' value={`${ns.formatNumber(getHacknetHashRate(ns))} h / s`} />
    </Section>
  } />
}

export function Sleeves({ ns }: { ns: NS }) {
  return <TimeTicker interval={2000} render={() =>
    <Section title='Sleeves'>
      <Stat label='sleeve' value={`${ns.sleeve.getNumSleeves()} / 8`} />
    </Section>
  } />
}

export function Stock({ ns }: { ns: NS }) {
  return <Ticker
    nextWait={() => ns.stock.hasTIXAPIAccess() ? ns.stock.nextUpdate() : ns.asleep(2000)}
    render={() => {
      if (!ns.stock.hasTIXAPIAccess()) {
        return null
      }

      return <Section title='Stock'>
        <Stat label='holding symbol' value={`${getSymbols(ns, true).length} / ${ns.stock.getSymbols().length}`} />
        <Stat label='total position' value={`$${ns.formatNumber(getTotalPosition(ns))}`} style={MoneyStyle} />
      </Section>
    }}
  />
}

export function IPvGO({ ns }: { ns: NS }) {
  return <TimeTicker interval={2000} render={() =>
    <Section title='IPvGO subnet'>
      <Stat label='opponent' value={`${ns.go.getOpponent()}`} />
      <Stat label='safe cheats' value={`${ns.formatNumber(getSafeCheats(ns))}`} />
      <Stat label='hacknet production bonus' value={`${ns.formatPercent(getBonusPercent(ns, 'Netburners'))}`} />
      <Stat label='crime success rate bonus' value={`${ns.formatPercent(getBonusPercent(ns, 'Slum Snakes'))}`} />
      <Stat label='hacking money bonus' value={`${ns.formatPercent(getBonusPercent(ns, 'The Black Hand'))}`} />
      <Stat label='combat level bonus' value={`${ns.formatPercent(getBonusPercent(ns, 'Tetrads'))}`} />
      <Stat label='reputation gain bonus' value={`${ns.formatPercent(getBonusPercent(ns, 'Daedalus'))}`} />
      <Stat label='hacking speed bonus' value={`${ns.formatPercent(getBonusPercent(ns, 'Illuminati'))}`} />
    </Section >
  } />
}

export function Gang({ ns }: { ns: NS }) {
  return <Ticker
    nextWait={() => ns.gang.inGang() ? ns.gang.nextUpdate() : ns.asleep(2000)}
    render={() => !ns.gang.inGang() ? null :
      <Section title='Gang'>
        <Stat label='member' value={`${ns.gang.getMemberNames().length} / ${maxGangMembers}`} />
        <Stat label='respect' value={`${ns.formatNumber(ns.gang.getGangInformation().respect)} / ${ns.formatNumber(ns.gang.respectForNextRecruit())}`} />
        <Stat label='respect gain rate' value={ns.formatNumber(respectGainRate(ns))} />
        <Stat label='wanted level' value={`${ns.formatNumber(ns.gang.getGangInformation().wantedLevel)}`} />
        <Stat label='wanted level gain rate' value={`${ns.formatNumber(wantedLevelGainRate(ns))} / sec`} />
        <Stat label='wanted level penalty' value={`${ns.formatPercent(getWantedPenalty(ns))}`} />
        <Stat label='power' value={`${ns.formatNumber(ns.gang.getGangInformation().power)}`} />
        <Stat label='territory' value={`${ns.formatPercent(ns.gang.getGangInformation().territory)}`} />
        <Stat label='clash win rate' value={`${ns.formatPercent(getMinChanceToWinClash(ns))}`} />
      </Section>}
  />
}

export function Bladeburner({ ns }: { ns: NS }) {
  return <Ticker
    nextWait={() => ns.bladeburner.inBladeburner() ? ns.bladeburner.nextUpdate() : ns.asleep(2000)}
    render={() => {
      if (!ns.bladeburner.inBladeburner()) {
        return null
      }

      const [current, max] = ns.bladeburner.getStamina()

      return <Section title='Bladeburner'>
        <Stat label='rank' value=
          {`${ns.formatNumber(ns.bladeburner.getRank())} / ${ns.formatNumber(getNextBlackOpRequiredRank(ns))}`} />
        <Stat label='stamina' value={`${ns.formatNumber(current)} / ${ns.formatNumber(max)}`} />
        <Stat label='stamina rate' value={`${ns.formatPercent(getStaminaPercentage(ns))}`} />
        <Stat label='chaos' value={`${ns.formatNumber(ns.bladeburner.getCityChaos(ns.bladeburner.getCity()))}`} />
        <Stat label='operation time reduction rate' value={`${ns.formatPercent(getOperationTimeReduction(ns))}`} />
      </Section>
    }}
  />
}
