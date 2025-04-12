import { NS, } from '@ns'
import { ps } from './lib/remote'

export async function main(ns: NS): Promise<void> {
    const substring = ns.args[0] as string

    ps(ns, substring).forEach(processes => {
        const argsFormat = Array(processes.args.length).fill('%j')
        const format = [`(PID - %d)`, `%s`, ...argsFormat].join(' ')

        ns.tprintf(format, processes.pid, processes.filename, ...processes.args)
    })
}
