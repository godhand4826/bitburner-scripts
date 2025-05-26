import { NS } from '@ns';
import { purchaseStockAPIs, closeAllPosition, isFullyPurchasedStockAPIs, autoClosePositions, autoCreatePositions } from './lib/stock'
import { disableLogs } from './lib/log';

export function run(ns: NS, preservedMoney = 250_000_000) {
    ns.run('stock.js', 1, preservedMoney)
}

export async function main(ns: NS): Promise<void> {
    const preservedMoney = (ns.args[0] ?? 250_000_000) as number

    disableLogs(ns, 'sleep', 'getServerMoneyAvailable')

    while (!isFullyPurchasedStockAPIs(ns)) {
        purchaseStockAPIs(ns)

        await ns.sleep(2000)
    }

    ns.atExit(() => closeAllPosition(ns))

    for (let ticks = 0; ; ticks++) {
        autoClosePositions(ns)
        autoCreatePositions(ns, preservedMoney)

        if (ticks % 60 == 0) {
            // release money awhile for spend
            closeAllPosition(ns)
            ns.toast('close all position for 10 seconds', 'info', 10 * 1000)
            await ns.asleep(10 * 1000)
        }

        await ns.stock.nextUpdate()
    }
}

