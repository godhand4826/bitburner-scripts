import { NS } from "@ns";
import { run } from "./lib/terminal";

export async function main(ns: NS): Promise<void> {
    [
        ["m", "home; ./main.js; clear"],
        ["h", "home"],
        ["ssh", "home; ./ssh.js"],
        ["pkill", "./pkill.js"],
    ].forEach(([name, command]) => run(`alias ${name}='${command}'`))

    ns.toast("Aliases set up successfully.");
}