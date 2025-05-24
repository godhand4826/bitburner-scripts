import { NS } from '@ns';
import { computeEarningsVelocity, execHWGW, getHWGWTime, paddingTime } from './lib/hack.js'
import { list } from './lib/host.js';
import { disableLogs } from './lib/log.js';
import { formatDate, now } from './lib/time.js';

export async function main(ns: NS): Promise<void> {
  disableLogs(ns, 'exec', 'sleep', 'getServerMaxRam', 'getServerUsedRam', 'getHackingLevel', 'getServerMoneyAvailable', 'scan')

  await HWGW(ns)
}

export async function HWGW(ns: NS): Promise<void> {
  for (; ;) {
    const targets = list(ns, { onlyNuked: true })
      .map(host => [host, computeEarningsVelocity(ns, host)] as [string, number])
      .sort((a, b) => a[1] - b[1])
      .map(([host]) => host)

    console.assert(targets.length > 0)

    const target = targets[targets.length - 1]
    const batchTime = getHWGWTime(ns, target)
    const completeAt = now() + batchTime

    if (batchTime > 5000) {
      ns.toast(`Batch hacking ${target} will complete in ${ns.tFormat(batchTime)} at ${formatDate(completeAt)}`, 'info')
    }
    ns.print(`Batch hacking ${target} will complete in ${ns.tFormat(batchTime)} at ${formatDate(completeAt)}`)

    let batches = 0
    for (const host of list(ns, { onlyNuked: true, includePurchased: true, includeHome: true })) {
      const preservedRam = host == 'home' ? 16 : 0
      const isDeployed = await execHWGW(ns, host, target, Infinity, preservedRam)
      batches += isDeployed ? 1 : 0;
    }
    await ns.asleep(batchTime - (batches * 4 * paddingTime))

    ns.print(`Complete time is delayed by ${ns.tFormat(now() - completeAt, true)}`);
    await ns.asleep(1200) // 1120
    ns.toast(`Batch hacking ${target} completed!`)
  }
}
