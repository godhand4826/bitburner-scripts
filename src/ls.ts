
import { NS } from '@ns';
import { ls } from './lib/remote';

export async function main(ns: NS): Promise<void> {
    const substring = ns.args[0] as string | undefined

    ls(ns, substring).forEach(({ host, name }) => ns.tprintf(`${host} ${name}`))
}