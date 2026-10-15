const defaultRules = {
  defaultMargin: 35,
  marketplaceFee: 8,
  shippingCost: 2.5,
  minimumProfit: 4,
  undercutPercent: 2,
  priceEnding: ".99"
};

const sampleProducts = [
  {
    sku: "TEE-BLK-M",
    name: "Black Cotton T-Shirt",
    category: "Apparel",
    cost: 7.8,
    price: 18.99,
    competitor: 20.5,
    stock: 42,
    reorderPoint: 12,
    targetMargin: 38
  },
  {
    sku: "MUG-MATTE",
    name: "Matte Ceramic Mug",
    category: "Home",
    cost: 4.4,
    price: 12.99,
    competitor: 11.99,
    stock: 9,
    reorderPoint: 16,
    targetMargin: 34
  },
  {
    sku: "CAP-DENIM",
    name: "Denim Logo Cap",
    category: "Accessories",
    cost: 6.25,
    price: 17.95,
    competitor: 19.99,
    stock: 0,
    reorderPoint: 10,
    targetMargin: 40
  }
];

let products = [];
let productMasters = [];
let rules = defaultRules;
let activeView = "dashboard";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol"
});

const elements = {
  tabs: document.querySelectorAll(".nav-tab"),
  viewTitle: document.querySelector("#viewTitle"),
  totalSkus: document.querySelector("#totalSkus"),
  inventoryValue: document.querySelector("#inventoryValue"),
  lowStockCount: document.querySelector("#lowStockCount"),
  expectedProfit: document.querySelector("#expectedProfit"),
  pricingQueue: document.querySelector("#pricingQueue"),
  reorderList: document.querySelector("#reorderList"),
  strategySummary: document.querySelector("#strategySummary"),
  productForm: document.querySelector("#productForm"),
  productRows: document.querySelector("#productRows"),
  searchProducts: document.querySelector("#searchProducts"),
  importInput: document.querySelector("#importInput"),
  applyAllPrices: document.querySelector("#applyAllPrices"),
  productMasterForm: document.querySelector("#productMasterForm"),
  variantRows: document.querySelector("#variantRows"),
  masterRows: document.querySelector("#masterRows"),
  searchMasters: document.querySelector("#searchMasters")
};

const fields = [
  "editingSku",
  "sku",
  "name",
  "category",
  "cost",
  "price",
  "competitor",
  "stock",
  "reorderPoint",
  "targetMargin"
].reduce((map, id) => ({ ...map, [id]: document.querySelector(`#${id}`) }), {});

const ruleFields = [
  "defaultMargin",
  "marketplaceFee",
  "shippingCost",
  "minimumProfit",
  "undercutPercent",
  "priceEnding"
].reduce((map, id) => ({ ...map, [id]: document.querySelector(`#${id}`) }), {});

document.querySelector("#seedButton").addEventListener("click", async () => {
  await Promise.all(sampleProducts.map((product) => apiRequest("/api/products", { method: "POST", body: product })));
  await loadState();
});

document.querySelector("#exportButton").addEventListener("click", exportCsv);
document.querySelector("#clearForm").addEventListener("click", resetForm);
document.querySelector("#saveRules").addEventListener("click", saveRulesFromForm);
document.querySelector("#clearMasterForm").addEventListener("click", resetMasterForm);
document.querySelector("#addVariant").addEventListener("click", () => addVariantRow());
elements.productMasterForm.addEventListener("submit", saveProductMasterFromForm);
elements.searchMasters.addEventListener("input", renderProductMasters);
elements.applyAllPrices.addEventListener("click", applyAllSuggestedPrices);
elements.importInput.addEventListener("change", importCsv);
elements.searchProducts.addEventListener("input", renderProducts);

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchView(tab.dataset.view));
});

elements.productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const product = readProductForm();
  const method = fields.editingSku.value ? "PUT" : "POST";
  const path = fields.editingSku.value ? `/api/products/${encodeURIComponent(fields.editingSku.value)}` : "/api/products";
  await apiRequest(path, { method, body: product });
  resetForm();
  await loadState();
});

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Request failed");
  }
  return response.status === 204 ? null : response.json();
}

async function loadState() {
  const [productsResponse, rulesResponse, mastersResponse] = await Promise.all([
    apiRequest("/api/products"),
    apiRequest("/api/pricing-rules"),
    apiRequest("/api/product-master")
  ]);
  products = productsResponse.data;
  rules = rulesResponse.data;
  productMasters = mastersResponse.data;
  render();
}

function switchView(view) {
  activeView = view;
  document.querySelectorAll(".view").forEach((panel) => panel.classList.remove("active-view"));
  document.querySelector(`#${view}View`).classList.add("active-view");
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  elements.viewTitle.textContent = view[0].toUpperCase() + view.slice(1);
}

