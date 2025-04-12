import { AutocompleteData, NS, ScriptArg } from '@ns'
import { find } from './lib/host';

export async function main(ns: NS): Promise<void> {
    const dest = ns.args[0] as string
    const src = ns.args[1] as string

    ns.tprintf(`${find(ns, dest, src)}`)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return data.servers;
}