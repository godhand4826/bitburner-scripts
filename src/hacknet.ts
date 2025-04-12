import { NS } from '@ns'
import { autoPurchaseNode, autoUpgradeCache, autoUpgradeCore, autoUpgradeLevel, autoUpgradeRam, sellHashForMoney } from './lib/hacknet'
import { disableLogs } from './lib/log'

export function run(ns: NS, budgetLimit = 200_000_000, preservedMoney = 250_000_000, preservedHash = 0) {
  ns.run('hacknet.js', 1, budgetLimit, preservedMoney, preservedHash)
}

export async function main(ns: NS): Promise<void> {
  const budgetLimit = (ns.args[0] ?? 200_000_000) as number
  const preservedMoney = (ns.args[1] ?? 250_000_000) as number
  const preservedHash = (ns.args[2] ?? 0) as number

  disableLogs(ns, 'getServerMoneyAvailable', 'sleep')

  for (; ;) {
    autoPurchaseNode(ns, budgetLimit, preservedMoney)

    autoUpgradeLevel(ns, budgetLimit, preservedMoney)
    autoUpgradeRam(ns, budgetLimit, preservedMoney)
    autoUpgradeCore(ns, budgetLimit, preservedMoney)
    autoUpgradeCache(ns, 0, preservedMoney)

    sellHashForMoney(ns, preservedHash)

    await ns.sleep(2000)
  }
}