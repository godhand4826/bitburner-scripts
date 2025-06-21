import { NS } from '@ns'
import { autoPurchasedServer, autoUpgradePurchasedServer, isPurchasedServersFullyUpgraded } from './lib/server'
import { disableLogs } from './lib/log'
import { getBudget } from './lib/money'

export async function main(ns: NS): Promise<void> {
    disableLogs(ns, 'getServerMoneyAvailable', 'getServerMaxRam', 'sleep')

    while (!isPurchasedServersFullyUpgraded(ns)) {
        autoPurchasedServer(ns, Infinity, getBudget(ns, Infinity) / 0.50)
        autoUpgradePurchasedServer(ns, Infinity, getBudget(ns, Infinity) / 0.50)

        await ns.sleep(2000)
    }

    ns.toast('Purchased servers are fully upgraded')
}
