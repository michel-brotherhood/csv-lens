import { parseCSV, protectSpreadsheetFormula } from "./csv.js";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const state = {
  headers: [],
  rows: [],
  filtered: [],
  page: 1,
  pageSize: 25,
  query: "",
  sortColumn: -1,
  sortDirection: 1,
  fileName: "",
};
const el = (id) => document.getElementById(id);
const fileInput = el("file-input");
const dropzone = el("dropzone");

function normalize(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}
function announce(message) {
  el("status").textContent = message;
}
function formatBytes(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function showError(message) {
  const box = el("error-box");
  box.textContent = message;
  box.hidden = false;
}

function updateFiltered() {
  const query = normalize(state.query.trim());
  state.filtered = state.rows.filter(
    (row) => !query || row.some((cell) => normalize(cell).includes(query)),
  );
  if (state.sortColumn >= 0) {
    state.filtered.sort(
      (a, b) =>
        a[state.sortColumn].localeCompare(b[state.sortColumn], "pt-BR", {
          numeric: true,
          sensitivity: "base",
        }) * state.sortDirection,
    );
  }
  state.page = 1;
  render();
}

function render() {
  const total = state.filtered.length;
  const pages = Math.max(1, Math.ceil(total / state.pageSize));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * state.pageSize;
  const visible = state.filtered.slice(start, start + state.pageSize);
  const thead = el("data-table").querySelector("thead");
  const tbody = el("data-table").querySelector("tbody");
  thead.replaceChildren();
  tbody.replaceChildren();

  const headRow = document.createElement("tr");
  state.headers.forEach((header, index) => {
    const th = document.createElement("th");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${header}${state.sortColumn === index ? (state.sortDirection === 1 ? " ↑" : " ↓") : ""}`;
    button.setAttribute("aria-label", `Ordenar por ${header}`);
    th.scope = "col";
    th.setAttribute(
      "aria-sort",
      state.sortColumn === index
        ? state.sortDirection === 1
          ? "ascending"
          : "descending"
        : "none",
    );
    button.addEventListener("click", () => {
      state.sortDirection =
        state.sortColumn === index ? -state.sortDirection : 1;
      state.sortColumn = index;
      updateFiltered();
    });
    th.append(button);
    headRow.append(th);
  });
  thead.append(headRow);
  if (visible.length === 0) {
    const tr = document.createElement("tr"),
      td = document.createElement("td");
    td.colSpan = state.headers.length;
    td.className = "empty";
    td.textContent = "Nenhum resultado para esta busca.";
    tr.append(td);
    tbody.append(tr);
  } else {
    visible.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        td.title = value;
        tr.append(td);
      });
      tbody.append(tr);
    });
  }
  el("result-count").textContent =
    `${total.toLocaleString("pt-BR")} resultado${total === 1 ? "" : "s"}`;
  el("page-label").textContent = `Página ${state.page} de ${pages}`;
  el("previous").disabled = state.page <= 1;
  el("next").disabled = state.page >= pages;
  const stats = [
    ["LINHAS", state.rows.length],
    ["COLUNAS", state.headers.length],
    ["RESULTADOS", total],
  ];
  el("stats").replaceChildren(
    ...stats.map(([label, value]) => {
      const card = document.createElement("div");
      card.className = "stat";
      const caption = document.createElement("span");
      caption.className = "stat-label";
      caption.textContent = label;
      const metric = document.createElement("span");
      metric.className = "stat-value";
      metric.textContent = value.toLocaleString("pt-BR");
      card.append(caption, metric);
      return card;
    }),
  );
}

async function loadFile(file) {
  if (!file) return;
  el("error-box").hidden = true;
  if (file.size > MAX_FILE_SIZE) {
    showError("Este arquivo passa do limite de 20 MB.");
    return;
  }
  if (
    !file.name.toLowerCase().endsWith(".csv") &&
    file.type !== "text/csv" &&
    file.type !== "text/plain"
  ) {
    showError("Escolha um arquivo CSV.");
    return;
  }
  try {
    const { headers, rows } = parseCSV(await file.text());
    state.headers = headers;
    state.rows = rows;
    state.fileName = file.name;
    state.query = "";
    state.sortColumn = -1;
    state.sortDirection = 1;
    el("search").value = "";
    el("file-name").textContent = file.name;
    el("file-meta").textContent =
      `${rows.length.toLocaleString("pt-BR")} linhas · ${headers.length} colunas · ${formatBytes(file.size)}`;
    el("workspace").hidden = false;
    updateFiltered();
    announce(`${file.name} carregado com ${rows.length} linhas.`);
    el("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Não foi possível ler este arquivo.",
    );
  }
}

el("choose-file").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  loadFile(fileInput.files[0]);
  fileInput.value = "";
});
for (const event of ["dragenter", "dragover"])
  dropzone.addEventListener(event, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragging");
  });
for (const event of ["dragleave", "drop"])
  dropzone.addEventListener(event, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragging");
  });
dropzone.addEventListener("drop", (e) => loadFile(e.dataTransfer.files[0]));
el("search").addEventListener("input", (e) => {
  state.query = e.target.value;
  updateFiltered();
});
el("page-size").addEventListener("change", (e) => {
  state.pageSize = Number(e.target.value);
  updateFiltered();
});
el("previous").addEventListener("click", () => {
  state.page--;
  render();
});
el("next").addEventListener("click", () => {
  state.page++;
  render();
});
el("clear-file").addEventListener("click", () => {
  state.headers = [];
  state.rows = [];
  state.filtered = [];
  state.page = 1;
  el("workspace").hidden = true;
  el("error-box").hidden = true;
  announce("Arquivo fechado.");
});
el("export").addEventListener("click", () => {
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [state.headers, ...state.filtered.map((row) => row)]
    .map((row) =>
      row.map((value) => quote(protectSpreadsheetFormula(value))).join(";"),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.hidden = true;
  link.download = `${state.fileName.replace(/\.csv$/i, "").replace(/[^\p{L}\p{N}._-]+/gu, "_")}-filtrado.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce(`${state.filtered.length} linhas exportadas.`);
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    el("search").focus();
  }
});
