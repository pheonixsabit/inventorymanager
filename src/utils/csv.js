export function parseCsv(text) {
	const lines = text.trim() ? text.trim().split(/\r?\n/) : [];
	const headers = splitCsvLine(lines.shift() || "");
	return lines.map((line) => {
		const cells = splitCsvLine(line);
		return headers.reduce((row, header, index) => ({ ...row, [header]: cells[index] || "" }), {});
	});
}

export function toCsv(rows, headers = Object.keys(rows[0] || {})) {
	const cell = (value) => {
		const text = String(value ?? "");
		return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
	};
	return [headers.join(","), ...rows.map((row) => headers.map((header) => cell(row[header])).join(","))].join("\n");
}

function splitCsvLine(line) {
	const cells = [];
	let cell = "";
	let quoted = false;
	for (const char of line) {
		if (char === "\"") quoted = !quoted;
		else if (char === "," && !quoted) {
			cells.push(cell);
			cell = "";
		} else cell += char;
	}
	cells.push(cell);
	return cells;
}

