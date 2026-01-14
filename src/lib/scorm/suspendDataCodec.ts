export function encodeSuspendData(data: object): string {
    return JSON.stringify(data).replace(/[']/g, "¬").replace(/["]+/g, "~").replace(/[,]/g, "|");
}

export function decodeSuspendData(str: string): any {
    return JSON.parse(str.replace(/~/g, `"`).replace(/[|]/g, ",").replace(/¬/g, "'"));
}
