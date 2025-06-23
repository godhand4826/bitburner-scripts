import { NS } from '@ns';
import { computeEarningsVelocity, computePotential, execGW, execHWGW, getGWTime, getHWGWTime, isHackable, paddingTime } from './lib/hack.js'
import { list } from './lib/host.js';
import { disableLogs } from './lib/log.js';
import { formatTime, now } from './lib/time.js';

export async function main(ns: NS): Promise<void> {
  disableLogs(ns, 'scp', 'exec', 'sleep', 'getServerMaxMoney', 'getServerMaxRam', 'getServerUsedRam', 'getHackingLevel', 'getServerMoneyAvailable', 'scan')

  for (; ;) {

    await HWGW(ns)
  }
}

export async function HWGW(ns: NS): Promise<void> {
  const batchPaddingTime = 500

  const targets = list(ns, { onlyNuked: true })
    .sort((a, b) => computePotential(ns, a) - computePotential(ns, b))

  console.assert(targets.length > 0)

  const target = targets[targets.length - 1]
  const batchTime = getHWGWTime(ns, target)
  const completeAt = now() + batchTime

  ns.print(`Batch hacking ${target} will complete in ${ns.tFormat(batchTime)} at ${formatTime(completeAt)}`)
  ns.toast(`Batch hacking ${target} will complete in ${ns.tFormat(batchTime)} at ${formatTime(completeAt)}`, 'info', batchTime + 2000)

  let batches = 0
  for (const host of list(ns, { onlyNuked: true, includePurchased: true, includeHome: true, includeHacknet: false})) {
    const preservedRam = host == 'home' ? 16 : 0
    const isDeployed = await execHWGW(ns, host, target, Infinity, preservedRam)
    batches += isDeployed ? 1 : 0;
  }

  await ns.sleep(batchTime - (batches * 4 * paddingTime))
  ns.print(`Complete time is delayed by ${ns.tFormat(now() - completeAt, true)}`);
  ns.toast(`Batch hacking ${target} completed!`)

  await ns.sleep(batchPaddingTime)
}

export async function fill(ns: NS) {
  while (await GW(ns)) {
    //
  }
}

export async function GW(ns: NS): Promise<boolean> {
  const batchPaddingTime = 200

  const targets = list(ns, { onlyNuked: true })
    .filter(host => (ns.getServer(host).moneyAvailable ?? 0) < ns.getServerMaxMoney(host))
    .filter(host => isHackable(ns, host))
    .map(host => [host, computeEarningsVelocity(ns, host)] as [string, number])
    .sort((a, b) => a[1] - b[1])
    .map(([host]) => host)

  if (targets.length == 0) return false

  const target = targets[0]
  const batchTime = getGWTime(ns, target)
  const completeAt = now() + batchTime

  ns.print(`Batch growing ${target} will complete in ${ns.tFormat(batchTime)} at ${formatTime(completeAt)}`)
  ns.toast(`Batch growing ${target} will complete in ${ns.tFormat(batchTime)} at ${formatTime(completeAt)}`, 'info', batchTime + 2000)

  let batches = 0
  for (const host of list(ns, { onlyNuked: true, includePurchased: true, includeHome: true, includeHacknet: true })) {
    const preservedRam = host == 'home' ? 16 : 0
    const isDeployed = await execGW(ns, host, target, Infinity, preservedRam)
    batches += isDeployed ? 1 : 0;
  }

  await ns.sleep(batchTime - (batches * 2 * paddingTime))
  ns.print(`Complete time is delayed by ${ns.tFormat(now() - completeAt, true)}`);
  ns.toast(`Batch growing ${target} completed!`)

  await ns.sleep(batchPaddingTime)
  return true
}
