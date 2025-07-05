// --- USE FIREBASE FROM WINDOW ---
const { db, doc, setDoc, getDoc } = window._easycart_firestore;

// --- DATA VARIABLES ---
let products = {};
let dailyProductStats = {};
let customers = [];
let productList = [];
let totalAmount = 0;
let dailyReports = {};

// --- FIRESTORE LOAD ---
async function loadFromStorage() {
  products = {
    "Chips": { stock: 0, purchasePrice: 8, sellPrice: 10, sold: 0, profit: 0 },
    "Egg 1pc": { stock: 0, purchasePrice: 8, sellPrice: 10, sold: 0, profit: 0 },
    "Pen": { stock: 0, purchasePrice: 3, sellPrice: 5, sold: 0, profit: 0 },
    "Potato /kg": { stock: 0, purchasePrice: 18, sellPrice: 25, sold: 0, profit: 0 },
    "Rice-Miniket (per kg)": { stock: 0, purchasePrice: 60, sellPrice: 70, sold: 0, profit: 0 },
    "Rice-Nazirshail (per kg)": { stock: 0, purchasePrice: 65, sellPrice: 75, sold: 0, profit: 0 }
  };
  customers = [];
  dailyReports = {};
  dailyProductStats = {};

  try {
    let docSnap;

    docSnap = await getDoc(doc(db, "easycart", "products"));
    if (docSnap.exists()) products = docSnap.data().products || products;

    docSnap = await getDoc(doc(db, "easycart", "customers"));
    if (docSnap.exists()) customers = docSnap.data().customers || [];

    docSnap = await getDoc(doc(db, "easycart", "dailyReports"));
    if (docSnap.exists()) dailyReports = docSnap.data().dailyReports || {};

    docSnap = await getDoc(doc(db, "easycart", "dailyProductStats"));
    if (docSnap.exists()) dailyProductStats = docSnap.data().dailyProductStats || {};

    console.log("Loaded from Firestore");
  } catch (e) {
    console.error("Error loading from Firestore:", e);
  }

  updateProductDropdown();
  updateCustomerDropdown();
}

// --- FIRESTORE SAVE ---
async function saveToStorage() {
  try {
    await setDoc(doc(db, "easycart", "products"), { products });
    await setDoc(doc(db, "easycart", "customers"), { customers });
    await setDoc(doc(db, "easycart", "dailyReports"), { dailyReports });
    await setDoc(doc(db, "easycart", "dailyProductStats"), { dailyProductStats });
    console.log("Saved to Firestore");
  } catch (e) {
    console.error("Error saving to Firestore:", e);
    alert("❌ Failed to save data to Firestore!");
  }
}

// --- DOM READY ---
window.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();

  // Attach event listeners only if elements exist
  const productSelect = document.getElementById("product");
  if (productSelect) {
    productSelect.addEventListener("change", function () {
      const product = products[this.value];
      const priceInput = document.getElementById("price");
      if (priceInput) priceInput.value = product ? product.sellPrice : "";
    });
  }

  const customerInput = document.getElementById("customer");
  if (customerInput) {
    customerInput.addEventListener("input", function() {
      const name = this.value.trim();
      const btn = document.getElementById("saveCustomerBtn");
      if (btn) btn.style.display = (name && !customers.includes(name)) ? "inline-block" : "none";
    });
  }

  updateProductDropdown();
  updateCustomerDropdown();
});

// --- UI & LOGIC FUNCTIONS ---