function suggestedPrice(product) {
  const cost = number(product.cost);
  const margin = number(product.targetMargin) || number(rules.defaultMargin);
  const feeRate = number(rules.marketplaceFee) / 100;
  const shipping = number(rules.shippingCost);
  const minProfit = number(rules.minimumProfit);
  const baseCost = cost + shipping;
  const marginPrice = baseCost / Math.max(0.01, 1 - margin / 100 - feeRate);
  const profitPrice = (baseCost + minProfit) / Math.max(0.01, 1 - feeRate);
  const competitor = number(product.competitor);
  const competitorPrice = competitor > 0 ? competitor * (1 - number(rules.undercutPercent) / 100) : 0;
  const target = competitorPrice > 0 ? Math.max(profitPrice, Math.min(marginPrice, competitorPrice)) : Math.max(marginPrice, profitPrice);
  return roundPrice(target);
}

function roundPrice(value) {
  if (rules.priceEnding === "none") {
    return roundMoney(value);
  }

  const ending = Number(rules.priceEnding);
  const whole = Math.floor(value);
  const rounded = whole + ending;
  return roundMoney(rounded < value ? rounded + 1 : rounded);
}

function priceDelta(product) {
  return roundMoney(suggestedPrice(product) - number(product.price));
}

function profitFor(product, price = number(product.price)) {
  const fee = price * (number(rules.marketplaceFee) / 100);
  return roundMoney(price - number(product.cost) - number(rules.shippingCost) - fee);
}

function stockStatus(product) {
  if (number(product.stock) <= 0) return "Out";
  if (number(product.stock) <= number(product.reorderPoint)) return "Low";
  return "Healthy";
}

function render() {
  renderRulesForm();
  renderDashboard();
  renderProducts();
  renderProductMasters();
}

function renderRulesForm() {
  Object.entries(rules).forEach(([key, value]) => {
    ruleFields[key].value = value;
  });
  elements.strategySummary.textContent = `${rules.defaultMargin}% margin, ${rules.marketplaceFee}% fee, ${currency.format(number(rules.shippingCost))} shipping, ${rules.priceEnding} ending.`;
}

function renderDashboard() {
  const inventoryValue = products.reduce((sum, product) => sum + number(product.cost) * number(product.stock), 0);
  const expectedProfit = products.reduce((sum, product) => sum + profitFor(product) * number(product.stock), 0);
  const lowStock = products.filter((product) => stockStatus(product) !== "Healthy");

  elements.totalSkus.textContent = products.length;
  elements.inventoryValue.textContent = currency.format(inventoryValue);
  elements.lowStockCount.textContent = lowStock.length;
  elements.expectedProfit.textContent = currency.format(expectedProfit);

  const priceChanges = products
    .map((product) => ({ product, delta: priceDelta(product), suggested: suggestedPrice(product) }))
    .filter((item) => Math.abs(item.delta) >= 0.01)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  elements.pricingQueue.innerHTML = priceChanges.length
    ? priceChanges.map(({ product, delta, suggested }) => `
      <article class="queue-item">
        <div>
          <strong>${escapeHtml(product.name)}</strong>
          <span>${escapeHtml(product.sku)} · ${currency.format(number(product.price))} → ${currency.format(suggested)} · ${delta > 0 ? "+" : ""}${currency.format(delta)}</span>
        </div>
        <button class="secondary-button" type="button" data-apply-price="${escapeHtml(product.sku)}">Apply</button>
      </article>
    `).join("")
    : `<p class="empty-state">Prices already match the current rules.</p>`;

  elements.reorderList.innerHTML = lowStock.length
    ? lowStock.map((product) => `
      <article class="queue-item">
        <div>
          <strong>${escapeHtml(product.name)}</strong>
          <span>${escapeHtml(product.sku)} · ${product.stock} in stock · reorder at ${product.reorderPoint}</span>
        </div>
        <span class="status ${stockStatus(product).toLowerCase()}">${stockStatus(product)}</span>
      </article>
    `).join("")
    : `<p class="empty-state">No low-stock products right now.</p>`;

  document.querySelectorAll("[data-apply-price]").forEach((button) => {
    button.addEventListener("click", () => applySuggestedPrice(button.dataset.applyPrice));
  });
}

