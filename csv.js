const DELIMITERS = [",", ";", "\t"];

function parseRecords(source, delimiter) {
  const records = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let afterQuote = false;

  const finishField = () => {
    row.push(field);
    field = "";
    afterQuote = false;
  };
  const finishRow = () => {
    finishField();
    if (row.some((value) => value !== "")) records.push(row);
    row = [];
  };

  for (let index = 0; index < source.length; index++) {
    const char = source[index];

    if (inQuotes) {
      if (char === '"' && source[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        inQuotes = false;
        afterQuote = true;
      } else {
        field += char;
      }
      continue;
    }

    if (afterQuote) {
      if (char === delimiter) finishField();
      else if (char === "\n" || char === "\r") {
        if (char === "\r" && source[index + 1] === "\n") index++;
        finishRow();
      } else if (char === " " || char === "\t") {
        // Espaços entre o fechamento das aspas e o separador são ignorados.
      } else {
        throw new Error(
          "Encontrei texto inesperado depois de um campo entre aspas.",
        );
      }
    } else if (char === '"') {
      if (field.length !== 0)
        throw new Error("Aspas fora do início de um campo entre aspas.");
      inQuotes = true;
    } else if (char === delimiter) {
      finishField();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index++;
      finishRow();
    } else {
      field += char;
    }
  }

  if (inQuotes)
    throw new Error("O arquivo tem um campo entre aspas que não foi fechado.");
  finishRow();
  return records;
}

function chooseDelimiter(source) {
  const counts = [0, 0, 0];
  const totals = [0, 0, 0];
  const firstWidths = [null, null, null];
  const matchingRecords = [0, 0, 0];
  let inQuotes = false;
  let rowHasContent = false;
  let records = 0;

  const finishRecord = () => {
    if (rowHasContent || counts.some((count) => count > 0)) {
      records++;
      counts.forEach((count, index) => {
        const width = count + 1;
        firstWidths[index] ??= width;
        totals[index] += width;
        if (width === firstWidths[index]) matchingRecords[index]++;
      });
    }
    counts.fill(0);
    rowHasContent = false;
  };

  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (char === '"') {
      if (inQuotes && source[index + 1] === '"') {
        rowHasContent = true;
        index++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (inQuotes) {
      rowHasContent = true;
    } else if (!inQuotes) {
      const delimiterIndex = DELIMITERS.indexOf(char);
      if (delimiterIndex >= 0) {
        counts[delimiterIndex]++;
        rowHasContent = true;
      }
      if (char === "\n" || char === "\r") {
        if (char === "\r" && source[index + 1] === "\n") index++;
        finishRecord();
      } else {
        rowHasContent = true;
      }
    }
  }
  finishRecord();

  if (records === 0) throw new Error("Não foi possível interpretar o CSV.");

  const scores = totals.map((total, index) => {
    const width = firstWidths[index] ?? 1;
    const averageWidth = total / records;
    const consistency = matchingRecords[index] / records;
    return averageWidth * 100 + consistency * 10 + Math.min(width, 50) / 100;
  });
  return DELIMITERS[scores.indexOf(Math.max(...scores))];
}

function parseCSV(text) {
  const source = text.replace(/^\uFEFF/, "");
  const delimiter = chooseDelimiter(source);
  const records = parseRecords(source, delimiter);
  if (records.length < 2)
    throw new Error("Não encontrei cabeçalho e linhas de dados suficientes.");

  const columnCount = Math.max(...records.map((record) => record.length));
  const headers = Array.from({ length: columnCount }, (_, index) => {
    const value = records[0][index]?.trim();
    return value || `Coluna ${index + 1}`;
  });
  const rows = records
    .slice(1)
    .map((record) =>
      Array.from({ length: columnCount }, (_, index) => record[index] ?? ""),
    );

  return { headers, rows, delimiter };
}

function protectSpreadsheetFormula(value) {
  const text = String(value);
  const formulaLike = /^[\t\r ]*[=+@-]/.test(text);
  const numeric = /^[\t ]*[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text);
  return formulaLike && !numeric ? `'${text}` : text;
}

export { parseCSV, protectSpreadsheetFormula };
