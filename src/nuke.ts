import { NS } from '@ns';
import { list } from './lib/host';
import { nuke } from './lib/nuke';

export async function main(ns: NS): Promise<void> {
    const opt = { includeHome: true, includePurchased: true, includeNetwork: true, nuked: false }

    while (list(ns, opt).length > 0) {
        list(ns, opt).forEach(host => nuke(ns, host))

        await ns.sleep(2000)
    }

    ns.toast('All servers nuked!');
}