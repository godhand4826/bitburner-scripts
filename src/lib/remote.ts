import { NS, ProcessInfo } from '@ns';
import { find, list, listAll } from './host';

export function ssh(ns: NS, dest: string, from = ns.self().server) {
    find(ns, dest, from)
        .forEach(host => ns.singularity.connect(host))
}

export async function exec(ns: NS, host: string, fn: () => Promise<void>) {
    ssh(ns, host)
    await fn()
    ns.singularity.connect('home')
}

export function scp(ns: NS, files: string | string[], destinations: string[], source?: string) {
    destinations.forEach(dest => ns.scp(files, dest, source))
}

export function syncScripts(ns: NS) {
    scp(ns, ns.ls('home', '.js'), list(ns, { includePurchased: true, includeHacknet: true }))
}

export interface RemoteFile {
    host: string
    name: string
}

export function ls(ns: NS, substring?: string): RemoteFile[] {
    return listAll(ns)
        .flatMap(host => ns.ls(host, substring)
            .map(name => ({ host, name })))
}

export function rm(ns: NS, ...remoteFiles: RemoteFile[]) {
    remoteFiles.forEach(rf => ns.rm(rf.name, rf.host))
}

interface RemoteProcess extends ProcessInfo {
    host: string
}

export function ps(ns: NS, scriptSubstring = '', hostSubstring = ''): RemoteProcess[] {
    return listAll(ns)
        .flatMap(host => ns.ps(host).map(p => ({ host, ...p })))
        .filter(p =>
            p.filename.includes(scriptSubstring) &&
            p.host.includes(hostSubstring)
        )
}

export function kill(ns: NS, ...pids: number[]) {
    pids.forEach(pid => ns.kill(pid));
}

export function pkill(ns: NS, scriptSubstring = '', hostSubstring = '') {
    ps(ns, scriptSubstring, hostSubstring)
        .filter(p => p.pid != ns.pid)
        .forEach(p => ns.kill(p.pid))
}
