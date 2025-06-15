import { NS } from '@ns'
import { RemoteHGWOptions } from './lib/hack'

export async function main(ns: NS): Promise<void> {
    const opts = JSON.parse(ns.args[0] as string) as RemoteHGWOptions

    const { host, threads, stock, additionalMsec } = opts

    await ns.hack(host, { threads, stock, additionalMsec })
}
