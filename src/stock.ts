import { NS } from '@ns';
import { purchaseStockAPIs, closeAllPosition, isFullyPurchasedStockAPIs, autoClosePositions, autoCreatePositions, getTotalPosition } from './lib/stock'
import { disableLogs } from './lib/log';
import { formatTime, now } from './lib/time';
import { b } from './lib/const';
import { getBudget } from './lib/money';

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

    const releaseInterval = 60 * 1000;
    const releaseTime = 5 * 1000;
    let nextReleaseAt = now();
    for (; ;) {
        // release money awhile for spend
        if (now() >= nextReleaseAt && getTotalPosition(ns) > 100 * b && getBudget(ns) < 100 * b) {
            ns.toast(`release all position for ${ns.tFormat(releaseTime)}`, 'info', releaseTime + 2000)
            closeAllPosition(ns)
            nextReleaseAt = now() + releaseInterval
            await ns.asleep(releaseTime)
            ns.toast(`next position release in ${ns.tFormat(releaseInterval)} at ${formatTime(nextReleaseAt)}`, 'info', nextReleaseAt - now() + 2000)
        }

        autoClosePositions(ns)
        autoCreatePositions(ns, preservedMoney)

        await ns.stock.nextUpdate()
    }
}

