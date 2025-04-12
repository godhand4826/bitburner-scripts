
import { NS } from '@ns';
import { autoCrimeForMoney, crimeForKarmaAndKill } from './lib/crime';

export function run(ns: NS, forKarmaAndKill = false, focus = ns.singularity.isFocused()) {
    ns.run('crime.js', 1, forKarmaAndKill, focus)
}

export async function main(ns: NS): Promise<void> {
    const forKarmaAndKill = (ns.args[0] ?? false) as boolean
    const focus = (ns.args[1] ?? ns.singularity.isFocused()) as boolean

    if (forKarmaAndKill) {
        crimeForKarmaAndKill(ns, focus)
    } else {
        await autoCrimeForMoney(ns, focus)
    }
}