function renderProducts() {
  const search = elements.searchProducts.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const haystack = `${product.sku} ${product.name} ${product.category}`.toLowerCase();
    return haystack.includes(search);
  });

  elements.productRows.innerHTML = visibleProducts.length
    ? visibleProducts.map((product) => {
      const status = stockStatus(product);
      return `
        <tr>
          <td>${escapeHtml(product.sku)}</td>
          <td>${escapeHtml(product.name)}<br><small>${escapeHtml(product.category || "Uncategorized")}</small></td>
          <td>${number(product.stock)}</td>
          <td>${currency.format(number(product.cost))}</td>
          <td>${currency.format(number(product.price))}</td>
          <td>${currency.format(suggestedPrice(product))}</td>
          <td><span class="status ${status.toLowerCase()}">${status}</span></td>
          <td>
            <div class="row-actions">
              <button type="button" title="Edit" aria-label="Edit ${escapeHtml(product.sku)}" data-edit="${escapeHtml(product.sku)}">✎</button>
              <button type="button" title="Delete" aria-label="Delete ${escapeHtml(product.sku)}" data-delete="${escapeHtml(product.sku)}">×</button>
            </div>
          </td>
        </tr>
      `;
    }).join("")
    : `<tr><td colspan="8" class="empty-state">No products found.</td></tr>`;

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editProduct(button.dataset.edit));
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteProduct(button.dataset.delete));
  });
}

function renderProductMasters() {
  const search = elements.searchMasters.value.trim().toLowerCase();
  const visibleMasters = productMasters.filter((master) =>
    `${master.productCode} ${master.name} ${master.brand} ${master.category}`.toLowerCase().includes(search)
  );

  elements.masterRows.innerHTML = visibleMasters.length
    ? visibleMasters.map((master) => {
      const stock = master.variants.reduce((total, variant) => total + number(variant.inventory?.onHand), 0);
      return `<tr>
        <td><strong>${escapeHtml(master.name)}</strong><br><small>${escapeHtml(master.productCode)}</small></td>
        <td>${escapeHtml(master.brand || "-")}</td>
        <td>${escapeHtml(master.category || "-")}</td>
        <td>${escapeHtml(master.productType)}</td>
        <td>${master.variants.length}</td>
        <td>${stock}</td>
        <td><button type="button" class="secondary-button" data-edit-master="${escapeHtml(master.productCode)}">Edit</button></td>
      </tr>`;
    }).join("")
    : `<tr><td colspan="7" class="empty-state">No product masters found.</td></tr>`;

  document.querySelectorAll("[data-edit-master]").forEach((button) => {
    button.addEventListener("click", () => editProductMaster(button.dataset.editMaster));
  });
}

function addVariantRow(variant = {}) {
  const price = variant.sellingPrices?.[0]?.price ?? "";
  const cost = variant.costs?.reduce((total, item) => total + number(item.amount), 0) || "";
  const inventory = variant.inventory || {};
  const row = document.createElement("div");
  row.className = "variant-row";
  row.innerHTML = `
    <label>Variant name<input data-field="variantName" required value="${escapeHtml(variant.variantName || "")}" placeholder="Cherry Red with Lens Film"></label>
    <label>SKU<input data-field="sku" required value="${escapeHtml(variant.sku || "")}" placeholder="IPHONE-HARD-RED"></label>
    <label>Stock<input data-field="onHand" type="number" min="0" step="1" value="${inventory.onHand ?? 0}"></label>
    <label>Reorder point<input data-field="reorderPoint" type="number" min="0" step="1" value="${inventory.reorderPoint ?? 0}"></label>
    <label>Cost (BDT)<input data-field="cost" type="number" min="0" step="0.01" value="${cost}"></label>
    <label>Price (BDT)<input data-field="price" type="number" min="0" step="0.01" value="${price}"></label>
    <label>Color / attribute<input data-field="color" value="${escapeHtml(variant.attributes?.color || "")}" placeholder="Cherry Red"></label>
    <button class="remove-variant" type="button" title="Remove variant" aria-label="Remove variant">×</button>
  `;
  row.querySelector(".remove-variant").addEventListener("click", () => {
    if (elements.variantRows.children.length > 1) row.remove();
  });
  elements.variantRows.append(row);
}

function readProductMasterForm() {
  const variants = [...elements.variantRows.children].map((row) => {
    const value = (field) => row.querySelector(`[data-field="${field}"]`).value.trim();
    const price = number(value("price"));
    return {
      sku: value("sku"),
      variantName: value("variantName"),
      attributes: { color: value("color") },
      barcode: "",
      unit: "piece",
      costs: [{ componentType: "purchase", name: "Base cost", amount: number(value("cost")), currency: "BDT" }],
      inventory: { onHand: Math.max(0, Math.round(number(value("onHand")))), reserved: 0, reorderPoint: Math.max(0, Math.round(number(value("reorderPoint")))) },
      sellingPrices: price > 0 ? [{ channel: "default", price, currency: "BDT" }] : []
    };
  });

  return {
    productCode: document.querySelector("#masterProductCode").value.trim(),
    name: document.querySelector("#masterName").value.trim(),
    brand: document.querySelector("#masterBrand").value.trim(),
    category: document.querySelector("#masterCategory").value.trim(),
    productType: document.querySelector("#masterProductType").value,
    description: document.querySelector("#masterDescription").value.trim(),
    status: "active",
    variants
  };
}

