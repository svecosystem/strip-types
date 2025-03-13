export function normalizeNewlines(str: string): string {
	return str.replace(/\r\n/g, '\n');
}
