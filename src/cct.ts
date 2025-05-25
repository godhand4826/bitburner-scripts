import { AutocompleteData, NS, ScriptArg } from '@ns';
import { createDummyContract, integrationTest, show, solve } from './lib/cct.js'
import { ls } from './lib/remote.js';
import { disableLogs } from './lib/log.js';

export async function main(ns: NS): Promise<void> {
  const cmd = ns.args[0] as string

  if (cmd == 'show') {
    const host = ns.args[1] as string
    const cct = ns.args[2] as string
    show(ns, host, cct)
  } else if (cmd == 'run') {
    const host = ns.args[1] as string
    const cct = ns.args[2] as string
    solve(ns, host, cct)
  } else if (cmd == 'test') {
    await integrationTest(ns)
  } else if (cmd == 'generate') {
    const typ = ns.args[1] as string
    ns.tprintf(`${typ}: home ${createDummyContract(ns, typ)}`)
  } else if (cmd == 'list') {
    ls(ns, '.cct').forEach(cct => ns.tprint(
      `${ns.codingcontract.getContractType(cct.name, cct.host)}: ${cct.host} ${cct.name}`))
  } else {
    await loop(ns)
  }
}

async function loop(ns: NS) {
  disableLogs(ns, 'scan', 'sleep')

  for (; ;) {
    for (const cct of ls(ns, '.cct')) {
      solve(ns, cct.host, cct.name)

      await ns.sleep(200)
    }

    await ns.sleep(10 * 1000)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
  const cmds = ['show', 'run', 'test', 'generate', 'list']
  return cmds
}