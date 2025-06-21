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

// home first, hacknet second, purchased third, others order by name (case-insensitive)
function hostCompare(a: string, b: string): number {
  function _normalize(host: string): string {
    return host.toLowerCase()
      .replace(/^home$/g, '\u0000')
      .replace(/^hacknet-server-(\d*)$/g, (_, index) => '\u0001' + index.padStart(2, '0'))
      .replace(/^home-/g, '\u0002')
  }

  const aa = _normalize(a)
  const bb = _normalize(b)
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
