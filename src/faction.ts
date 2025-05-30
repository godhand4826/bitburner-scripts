import { NS } from '@ns';
import { disableLogs } from './lib/log';
import { autoInstallAugmentations, autoJoinFaction, autoPurchaseAugmentation } from './lib/faction';

export function run(ns: NS, queuedLimit = Infinity) {
    ns.run('faction.js', 1, queuedLimit)
}

export async function main(ns: NS): Promise<void> {
    const queuedLimit = (ns.args[0] ?? Infinity) as number

    disableLogs(ns, 'sleep', 'singularity.purchaseAugmentation', 'singularity.getOwnedAugmentations')

    for (; ;) {
        autoJoinFaction(ns)
        autoPurchaseAugmentation(ns)
        autoInstallAugmentations(ns, queuedLimit)

        await ns.sleep(2000)
    }
}