function showProductChart() {
  const chartDiv = document.getElementById("productChart");
  const btn = document.querySelector('button[onclick="showProductChart()"]');
  if (chartDiv.style.display === "block") {
    chartDiv.style.display = "none";
    btn.innerText = "📦 Show Product Stock & Price";
    return;
  }
  let html = `<table style="width:100%;border-collapse:collapse;">
    <tr>
      <th style="border:1px solid #ccc;padding:6px;">Product</th>
      <th style="border:1px solid #ccc;padding:6px;">Stock</th>
      <th style="border:1px solid #ccc;padding:6px;">Sell Price (৳)</th>
    </tr>`;
  Object.entries(products).forEach(([name, p]) => {
    html += `<tr>
      <td style="border:1px solid #ccc;padding:6px;">${name}</td>
      <td style="border:1px solid #ccc;padding:6px;">${p.stock}</td>
      <td style="border:1px solid #ccc;padding:6px;">${p.sellPrice}</td>
    </tr>`;
  });
  html += `</table>`;
  chartDiv.innerHTML = html;
  chartDiv.style.display = "block";
  btn.innerText = "❌ Hide Product Stock & Price";
}

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section.style.display === "none" || section.style.display === "") {
    section.style.display = "block";
  } else {
    section.style.display = "none";
  }
}

