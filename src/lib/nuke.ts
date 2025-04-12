import { NS } from '@ns';

export function nuke(ns: NS, host: string) {
  // open ports
  ns.fileExists('BruteSSH.exe') && ns.brutessh(host)
  ns.fileExists('FTPCrack.exe') && ns.ftpcrack(host)
  ns.fileExists('relaySMTP.exe') && ns.relaysmtp(host)
  ns.fileExists('HTTPWorm.exe') && ns.httpworm(host)
  ns.fileExists('SQLInject.exe') && ns.sqlinject(host)

  // nuke if needed and possible
  const server = ns.getServer(host)
  if (
    !server.hasAdminRights &&
    (server.openPortCount ?? 0) >= (server.numOpenPortsRequired ?? Infinity)
  ) {
    ns.nuke(host)
    ns.tprint(`Successfully nuked ${host}`)
  }
}