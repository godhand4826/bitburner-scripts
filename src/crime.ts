
import { NS } from '@ns';
import { autoSetCrimeForMoney, setCrime } from './lib/crime';
import { disableLogs } from './lib/log';

export function run(ns: NS, forKarmaAndKill = false, focus = ns.singularity.isFocused()) {
    ns.run('crime.js', 1, forKarmaAndKill, focus)
}

export async function main(ns: NS): Promise<void> {
    const forKarmaAndKill = (ns.args[0] ?? false) as boolean
    const focus = (ns.args[1] ?? ns.singularity.isFocused()) as boolean

    disableLogs(ns, 'sleep')

    if (forKarmaAndKill) {
        setCrime(ns, ns.enums.CrimeType.homicide, focus)
    } else {
        for (; ;) {
            autoSetCrimeForMoney(ns, focus)

            await ns.sleep(2000);
        }
    }
}