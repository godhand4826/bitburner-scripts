import { NS } from '@ns';
import { disableLogs } from './lib/log';
import { autoSetAction } from './lib/focus';

export async function main(ns: NS): Promise<void> {
    disableLogs(ns, 'sleep')

    for (; ;) {
        await autoSetAction(ns)

        await ns.sleep(2000)
    }
}
