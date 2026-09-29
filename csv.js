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
  let best = { delimiter: ",", score: -Infinity };
  let hasValidCandidate = false;
  let firstParseError;

  for (const delimiter of DELIMITERS) {
    try {
      const records = parseRecords(source, delimiter);
      if (records.length === 0) continue;
      hasValidCandidate = true;
      const width = records[0].length;
      const matchingRows = records.filter(
        (record) => record.length === width,
      ).length;
      const consistency = matchingRows / records.length;
      const averageWidth =
        records.reduce((total, record) => total + record.length, 0) /
        records.length;
      const score =
        averageWidth * 100 + consistency * 10 + Math.min(width, 50) / 100;
      if (score > best.score) best = { delimiter, score };
    } catch (error) {
      firstParseError ??= error;
      // Um candidato incorreto pode interpretar aspas de forma inválida.
    }
  }

  if (!hasValidCandidate) {
    if (firstParseError instanceof Error) throw firstParseError;
    throw new Error(
      "Não foi possível interpretar o CSV. Confira as aspas e os separadores.",
    );
  }
  return best.delimiter;
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
