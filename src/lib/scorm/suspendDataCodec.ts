export function encodeSuspendData(data: object): string {
    return JSON.stringify(data).replace(/[']/g, "¬").replace(/["]+/g, "~").replace(/[,]/g, "|");
}

export function decodeSuspendData(str: string): unknown {
    return JSON.parse(str.replace(/~/g, `"`).replace(/[|]/g, ",").replace(/¬/g, "'"));
}
