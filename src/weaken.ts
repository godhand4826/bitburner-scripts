import { AutocompleteData, NS, ScriptArg } from '@ns'
import { parseFlags, autocomplete as _autocomplete } from './lib/hack'

export async function main(ns: NS): Promise<void> {
    const { host, threads, stock, additionalMsec } = parseFlags(ns)

    await ns.weaken(host, { threads, stock, additionalMsec })
}

export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
    return _autocomplete(data, args)
}