async function saveProductMasterFromForm(event) {
  event.preventDefault();
  const product = readProductMasterForm();
  const editingCode = document.querySelector("#masterEditingCode").value;
  const path = editingCode ? `/api/product-master/${encodeURIComponent(editingCode)}` : "/api/product-master";
  await apiRequest(path, { method: editingCode ? "PUT" : "POST", body: product });
  resetMasterForm();
  await loadState();
}

function editProductMaster(productCode) {
  const master = productMasters.find((item) => item.productCode === productCode);
  if (!master) return;
  document.querySelector("#masterEditingCode").value = master.productCode;
  document.querySelector("#masterProductCode").value = master.productCode;
  document.querySelector("#masterName").value = master.name;
  document.querySelector("#masterBrand").value = master.brand;
  document.querySelector("#masterCategory").value = master.category;
  document.querySelector("#masterProductType").value = master.productType;
  document.querySelector("#masterDescription").value = master.description;
  elements.variantRows.replaceChildren();
  master.variants.forEach(addVariantRow);
  switchView("product-master");
}

function resetMasterForm() {
  elements.productMasterForm.reset();
  document.querySelector("#masterEditingCode").value = "";
  elements.variantRows.replaceChildren();
  addVariantRow();
}

function readProductForm() {
  return {
    sku: fields.sku.value.trim(),
    name: fields.name.value.trim(),
    category: fields.category.value.trim(),
    cost: number(fields.cost.value),
    price: number(fields.price.value),
    competitor: number(fields.competitor.value),
    stock: Math.max(0, Math.round(number(fields.stock.value))),
    reorderPoint: Math.max(0, Math.round(number(fields.reorderPoint.value))),
    targetMargin: number(fields.targetMargin.value) || number(rules.defaultMargin)
  };
}

function editProduct(sku) {
  const product = products.find((item) => item.sku === sku);
  if (!product) return;

  Object.entries(product).forEach(([key, value]) => {
    if (fields[key]) fields[key].value = value;
  });
  fields.editingSku.value = product.sku;
  switchView("products");
  fields.name.focus();
}

async function deleteProduct(sku) {
  await apiRequest(`/api/products/${encodeURIComponent(sku)}`, { method: "DELETE" });
  await loadState();
}

function resetForm() {
  elements.productForm.reset();
  fields.editingSku.value = "";
}

async function saveRulesFromForm() {
  rules = {
    defaultMargin: number(ruleFields.defaultMargin.value),
    marketplaceFee: number(ruleFields.marketplaceFee.value),
    shippingCost: number(ruleFields.shippingCost.value),
    minimumProfit: number(ruleFields.minimumProfit.value),
    undercutPercent: number(ruleFields.undercutPercent.value),
    priceEnding: ruleFields.priceEnding.value
  };
  const response = await apiRequest("/api/pricing-rules", { method: "PUT", body: rules });
  rules = response.data;
  render();
}

async function applySuggestedPrice(sku) {
  const product = products.find((item) => item.sku === sku);
  if (!product) return;
  await apiRequest(`/api/products/${encodeURIComponent(sku)}`, { method: "PUT", body: { ...product, price: suggestedPrice(product) } });
  await loadState();
}

async function applyAllSuggestedPrices() {
  await Promise.all(products.map((product) => apiRequest(`/api/products/${encodeURIComponent(product.sku)}`, {
    method: "PUT",
    body: { ...product, price: suggestedPrice(product) }
  })));
  await loadState();
}

async function exportCsv() {
  const response = await fetch("/api/exports");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "inventory.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importCsv(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    await apiRequest("/api/imports", { method: "POST", body: { csv: String(reader.result) } });
    await loadState();
    event.target.value = "";
  };
  reader.readAsText(file);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines.shift() || "");
  return lines.map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce((row, header, index) => ({ ...row, [header]: cells[index] || "" }), {});
  });
}

function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (const char of line) {
    if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell);
  return cells;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function number(value) {
  return Number(value) || 0;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

addVariantRow();
loadState().catch((error) => {
  document.querySelector(".main").prepend(Object.assign(document.createElement("p"), {
    className: "empty-state",
    textContent: error.message
  }));
});
