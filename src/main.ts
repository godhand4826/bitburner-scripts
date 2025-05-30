import { NS } from '@ns'
import { b, m, t } from './lib/const'
import { pkill, syncScripts } from './lib/remote'
import { run as runStock } from './stock'
import { run as runHacknet } from './hacknet'
import { run as runServer } from './server'
import { run as runGang } from './gang'
import { run as runFaction } from './faction'
import { ready } from './lib/cdn'

export async function main(ns: NS): Promise<void> {
  await ready()

  pkill(ns)
  syncScripts(ns)

  ns.run('focus.js')

  ns.run('overview.js')
  ns.run('dashboard.js')

  ns.run('darkweb.js')
  ns.run('nuke.js')
  ns.run('farm.js')
  ns.run('cct.js')
  runHacknet(ns, 30 * m, 0 * 500 * m, 0)
  ns.run('go.js')
  runFaction(ns, 3)
  runStock(ns, 250 * m)
  runServer(ns, 1 * t, 1 * t)
  ns.run('backdoor.js')
  ns.run('bladeburner.js')
  runGang(ns, 1 * t, 100 * b)

  // ns.run('reputation.js', 1, true, false, false)
}
