import { AutocompleteData, NS, ScriptArg } from '@ns'
import { ssh } from './lib/remote';

export async function main(ns: NS): Promise<void> {
  const dest = ns.args[0] as string

  ssh(ns, dest)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
  return data.servers;
}