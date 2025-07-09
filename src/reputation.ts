import { NS } from '@ns';
import { list } from './lib/host';
import { deployShare } from './lib/share';

export async function main(ns: NS): Promise<void> {
    const includePurchased = (ns.args[0] ?? false) as boolean
    const includeHome = (ns.args[1] ?? false) as boolean
    const includeHacknet = (ns.args[2] ?? false) as boolean

    list(ns, { includeHacknet, includeHome, includePurchased, nuked: true })
        .forEach(host => deployShare(ns, host))
}
