import { NS } from '@ns';
import { exec } from './remote';
import { formatTime, now } from './time';

export async function backdoor(ns: NS, host: string) {
    await exec(ns, host, async () => {
        const backdoorTime = getBackdoorTime(ns, host)
        ns.toast(`Installing backdoor on ${host} will complete` +
            ` in ${ns.tFormat(backdoorTime, true)}` +
            ` at ${formatTime(now() + backdoorTime)}`,
            'info', backdoorTime)

        await ns.singularity.installBackdoor()
        ns.toast(`Backdoor on ${host} successful!`)
    })
}

export function getBackdoorTime(ns: NS, host: string) {
    return ns.getHackTime(host) / 4
}