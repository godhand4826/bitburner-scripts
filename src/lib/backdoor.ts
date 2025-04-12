import { NS } from '@ns';
import { exec } from './remote';
import { formatDate, now } from './time';

export async function backdoor(ns: NS, host: string) {
    await exec(ns, host, async () => {
        const backdoorTime = getBackdoorTime(ns, host)
        ns.tprint(`Installing backdoor on ${host} will` +
            ` complete in ${ns.tFormat(backdoorTime, true)} at ${formatDate(now() + backdoorTime)}`)

        await ns.singularity.installBackdoor()
        ns.tprint(`Backdoor on ${host} successful!`)
    })
}

export function getBackdoorTime(ns: NS, host: string) {
    return ns.getHackTime(host) / 4
}