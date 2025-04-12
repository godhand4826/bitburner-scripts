import { NS } from '@ns'
import { now } from './time'

export async function send(ns: NS, port: number, msg: unknown): Promise<void> {
    const payload = JSON.stringify(msg)
    while (!ns.tryWritePort(port, payload)) {
        await ns.asleep(200)
    }
}

export function trySend(ns: NS, port: number, msg: unknown) {
    if (!ns.tryWritePort(port, JSON.stringify(msg))) {
        // The channel is unexpectedly full, likely due to back pressure
        // or the absence of a consumer to read the message.
        ns.tprint(`Unexpected full channel on port ${port}, message dropped: ${msg}`)
    }
}

export async function receive(ns: NS, port: number): Promise<unknown> {
    while (isPortEmpty(ns, port)) {
        await ns.nextPortWrite(port)
    }
    return JSON.parse(ns.readPort(port))
}

export function tryReceive(ns: NS, port: number): unknown | undefined {
    return isPortEmpty(ns, port) ? undefined : JSON.parse(ns.readPort(port))
}

export function peek(ns: NS, port: number): unknown | undefined {
    return isPortEmpty(ns, port) ? undefined : JSON.parse(ns.peek(port))
}

export function isPortEmpty(ns: NS, port: number): boolean {
    return ns.getPortHandle(port).empty()
}

export function sendExitTime(ns: NS, port: number) {
    ns.atExit(() => trySend(ns, port, now()), `sendExitTime`)
}