import { NS } from '@ns'
import { list } from './lib/host.js'
import { isHackable, requiredHackingSkill } from './lib/hack.js'
import { backdoor } from './lib/backdoor.js'

export async function main(ns: NS): Promise<void> {
    const includeWorldDaemon = (ns.args[0] ?? false) as boolean

    ns.disableLog('ALL')
    ns.enableLog('singularity.installBackdoor')

    while (list(ns).some(host => !ns.getServer(host).backdoorInstalled)) {
        const hosts = list(ns, { onlyNuked: true })
            .filter(host =>
                !ns.getServer(host).backdoorInstalled &&
                isHackable(ns, host) &&
                (includeWorldDaemon || host != 'w0r1d_d43m0n')
            )
            .sort((h1, h2) => requiredHackingSkill(ns, h1) - requiredHackingSkill(ns, h2))

        for (const host of hosts) {
            await backdoor(ns, host)
        }

        await ns.sleep(2000)
    }

    ns.toast('All servers backdoored!');
}