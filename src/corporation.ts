
import { Division, NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const corpName = "Corp";
    const agricultureDivisionName = "Agriculture";

    if (!ns.corporation.hasCorporation()) {
        if (ns.corporation.canCreateCorporation(false)) {
            ns.corporation.createCorporation(corpName, false);
        } else {
            return
        }
    }

    if (!hasDivision(ns, agricultureDivisionName)) {
        ns.corporation.expandIndustry('Agriculture', agricultureDivisionName)
    }

    purchaseUnlock(ns, 'Warehouse API');
    purchaseUnlock(ns, 'Office API');
    purchaseUnlock(ns, 'Smart Supply');
    purchaseUnlock(ns, 'Export');

    for (; ;) {
        for (const city of ns.corporation.getDivision(agricultureDivisionName).cities) {
            if (!ns.corporation.hasWarehouse(agricultureDivisionName, city)) {
                ns.corporation.purchaseWarehouse(agricultureDivisionName, city);
            }

            ns.corporation.setSmartSupply(agricultureDivisionName, city, true);

            ns.corporation.sellMaterial(agricultureDivisionName, city, 'Plants', 'MAX', 'MP');
            ns.corporation.sellMaterial(agricultureDivisionName, city, 'Food', 'MAX', 'MP');

            while (ns.corporation.getOffice(agricultureDivisionName, city).size < 6) {
                ns.corporation.upgradeOfficeSize(agricultureDivisionName, city, 1)
            }

            while (ns.corporation.getOffice(agricultureDivisionName, city).numEmployees < ns.corporation.getOffice(agricultureDivisionName, city).size) {
                if (!ns.corporation.hireEmployee(agricultureDivisionName, city)) {
                    break
                }
            }

            if (ns.corporation.getOffice(agricultureDivisionName, city).employeeJobs['Operations'] < 1) {
                ns.corporation.setAutoJobAssignment(agricultureDivisionName, city, 'Operations', 1);
            }
            if (ns.corporation.getOffice(agricultureDivisionName, city).employeeJobs['Engineer'] < 1) {
                ns.corporation.setAutoJobAssignment(agricultureDivisionName, city, 'Engineer', 1);
            }
            if (ns.corporation.getOffice(agricultureDivisionName, city).employeeJobs['Management'] < 1) {
                ns.corporation.setAutoJobAssignment(agricultureDivisionName, city, 'Management', 1);
            }
            if (ns.corporation.getOffice(agricultureDivisionName, city).employeeJobs['Business'] < 1) {
                ns.corporation.setAutoJobAssignment(agricultureDivisionName, city, 'Business', 1);
            }
            if (ns.corporation.getOffice(agricultureDivisionName, city).employeeJobs['Research & Development'] < 1) {
                ns.corporation.setAutoJobAssignment(agricultureDivisionName, city, 'Research & Development', 1);
            }
            if (ns.corporation.getOffice(agricultureDivisionName, city).employeeJobs['Intern'] < 1) {
                ns.corporation.setAutoJobAssignment(agricultureDivisionName, city, 'Intern', 1);
            }
        }

        await ns.sleep(2000)
    }
}

function hasDivision(ns: NS, divisionName: string): boolean {
    return getDivision(ns, divisionName) != null
}

function getDivision(ns: NS, divisionName: string): Division | null {
    try {
        return ns.corporation.getDivision(divisionName);
    } catch (e) {
        return null;
    }
}

function purchaseUnlock(ns: NS, unlockName: string): void {
    if (!ns.corporation.hasUnlock(unlockName)) {
        ns.corporation.purchaseUnlock(unlockName);
    }
}
