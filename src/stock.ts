import { NS } from "@ns";
import { purchaseStockAPIs, closeAllPosition, isFullyPurchasedStockAPIs, autoClosePositions, autoCreatePositions } from "./lib/stock"
import { disableLogs } from "./lib/log";

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
    for (; ;) {
        autoClosePositions(ns)
        autoCreatePositions(ns, preservedMoney)

        await ns.stock.nextUpdate()
    }
}

