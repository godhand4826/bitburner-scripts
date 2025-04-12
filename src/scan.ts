import { NS } from '@ns'
import { listAll } from './lib/host.js'

export async function main(ns: NS): Promise<void> {
    const substring = (ns.args[0] ?? '') as string

    listAll(ns)
        .filter(host => host.includes(substring))
        .forEach(host => ns.tprintf(host))
}