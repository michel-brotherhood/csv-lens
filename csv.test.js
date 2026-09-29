import test from "node:test";
import assert from "node:assert/strict";
import { parseCSV, protectSpreadsheetFormula } from "./csv.js";

test("parses comma-delimited rows and trims header names", () => {
  assert.deepEqual(parseCSV("\uFEFF name ,age\nAna,32\nBeto,28"), {
    headers: ["name", "age"],
    rows: [
      ["Ana", "32"],
      ["Beto", "28"],
    ],
    delimiter: ",",
  });
});

test("detects semicolon delimiter even when values contain commas", () => {
  assert.deepEqual(parseCSV('nome;observacao\nAna;"Rio, Niterói"'), {
    headers: ["nome", "observacao"],
    rows: [["Ana", "Rio, Niterói"]],
    delimiter: ";",
  });
});

test("detects tab delimiter", () => {
  assert.deepEqual(parseCSV("nome\tidade\nAna\t32"), {
    headers: ["nome", "idade"],
    rows: [["Ana", "32"]],
    delimiter: "\t",
  });
});

test("preserves escaped quotes, delimiters and newlines inside quoted fields", () => {
  assert.deepEqual(parseCSV('id,texto\n1,"disse ""olá,""\nsegunda linha"'), {
    headers: ["id", "texto"],
    rows: [["1", 'disse "olá,"\nsegunda linha']],
    delimiter: ",",
  });
});

test("preserves irregular rows by adding columns and padding missing values", () => {
  assert.deepEqual(parseCSV("a,b\n1\n2,3,4"), {
    headers: ["a", "b", "Coluna 3"],
    rows: [
      ["1", "", ""],
      ["2", "3", "4"],
    ],
    delimiter: ",",
  });
});

test("ignores blank lines and supports CRLF line endings", () => {
  assert.deepEqual(parseCSV("a,b\r\n1,2\r\n\r\n3,4\r\n"), {
    headers: ["a", "b"],
    rows: [
      ["1", "2"],
      ["3", "4"],
    ],
    delimiter: ",",
  });
});

test("rejects an unclosed quoted field", () => {
  assert.throws(() => parseCSV('a,b\n1,"broken'), /aspas que não foi fechado/);
});

test("rejects invalid content after a quoted field", () => {
  assert.throws(() => parseCSV('a,b\n"value"oops,2'), /texto inesperado/);
});

test("rejects files with no data rows", () => {
  assert.throws(() => parseCSV("a,b"), /linhas de dados suficientes/);
});

test("protects formula-like spreadsheet values without changing numbers", () => {
  assert.equal(protectSpreadsheetFormula("=1+1"), "'=1+1");
  assert.equal(protectSpreadsheetFormula("  @SUM(A1:A2)"), "'  @SUM(A1:A2)");
  assert.equal(protectSpreadsheetFormula("-42.50"), "-42.50");
  assert.equal(protectSpreadsheetFormula("Texto normal"), "Texto normal");
});
