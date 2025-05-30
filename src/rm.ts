import { AutocompleteData, NS, ScriptArg } from '@ns'
import { ls, RemoteFile, rm } from './lib/remote'

export async function main(ns: NS): Promise<void> {
    const substring = (ns.args.filter(arg => arg !== '-f').at(0) ?? '') as string
    const force = ns.args.some(arg => arg === '-f')

    const remoteFiles = ls(ns, substring).filter(rf =>
        rf.name.endsWith('.js') || rf.name.endsWith('.cct'))
    if (remoteFiles.length == 0) {
        ns.tprintf('No files found')
        return
    }

    if (force || await confirm(ns, remoteFiles)) {
        remoteFiles.forEach(remoteFile => rm(ns, remoteFile))
    }
}

async function confirm(ns: NS, remoteFiles: RemoteFile[]): Promise<boolean> {
    const fileList = remoteFiles
        .map(({ host, name }) => `${host}:${name}`)
        .join(', ')
        .match(/.{1,150}/g)?.join('\n')

    const ok = await ns.prompt(
        `Are you sure you want to delete ${remoteFiles.length} files?\n${fileList}`,
        { type: 'boolean' }
    ) as boolean
    return ok
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return ['contract']
}