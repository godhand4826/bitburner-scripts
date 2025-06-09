import { NS } from '@ns';
import { purchaseStockAPIs, closeAllPosition, isFullyPurchasedStockAPIs, autoClosePositions, autoCreatePositions, getTotalPosition } from './lib/stock'
import { disableLogs } from './lib/log';

export async function main(ns: NS): Promise<void> {
    disableLogs(ns, 'sleep', 'getServerMoneyAvailable')

    while (!isFullyPurchasedStockAPIs(ns)) {
        purchaseStockAPIs(ns)

        await ns.sleep(2000)
    }

    ns.atExit(() => closeAllPosition(ns))

    for (; ;) {
        autoClosePositions(ns)

        // set preserved money to total position will automatically
        // balance cash and stock over time
        autoCreatePositions(ns, getTotalPosition(ns))

        await ns.stock.nextUpdate()
    }
}
