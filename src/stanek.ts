import { NS } from '@ns';
import { activeFragments, chargeFragments } from './lib/stanek';
import { disableLogs } from './lib/log';

export async function main(ns: NS): Promise<void> {
    disableLogs(ns, 'sleep', 'stanek.chargeFragment', 'stanek.activeFragments')

    ns.stanek.acceptGift()

    for (; ;) {
        if (activeFragments(ns).length > 0) {
            await chargeFragments(ns)
        } else {
            await ns.sleep(2000)
        }
    }
}