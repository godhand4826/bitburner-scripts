import { NS } from '@ns'
import { list } from './lib/host.js'
import { isHackable, requiredHackingSkill } from './lib/hack.js'
import { backdoor } from './lib/backdoor.js'

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
    ns.enableLog('singularity.installBackdoor')

    while (list(ns).some(host => !ns.getServer(host).backdoorInstalled)) {
        const hosts = list(ns, { onlyNuked: true })
            .filter(host => !ns.getServer(host).backdoorInstalled && isHackable(ns, host))
            .sort((h1, h2) => requiredHackingSkill(ns, h1) - requiredHackingSkill(ns, h2))

        for (const host of hosts) {
            await backdoor(ns, host)
        }

        await ns.sleep(2000)
    }
}