/* =========================================================
   Agri-Fishery Cooperative Order and Inventory System
   ========================================================= */

/* ===== 1. Storage helpers ===== */
const STORAGE_KEYS = {
    products: "coop_products",
    orders: "coop_orders",
    orderCounter: "coop_order_counter"
  };
  
  // Read a list from localStorage. Returns [] if nothing is saved
  // or if the saved text is damaged.
  function loadList(key) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }
  
  // Save a list to localStorage as text.
  function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }
  
  function loadProducts() { return loadList(STORAGE_KEYS.products); }
  function saveProducts(list) { saveList(STORAGE_KEYS.products, list); }
  
  function loadOrders() { return loadList(STORAGE_KEYS.orders); }
  function saveOrders(list) { saveList(STORAGE_KEYS.orders, list); }
  
  // Gives ORD-0001, ORD-0002, ... and remembers the last number used,
  // so numbers are never reused even if an order is removed later.
  function getNextOrderNumber() {
    const last = Number(localStorage.getItem(STORAGE_KEYS.orderCounter)) || 0;
    const next = last + 1;
    localStorage.setItem(STORAGE_KEYS.orderCounter, String(next));
    return "ORD-" + String(next).padStart(4, "0");
  }
  
  /* ===== App state (loaded once when the page opens) ===== */
  let products = loadProducts();
  let orders = loadOrders();
  
  /* ===== 8. Rendering and event listeners (part 1: messages and views) ===== */
  const messageBox = document.getElementById("message");
  
  // type is "success" or "error". textContent is used (not innerHTML)
  // so user-typed text can never be run as HTML.
  function showMessage(text, type) {
    messageBox.innerHTML = "";
    const box = document.createElement("div");
    box.className = type;
    box.textContent = text;
    messageBox.appendChild(box);
  }
  
  function clearMessage() {
    messageBox.innerHTML = "";
  }
  
  // Which section belongs to which view name
  const VIEW_SECTIONS = {
    "products": "products-view",
    "orders": "orders-view",
    "order-detail": "order-detail-view",
    "report": "report-view"
  };
  
  function showView(viewName) {
    // Hide every section, then show only the chosen one
    Object.values(VIEW_SECTIONS).forEach(function (sectionId) {
      document.getElementById(sectionId).hidden = true;
    });
    document.getElementById(VIEW_SECTIONS[viewName]).hidden = false;
  
    // The detail page belongs under the Orders button
    const navName = viewName === "order-detail" ? "orders" : viewName;
    document.querySelectorAll("nav button").forEach(function (button) {
      button.classList.toggle("active", button.dataset.view === navName);
    });
  
    clearMessage();
  }
  
  document.querySelectorAll("nav button").forEach(function (button) {
    button.addEventListener("click", function () {
      showView(button.dataset.view);
    });
  });
  
  /* ===== Start ===== */
  showView("products");showMessage("Test success", "success");
  showMessage("Test error", "error");
  showView("order-detail");   // Orders button should be highlighted
  saveProducts([{ id: 1, name: "Test", category: "Crop", price: 10, stock: 5 }]);localStorage.setItem("coop_products", "not json");
  loadProducts();   // should return [] and not crash localStorage.clear();/* ===== 2. Validation functions ===== */
  const LOW_STOCK_LIMIT = 20;
  const MAX_NAME_LENGTH = 50;
  const MAX_NUMBER = 1000000;
  
  // Returns null if the product is valid.
  // Otherwise returns { field: "product-name", message: "..." }.
  // "raw" holds the text exactly as typed, so an empty box is not mistaken for 0.
  function validateProduct(raw, editingId) {
    const name = raw.name.trim();
  
    if (name === "") {
      return { field: "product-name", message: "Product name is required." };
    }
    if (name.length > MAX_NAME_LENGTH) {
      return { field: "product-name", message: "Product name must be " + MAX_NAME_LENGTH + " characters or less." };
    }
    // Must contain at least one letter, so values like "123" or "@@@" are rejected
    if (!/[A-Za-z]/.test(name)) {
      return { field: "product-name", message: "Product name must contain letters." };
    }
    // Only letters, numbers, spaces, and a few simple symbols
    if (!/^[A-Za-z0-9 .,'()-]+$/.test(name)) {
      return { field: "product-name", message: "Product name has invalid characters." };
    }
  
    const duplicate = products.some(function (p) {
      return p.name.toLowerCase() === name.toLowerCase() && p.id !== editingId;
    });
    if (duplicate) {
      return { field: "product-name", message: "A product named \"" + name + "\" already exists." };
    }
  
    if (raw.category !== "Crop" && raw.category !== "Fishery") {
      return { field: "product-category", message: "Please choose a category (Crop or Fishery)." };
    }
  
    if (raw.price.trim() === "") {
      return { field: "product-price", message: "Price per kg is required." };
    }
    const price = Number(raw.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { field: "product-price", message: "Price per kg must be greater than 0." };
    }
    if (price > MAX_NUMBER) {
      return { field: "product-price", message: "Price per kg is too large." };
    }
  
    if (raw.stock.trim() === "") {
      return { field: "product-stock", message: "Stock in kg is required." };
    }
    const stock = Number(raw.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      return { field: "product-stock", message: "Stock cannot be negative." };
    }
    if (stock > MAX_NUMBER) {
      return { field: "product-stock", message: "Stock is too large." };
    }
  
    return null;
  }
  
  function clearInvalidMarks() {
    document.querySelectorAll(".invalid").forEach(function (el) {
      el.classList.remove("invalid");
    });
  }
  /* ===== 3. Product functions ===== */
function findProduct(id) {
    return products.find(function (p) { return p.id === id; });
  }
  
  function isLowStock(product) {
    return product.stock < LOW_STOCK_LIMIT;
  }
  
  // A product used in any order cannot be deleted.
  // Orders do not exist yet, so this returns false until Step 5.
  function isProductInOrder(productId) {
    return orders.some(function (order) {
      return order.items.some(function (item) { return item.productId === productId; });
    });
  }
  
  function addProduct(data) {
    products.push({
      id: Date.now(),
      name: data.name.trim(),
      category: data.category,
      price: Number(data.price),
      stock: Number(data.stock)
    });
    saveProducts(products);
  }
  
  function updateProduct(id, data) {
    const product = findProduct(id);
    product.name = data.name.trim();
    product.category = data.category;
    product.price = Number(data.price);
    product.stock = Number(data.stock);
    saveProducts(products);
  }
  
  // Returns { ok: true } or { ok: false, message: "..." }
  function deleteProduct(id) {
    if (isProductInOrder(id)) {
      return { ok: false, message: "Cannot delete: this product is already in an order." };
    }
    products = products.filter(function (p) { return p.id !== id; });
    saveProducts(products);
    return { ok: true };
  }
  /* ===== 8. Rendering and event listeners (part 2: products) ===== */
const productForm = document.getElementById("product-form");
const productSubmit = document.getElementById("product-submit");
const productCancel = document.getElementById("product-cancel");
const productFilter = document.getElementById("product-filter");
const productTableBody = document.querySelector("#product-table tbody");

function formatMoney(amount) {
  return "₱" + amount.toFixed(2);
}

function renderProducts() {
  const category = productFilter.value;
  const shown = products.filter(function (p) {
    return category === "" || p.category === category;
  });

  productTableBody.innerHTML = "";

  if (shown.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No products to show.";
    row.appendChild(cell);
    productTableBody.appendChild(row);
    return;
  }

  shown.forEach(function (p) {
    const row = document.createElement("tr");
    if (isLowStock(p)) row.className = "row-low-stock";

    const nameCell = document.createElement("td");
    nameCell.textContent = p.name;

    const categoryCell = document.createElement("td");
    categoryCell.textContent = p.category;

    const priceCell = document.createElement("td");
    priceCell.textContent = formatMoney(p.price);

    const stockCell = document.createElement("td");
    stockCell.textContent = p.stock + " kg";
    if (isLowStock(p)) {
      const sign = document.createElement("span");
      sign.className = "low-stock";
      sign.textContent = "LOW STOCK";
      stockCell.appendChild(sign);
    }

    const actionCell = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function () { startEditProduct(p.id); });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "danger";
    deleteBtn.addEventListener("click", function () { handleDeleteProduct(p.id); });

    actionCell.appendChild(editBtn);
    actionCell.appendChild(deleteBtn);

    row.append(nameCell, categoryCell, priceCell, stockCell, actionCell);
    productTableBody.appendChild(row);
  });
}

