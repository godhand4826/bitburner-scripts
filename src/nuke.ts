import { NS } from '@ns';
import { list } from './lib/host';
import { nuke } from './lib/nuke';

export async function main(ns: NS): Promise<void> {
    while (
        list(ns, { onlyNuked: true, includeHome: true, includePurchased: true }).length <
        list(ns, { onlyNuked: false, includeHome: true, includePurchased: true }).length
    ) {
        list(ns, { includeHome: true, includePurchased: true }).forEach(host => nuke(ns, host))

        await ns.sleep(2000)
    }

    ns.toast('All servers nuked!');
}