import { NS } from '@ns'
import { autoSetAction } from './lib/sleeve'
import { disableLogs } from './lib/log'

export async function main(ns: NS): Promise<void> {
    disableLogs(ns, 'sleep')

    for (; ;) {
        autoSetAction(ns)

        await ns.sleep(2000)
    }
}