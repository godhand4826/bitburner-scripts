import dateFnsNamespace from 'date-fns'

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