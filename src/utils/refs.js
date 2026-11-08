export function formatRef(prefix, number) {

    const padded = String(number).padStart(4, '0');
    return `${prefix}-${padded}`;

}
export function normaliseRef(input) {

    const text = String(input ?? '').trim();
    const match = text.match(/^([A-Za-z])-?(\d+)$/);
    if (!match) return null;
    return formatRef(match[1].toUpperCase(), Number(match[2]));

}