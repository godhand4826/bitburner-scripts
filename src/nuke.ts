import { NS } from '@ns';
import { list } from './lib/host';
import { nuke } from './lib/nuke';

export async function main(ns: NS): Promise<void> {
    while (list(ns, { onlyNuked: true }).length < list(ns).length) {
        list(ns).forEach(host => nuke(ns, host))

        await ns.sleep(2000)
    }

    ns.toast('All servers nuked!');
}