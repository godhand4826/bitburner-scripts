import { NS } from '@ns'
import { autoPurchasedServer, autoUpgradePurchasedServer, isPurchasedServersFullyUpgraded } from './lib/server'
import { disableLogs } from './lib/log'

export function run(ns: NS, budgetLimit = Infinity, preservedMoney = 0, ramLimit = Infinity) {
    ns.run('server.js', 1, budgetLimit, preservedMoney, ramLimit)
}

export async function main(ns: NS): Promise<void> {
    const budgetLimit = (ns.args[0] ?? Infinity) as number
    const preservedMoney = (ns.args[1] ?? 0) as number
    const ramLimit = (ns.args[2] ?? Infinity) as number

    disableLogs(ns, 'getServerMoneyAvailable', 'sleep')

    while (!isPurchasedServersFullyUpgraded(ns)) {
        autoPurchasedServer(ns, budgetLimit, preservedMoney)
        autoUpgradePurchasedServer(ns, budgetLimit, preservedMoney, ramLimit)

        await ns.sleep(2000)
    }

    ns.tprint('Purchased servers are fully upgraded')
}
