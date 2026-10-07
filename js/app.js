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
  loadProducts();   // should return [] and not crash localStorage.clear();