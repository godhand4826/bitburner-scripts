import { NS } from '@ns';
import { disableLogs } from './lib/log';
import { autoSetAction } from './lib/focus';

export async function main(ns: NS): Promise<void> {
    const enableGrafting = (ns.args[0] ?? false) as boolean

    disableLogs(ns, 'sleep', 'getServerMoneyAvailable')

    for (; ;) {
        await autoSetAction(ns, enableGrafting)

        await ns.sleep(2000)
    }
}
