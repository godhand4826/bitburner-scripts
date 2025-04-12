import { NS } from '@ns';
import { isHacknetServer, isHomeServer, isPurchasedServer } from './server';

export function listAll(ns: NS) {
  return list(ns, { includeHome: true, includePurchased: true, includeHacknet: true })
}

export interface ListOptions {
  onlyNuked?: boolean
  onlyBackdoorInstalled?: boolean
  includeHome?: boolean,
  includePurchased?: boolean,
  includeHacknet?: boolean,
}

export function list(ns: NS, opt: ListOptions = {}) {
  function _scan(parent: string, host: string): string[] {
    return ns.scan(host)
      .filter(neighbor => neighbor != parent)
      .flatMap(child => _scan(host, child))
      .concat(host)
  }

  return _scan('', 'home')
    .filter(host =>
      (!opt.onlyNuked || ns.getServer(host).hasAdminRights) &&
      (!opt.onlyBackdoorInstalled || ns.getServer(host).backdoorInstalled) &&
      (opt.includeHome || !isHomeServer(host)) &&
      (opt.includePurchased || !isPurchasedServer(host)) &&
      (opt.includeHacknet || !isHacknetServer(host))
    )
    .sort(hostCompare)
}

// home first, purchased second, hacknet third, then by name (case-insensitive)
function hostCompare(a: string, b: string): number {
  const aa = a.toLowerCase().replace(/^home/g, '(').replace(/^hacknet/g, ')')
  const bb = b.toLowerCase().replace(/^home/g, '(').replace(/^hacknet/g, ')')
  return aa == bb ? 0 : (aa < bb ? -1 : +1)
}

export function find(ns: NS, dest: string, src = ns.self().server): string[] {
  function _scan(parent: string, host: string): string[] {
    const nodes = ns.scan(host)
      .filter(neighbor => neighbor !== parent)
      .flatMap(child => _scan(host, child))

    return [
      ...(host === dest || nodes.length > 0 ? [host] : []),
      ...nodes,
    ]
  }

  return _scan('', src)
}
