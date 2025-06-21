export const defaultWidth = 20;
export const defaultFillChar = '|';
export const defaultEmptyChar = '-';

export function percentageBarString(
    percentage: number,
    width = defaultWidth,
    fillChar = defaultFillChar,
    emptyChar = defaultEmptyChar,
): string {
    const capped = Math.max(0, Math.min(1, percentage));

    const outerWidth = 2 // '[' and ']'
    const innerWidth = Math.max(0, width - outerWidth);
    const filledWidth = Math.round(capped * innerWidth);
    const emptyWidth = innerWidth - filledWidth;

    const bar = `[${fillChar.repeat(filledWidth)}${emptyChar.repeat(emptyWidth)}]`
    return bar
}


export function barString(
    current: number,
    max: number,
    width = defaultWidth,
    fillChar = defaultFillChar,
    emptyChar = defaultEmptyChar,
): string {
    return percentageBarString(current / Math.max(1e-9, max), width, fillChar, emptyChar);
}

export function booleanString(value: boolean): string {
    return value ? '●' : '○';
}