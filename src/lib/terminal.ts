export function run(cmd: string) {
    const doc = eval('document') as Document;

    // Acquire a reference to the terminal text field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const terminalInput = doc.getElementById('terminal-input') as HTMLInputElement | any;

    // Set the value to the command you want to run.
    terminalInput.value = cmd;

    // Get a reference to the React event handler.
    const handler = Object.keys(terminalInput)[1];

    // If triggered by another UI event, executing immediately might not work properly
    setTimeout(() => {
        // Perform an onChange event to set some internal values.
        terminalInput[handler].onChange({ target: terminalInput });

        // Simulate an enter press
        terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
    }, 0);
}

export function isDisabled(): boolean {
    const doc = eval('document') as Document;
    const terminalInput = doc.getElementById('terminal-input') as HTMLInputElement
    return terminalInput.classList.contains('Mui-disabled')
}