import { NS } from '@ns';
import { maxThreads } from './ram';

const share = 'share.js'

export function deployShare(ns: NS, host: string) {
    ns.scp(share, host, 'home')

    const threads = maxThreads(ns, host, ns.getScriptRam(share))
    if (threads > 0) {
        ns.exec(share, host, { threads })
    }
}