function updateProductDropdown() {
  const productSelect = document.getElementById("product");
  const editSelect = document.getElementById("editProduct");
  if (productSelect) {
    productSelect.innerHTML = '<option disabled selected>Choose your product...</option>';
    Object.keys(products).sort().forEach(name => {
      productSelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
  }
  if (editSelect) {
    editSelect.innerHTML = '';
    Object.keys(products).sort().forEach(name => {
      editSelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
  }
  const stockSelect = document.getElementById("stockProduct");
  if (stockSelect) {
    stockSelect.innerHTML = '';
    Object.keys(products).sort().forEach(name => {
      stockSelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
  }
}

function saveTypedCustomer() {
  const name = document.getElementById("customer").value.trim();
  const btn = document.getElementById("saveCustomerBtn");
  if (!name) {
    alert("Please enter a customer name.");
    return;
  }
  if (customers.includes(name)) {
    alert("Customer already saved.");
    btn.style.display = "none";
    return;
  }
  customers.push(name);
  updateCustomerDropdown();
  saveToStorage().then(() => {
    alert("✅ Customer saved!");
    btn.style.display = "none";
  });
}

function updateCustomerDropdown() {
  // Update datalist for main customer input (for typing)
  const datalist = document.getElementById("customers");
  if (datalist) {
    datalist.innerHTML = '';
    customers.forEach(name => {
      datalist.innerHTML += `<option value="${name}">`;
    });
  }
  // Update dropdown for monthly bill (for selecting only)
  const monthlySelect = document.getElementById("monthlyCustomer");
  if (monthlySelect) {
    monthlySelect.innerHTML = '<option value="" disabled selected>Select customer...</option>';
    customers.forEach(name => {
      monthlySelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
  }
}

function addToList() {
  const name = document.getElementById("product").value;
  const qty = parseInt(document.getElementById("quantity").value);
  const date = document.getElementById("date").value;
  if (!name || !qty || qty <= 0) return;

  const product = products[name];
  if (!product) {
    alert("Product not found!");
    return;
  }

  if (qty > product.stock) {
    alert("Not enough stock!");
    return;
  }

  const price = product.sellPrice;
  const total = price * qty;
  productList.push({ name, price, qty, total });

  // Update product stock, sold, and profit
  product.stock -= qty;
  product.sold += qty;
  product.profit += (product.sellPrice - product.purchasePrice) * qty;

  // --- Update daily product stats ---
  if (!dailyProductStats[date]) dailyProductStats[date] = {};
  if (!dailyProductStats[date][name]) dailyProductStats[date][name] = { sold: 0, profit: 0 };
  dailyProductStats[date][name].sold += qty;
  dailyProductStats[date][name].profit += (product.sellPrice - product.purchasePrice) * qty;

  saveToStorage();

  // Update product list UI
  const list = document.getElementById("productList");
  if (list) {
    list.innerHTML = '';
    totalAmount = 0;
    productList.forEach((p, i) => {
      list.innerHTML += `<li>${p.name}, price: ${p.price}৳, qty: ${p.qty}, total: ${p.total}৳</li>`;
      totalAmount += p.total;
    });
  }

  document.getElementById("total").innerText = `💵 Total Amount: ৳${totalAmount}`;
  calculateChange();
}

function calculateChange() {
  const cash = parseInt(document.getElementById("cash").value) || 0;
  const change = cash - totalAmount;
  document.getElementById("change").innerText = `🔁 Change: ৳${change}`;
}

function toggleViewReport(btn) {
  const reportDiv = document.getElementById("viewReport");
  if (reportDiv.style.display === "block") {
    reportDiv.style.display = "none";
    btn.innerText = "📋 View & 💾Save Report";
  } else {
    viewAndSaveReport(); // This will update the report content
    reportDiv.style.display = "block";
    btn.innerText = "❌ Hide Report";
  }
}

function viewAndSaveReport() {
  const date = document.getElementById("date").value;
  const name = document.getElementById("customer").value;
  const cash = document.getElementById("cash").value;

  if (!date || !name || productList.length === 0) {
    alert("Please fill all receipt fields and add at least one product.");
    return;
  }

  let report = `📅 Date: ${date}\n👤 Customer Name: ${name}\n📦 Product list:\n`;
  productList.forEach((p, i) => {
    report += `${i + 1}. ${p.name}, price: ${p.price}৳, qty: ${p.qty}, total: ${p.total}৳\n`;
  });
  report += `\n💵 Total Amount: ${totalAmount}৳ | 💳 Cash: ${cash}৳ | 🔁 Change: ${cash - totalAmount}৳`;

  document.getElementById("viewReport").innerText = report;

  if (!dailyReports[date]) dailyReports[date] = [];
  dailyReports[date].push(report);
  saveToStorage();
  alert("✅ Report saved!"); 
  productList = [];
  document.getElementById("productList").innerHTML = '';
  totalAmount = 0;
  document.getElementById("total").innerText = `💵 Total Amount: ৳0`;
  calculateChange();
}

function toggleDailyReport(btn) {
  const dailyDiv = document.getElementById("dailyReports");
  if (dailyDiv.style.display === "block") {
    dailyDiv.style.display = "none";
    btn.innerText = "📊 View Daily Report";
  } else {
    loadDailyReports(); // This will update the daily report content
    dailyDiv.style.display = "block";
    btn.innerText = "❌ Hide Daily Report";
  }
}

function loadDailyReports() {
  const date = document.getElementById("dailyDate").value;
  const container = document.getElementById("dailyReports");
  const reports = dailyReports[date] || [];

  let totalSell = 0;
  reports.forEach(r => {
    const match = r.match(/Total Amount: (\d+)/);
    if (match) totalSell += parseInt(match[1]);
  });

  let summary = `<b>Total transaction: ${reports.length}</b>\n<b>Total sell: ${totalSell}৳</b>\n\n`;
  container.innerText = summary + reports.join("\n\n");
}

function copyReport() {
  let text = document.getElementById("viewReport").innerText;
  if (!text) return alert("No report to copy.");
  // Add shop name only to the copied text
  text = "জননী জেনারেল ষ্টোর\n\n" + text;
  navigator.clipboard.writeText(text)
    .then(() => alert("Report copied! You can now paste it in WhatsApp or anywhere."))
    .catch(() => alert("Failed to copy. Please copy manually."));
}

function sendViaWhatsApp() {
  const text = document.getElementById("viewReport").innerText;
  if (!text) return alert("No report to send.");

  // Use Web Share API if available
  if (navigator.share) {
    navigator.share({
      text: text
    }).catch((err) => {
      // User cancelled or error
      alert("Sharing cancelled or failed.");
    });
  } else {
    // Fallback to WhatsApp link
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
    alert("If sharing did not work, please open in Chrome or copy the message manually.");
  }
}

function toggleProductReport(btn) {
  const date = document.getElementById("reportDate").value;
  if (!date) {
    alert("Please select a date to view the product report.");
    return;
  }
  const prodDiv = document.getElementById("productReport");
  if (prodDiv.style.display === "block") {
    prodDiv.style.display = "none";
    btn.innerText = "Show Product Report";
  } else {
    showProductReportByDate(); // Show report for the selected date
    prodDiv.style.display = "block";
    btn.innerText = "❌ Hide Product Report";
  }
}

function showProductReportByDate() {
  const date = document.getElementById("reportDate").value;
  const stats = dailyProductStats[date] || {};
  let totalProfit = 0;
  let html = `<table style="width:100%;border-collapse:collapse;">
    <tr>
      <th style="border:1px solid #ccc;padding:6px;text-align:center;">Product</th>
      <th style="border:1px solid #ccc;padding:6px;text-align:center;">Stock</th>
      <th style="border:1px solid #ccc;padding:6px;text-align:center;">Purchase Price (৳)</th>
      <th style="border:1px solid #ccc;padding:6px;text-align:center;">Sell Price (৳)</th>
      <th style="border:1px solid #ccc;padding:6px;text-align:center;">Incoming</th>
      <th style="border:1px solid #ccc;padding:6px;text-align:center;">Sold</th>
      <th style="border:1px solid #ccc;padding:6px;text-align:center;">Profit (৳)</th>
    </tr>`;
  Object.entries(products).forEach(([name, p]) => {
    const s = stats[name] || { sold: 0, profit: 0, incoming: 0 };
    totalProfit += s.profit;
    html += `<tr>
      <td style="border:1px solid #ccc;padding:6px;text-align:left;">${name}</td>
      <td style="border:1px solid #ccc;padding:6px;text-align:center;">${p.stock}</td>
      <td style="border:1px solid #ccc;padding:6px;text-align:center;">${p.purchasePrice}</td>
      <td style="border:1px solid #ccc;padding:6px;text-align:center;">${p.sellPrice}</td>
      <td style="border:1px solid #ccc;padding:6px;text-align:center;">${s.incoming || 0}</td>
      <td style="border:1px solid #ccc;padding:6px;text-align:center;">${s.sold}</td>
      <td style="border:1px solid #ccc;padding:6px;text-align:center;">${s.profit}</td>
    </tr>`;
  });
  // Add total profit row
  html += `<tr>
    <td colspan="6" style="border:1px solid #ccc;padding:6px;text-align:right;font-weight:bold;">Total Profit (৳)</td>
    <td style="border:1px solid #ccc;padding:6px;text-align:center;font-weight:bold;">${totalProfit}</td>
  </tr>`;
  html += `</table>`;
  document.getElementById("productReport").innerHTML = html;
}

function onReportDateChange() {
  const date = document.getElementById("reportDate").value;
  const btn = document.getElementById("showProductReportBtn");
  // Also hide the report if date is cleared
  if (!date) {
    document.getElementById("productReport").style.display = "none";
    btn.innerText = "Show Product Report";
  }
}

function addNewProduct() {
  const name = document.getElementById("newProduct").value.trim();
  const purchasePrice = parseInt(document.getElementById("newPurchasePrice").value);
  const sellPrice = parseInt(document.getElementById("newSellPrice").value);

  if (name && purchasePrice > 0 && sellPrice > 0) {
    products[name] = {
      stock: 0,
      purchasePrice: purchasePrice,
      sellPrice: sellPrice,
      sold: 0,
      profit: 0
    };
    saveToStorage();
    updateProductDropdown();
    updateCustomerDropdown();
    alert("✅Product added!");

    // Clear the input fields after saving
    document.getElementById("newProduct").value = '';
    document.getElementById("newPurchasePrice").value = '';
    document.getElementById("newSellPrice").value = '';
  } else {
    alert("❌Please fill all product fields correctly.");
  }
}

function addStock() {
  const name = document.getElementById("stockProduct").value;
  const date = document.getElementById("stockDate").value;
  const amount = parseInt(document.getElementById("stockAmount").value);

  if (!name || !date || !amount || amount <= 0) {
    alert("❌ Please select product, date, and enter a valid stock amount.");
    return;
  }

  // Update product stock
  products[name].stock += amount;

  // Track incoming stock by date (optional, for advanced tracking)
  if (!dailyProductStats[date]) dailyProductStats[date] = {};
  if (!dailyProductStats[date][name]) dailyProductStats[date][name] = { sold: 0, profit: 0, incoming: 0 };
  dailyProductStats[date][name].incoming = (dailyProductStats[date][name].incoming || 0) + amount;

  saveToStorage();
  updateProductDropdown();
  alert(`✅ Added ${amount} to ${name} on ${date}!`);
  document.getElementById("stockAmount").value = '';
}

function editProductPurchasePrice() {
  const name = document.getElementById("editProduct").value;
  const price = parseInt(document.getElementById("editPurchasePrice").value);
  if (name && price > 0 && products[name]) {
    products[name].purchasePrice = price;
    saveToStorage();
    alert("✅ Purchase price updated!");
    document.getElementById("editPurchasePrice").value = '';
  } else {
    alert("❌ Please choose a product and enter a valid purchase price.");
  }
}

function editProductSellPrice() {
  const name = document.getElementById("editProduct").value;
  const price = parseInt(document.getElementById("editSellPrice").value);
  if (name && price > 0 && products[name]) {
    products[name].sellPrice = price;
    updateProductDropdown();
    saveToStorage();
    alert("✅ Sell price updated!");
    document.getElementById("editSellPrice").value = '';
  } else {
    alert("❌ Please choose a product and enter a valid sell price.");
  }
}

function toggleMonthlyBill(btn) {
  const billDiv = document.getElementById("monthlyBill");
  const copyBtn = document.getElementById("copyMonthlyBillBtn");
  const customer = document.getElementById("monthlyCustomer").value;
  const month = document.getElementById("monthlyMonth").value;

  if (billDiv.style.display === "block") {
    billDiv.style.display = "none";
    copyBtn.style.display = "none";
    btn.innerText = "📄 View Monthly Bill";
  } else {
    if (!customer || !month) {
      alert("Please select customer and month.");
      billDiv.style.display = "none";
      copyBtn.style.display = "none";
      return;
    }
    showMonthlyBill();
    billDiv.style.display = "block";
    copyBtn.style.display = "inline-block";
    btn.innerText = "❌ Hide Monthly Bill";
  }
}

function showMonthlyBill() {
  const customer = document.getElementById("monthlyCustomer").value;
  const month = document.getElementById("monthlyMonth").value; // format: "2025-05"
  const billDiv = document.getElementById("monthlyBill");
  const copyBtn = document.getElementById("copyMonthlyBillBtn");
  const msg = document.getElementById("customerSelectMsg");

  if (!customer || !month) {
    msg.style.display = "inline";
    alert("Please select customer and month.");
    billDiv.style.display = "none";
    copyBtn.style.display = "none";
    return;
  } else {
    msg.style.display = "none";
  }

  let report = `🗓️ Monthly Bill for <b>${customer}</b> (${month})<br><br>`;
  let total = 0;
  let found = false;

  // Loop through all days in the selected month
  Object.keys(dailyReports).forEach(date => {
    if (date.startsWith(month)) {
      const reports = dailyReports[date] || [];
      reports.forEach(r => {
        if (r.includes(customer)) {
          found = true;
          report += `<div style="margin-bottom:10px;border-bottom:1px solid #ccc;padding-bottom:5px;">${r.replace(/\n/g, "<br>")}</div>`;
          const match = r.match(/Total Amount: (\d+)/);
          if (match) total += parseInt(match[1]);
        }
      });
    }
  });

  if (!found) {
    report += "<i>No transactions found for this customer in this month.</i>";
  } else {
    report += `<b style="font-size:1.1em;">Total Bill for ${customer}: ৳${total}</b>`;
  }

  billDiv.innerHTML = report;
  billDiv.style.display = "block";
  copyBtn.style.display = "inline-block";
}

function copyMonthlyBill() {
  let text = document.getElementById("monthlyBill").innerText;
  if (!text) return alert("No bill to copy.");
  // Add shop name only to the copied text
  text = "জননী জেনারেল ষ্টোর\n\n" + text;
  navigator.clipboard.writeText(text)
    .then(() => alert("Monthly bill copied!"))
    .catch(() => alert("Failed to copy. Please copy manually."));
}