function resetProductForm() {
  productForm.reset();
  document.getElementById("product-id").value = "";
  productSubmit.textContent = "Add Product";
  productCancel.hidden = true;
  clearInvalidMarks();
}

function startEditProduct(id) {
  const p = findProduct(id);
  document.getElementById("product-id").value = p.id;
  document.getElementById("product-name").value = p.name;
  document.getElementById("product-category").value = p.category;
  document.getElementById("product-price").value = p.price;
  document.getElementById("product-stock").value = p.stock;
  productSubmit.textContent = "Save Changes";
  productCancel.hidden = false;
  clearInvalidMarks();
  clearMessage();
  document.getElementById("product-name").focus();
}

function handleDeleteProduct(id) {
  const p = findProduct(id);
  if (!confirm("Delete \"" + p.name + "\"?")) return;

  const result = deleteProduct(id);
  if (result.ok) {
    // If the deleted product was being edited, clear the form
    if (document.getElementById("product-id").value === String(id)) resetProductForm();
    renderProducts();
    showMessage("Product \"" + p.name + "\" was deleted.", "success");
  } else {
    showMessage(result.message, "error");
  }
}

productForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearInvalidMarks();

  const idText = document.getElementById("product-id").value;
  const editingId = idText === "" ? null : Number(idText);

  const raw = {
    name: document.getElementById("product-name").value,
    category: document.getElementById("product-category").value,
    price: document.getElementById("product-price").value,
    stock: document.getElementById("product-stock").value
  };

  const problem = validateProduct(raw, editingId);
  if (problem) {
    const field = document.getElementById(problem.field);
    field.classList.add("invalid");
    field.focus();
    showMessage(problem.message, "error");
    return;
  }

  if (editingId === null) {
    addProduct(raw);
    showMessage("Product \"" + raw.name.trim() + "\" was added.", "success");
  } else {
    updateProduct(editingId, raw);
    showMessage("Product \"" + raw.name.trim() + "\" was updated.", "success");
  }

  resetProductForm();
  renderProducts();
});

productCancel.addEventListener("click", function () {
  resetProductForm();
  clearMessage();
});

productFilter.addEventListener("change", renderProducts);
/* ===== Start ===== */
resetProductForm();
renderProducts();
showView("products");