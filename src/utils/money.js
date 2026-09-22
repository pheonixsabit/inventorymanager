export function toCents(value) {
	return Math.round((Number(value) || 0) * 100);
}

export function fromCents(value) {
	return Math.round(Number(value) || 0) / 100;
}

export function roundMoney(value) {
	return Math.round((Number(value) || 0) * 100) / 100;
}

