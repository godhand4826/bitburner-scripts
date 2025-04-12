import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    for (; ;) {
        await ns.share()
    }
}