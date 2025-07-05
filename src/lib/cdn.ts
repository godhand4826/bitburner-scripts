import dateFnsNamespace from 'date-fns'
/**
 * Module: cdn.ts
 *
 * Purpose:
 * Simulates a lightweight module system in the Bitburner environment, which lacks native support for modules and npm packages.
 * This module acts as a bridge between local type-safe TypeScript development and runtime CDN-loaded libraries in-game.
 *
 * Features:
 * - Dynamically loads external libraries (e.g., date-fns) via CDN into the global context.
 * - Exposes typed module access through `loadModules()`, returning global references (e.g., `window.dateFns`).
 * - Prevents duplicate script injection.
 * - Enables Bitburner scripts to `import { ready, loadModules } from './cdn'` and safely use external libraries.
 *
 * Usage:
 * 1. Call `await ready()` at the start of your script to ensure libraries are loaded.
 * 2. Use `const { dateFns } = loadModules()` to access the loaded libraries.
 *
 * Notes:
 * - Type safety is provided during development via npm-installed types (e.g., `@types/date-fns` or `date-fns` itself).
 * - At runtime, actual library code is loaded from CDN (e.g., jsDelivr), ensuring compatibility inside Bitburner.
 */

// ref: https://date-fns.org/
const dateFnsReady = loadScript('https://cdn.jsdelivr.net/npm/date-fns@3.6.0/cdn.min.js')

export async function ready(): Promise<void> {
    await Promise.all([
        dateFnsReady
    ])
}

// Returns global modules if they are loaded from the CDN
// May return undefined if scripts haven't finished loading
export function loadModules(): { dateFns: typeof dateFnsNamespace } {
    return {
        dateFns: eval('window.dateFns')
    }
}

async function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const doc = eval(`document`) as Document

        if (doc.querySelectorAll(`script[src='${src}']`).length > 0) {
            resolve()
            return
        }

        const script = doc.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))

        doc.body.appendChild(script)
    })
}