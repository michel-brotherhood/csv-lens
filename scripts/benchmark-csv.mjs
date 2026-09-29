import { parseCSV } from "../csv.js";

const rowCount = 100_000;
const chunks = ["id,regiao,valor\n"];

for (let index = 0; index < rowCount; index++) {
  chunks.push(`${index},Zona ${index % 12},${(index * 1.17).toFixed(2)}\n`);
}

const source = chunks.join("");
const before = process.memoryUsage();
const startedAt = performance.now();
const result = parseCSV(source);
const elapsedMs = performance.now() - startedAt;
const after = process.memoryUsage();
const toMiB = (bytes) => Number((bytes / 1024 / 1024).toFixed(1));

console.log(
  JSON.stringify(
    {
      node: process.version,
      platform: `${process.platform}-${process.arch}`,
      inputBytes: Buffer.byteLength(source),
      rows: result.rows.length,
      columns: result.headers.length,
      parseMilliseconds: Number(elapsedMs.toFixed(1)),
      heapBeforeMiB: toMiB(before.heapUsed),
      heapAfterMiB: toMiB(after.heapUsed),
      heapDeltaMiB: toMiB(after.heapUsed - before.heapUsed),
      rssBeforeMiB: toMiB(before.rss),
      rssAfterMiB: toMiB(after.rss),
      rssDeltaMiB: toMiB(after.rss - before.rss),
    },
    null,
    2,
  ),
);
