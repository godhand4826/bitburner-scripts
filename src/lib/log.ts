import { NS } from '@ns'

export function disableLogs(ns: NS, ...fns: string[]) {
    fns.forEach(fn => ns.disableLog(fn))
}

export function enableLogs(ns: NS, ...fns: string[]) {
    fns.forEach(fn => ns.enableLog(fn))
}

export function setEnabledLogs(ns: NS, ...fns: string[]) {
    ns.disableLog('ALL')
    enableLogs(ns, ...fns)
}
