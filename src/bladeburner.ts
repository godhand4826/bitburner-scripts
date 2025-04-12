import { NS } from '@ns'
import { autoStartActions, hasSimulacrum, upgradeSkills } from './lib/bladeburner'
import { disableLogs } from './lib/log'

export async function main(ns: NS): Promise<void> {
    disableLogs(ns, 'sleep')

    while (!ns.bladeburner.inBladeburner()) {
        if (ns.bladeburner.joinBladeburnerDivision()) {
            ns.tprint('You have joined into the Bladeburner division');

            break
        }

        await ns.sleep(2000)
    }

    for (; ;) {
        upgradeSkills(ns)

        if (!ns.singularity.isBusy() || hasSimulacrum(ns)) {
            autoStartActions(ns)
        }

        await ns.bladeburner.nextUpdate()
    }
}
