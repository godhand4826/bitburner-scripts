import { NS } from '@ns'
import { ps } from './lib/remote'

export async function main(ns: NS): Promise<void> {
    const hostSubstring = (ns.args[0] ?? '') as string
    const scriptSubstring = (ns.args[1] ?? '') as string

    const PAD = {
        host: 20,
        filename: 20,
        pid: 10,
        threads: 16,
    }

    ns.tprintf(
        `${'Hostname'.padEnd(PAD.host)} ` +
        `${'Script'.padEnd(PAD.filename)} ` +
        `${'PID'.padEnd(PAD.pid)} ` +
        `${'Threads'.padEnd(PAD.threads)} ` +
        `${'RAM Usage'}`
    )

    for (const { host, filename, pid, threads } of ps(ns, scriptSubstring, hostSubstring)) {
        ns.tprintf(
            `${host.padEnd(PAD.host)} ` +
            `${filename.padEnd(PAD.filename)} ` +
            `${pid.toString().padEnd(PAD.pid)} ` +
            `${threads.toString().padEnd(PAD.threads)} ` +
            `${ns.formatRam(ns.getScriptRam(filename, host))}`
        )
    }
}