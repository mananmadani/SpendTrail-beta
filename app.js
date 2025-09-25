const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

function activateTab(name) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  contents.forEach(c => c.classList.toggle('active', c.id === 'tab-' + name));
  if (window.navigator.vibrate) window.navigator.vibrate(22);
}

tabs.forEach(btn => {
  btn.addEventListener('click', e => {
    activateTab(e.target.dataset.tab);
    if (e.target.dataset.tab === "overview") {
      updateBalance();
      updateSummary();
      renderRecentList();
      updateAutocompletes();
    } else if (e.target.dataset.tab === "income") {
      renderIncomeList(document.getElementById('search-income')?.value || "");
    } else if (e.target.dataset.tab === "expense") {
      renderExpenseList(document.getElementById('search-expense')?.value || "");
    }
  });
});

function getData() { 
  return JSON.parse(localStorage.getItem('SpendTrail-data') || '{"income":[],"expenses":[]}'); 
}

function setData(data) { 
  localStorage.setItem('SpendTrail-data', JSON.stringify(data)); 
}

function updateBalance() {
  const data = getData();
  const totalIncome = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  document.getElementById('total-income').textContent = "₹" + totalIncome;
  document.getElementById('total-expense').textContent = "₹" + totalExpenses;
  document.getElementById('current-balance').textContent = "₹" + (totalIncome - totalExpenses);
                                             }
function updateSummary() {
  // Example summary function. Adapt as needed for your app.
  const data = getData();
  const today = new Date().toISOString().split('T')[0];
  const todayIncome = data.income.filter(i => i.date === today).reduce((sum, i) => sum + Number(i.amount), 0);
  const todayExpense = data.expenses.filter(e => e.date === today).reduce((sum, e) => sum + Number(e.amount), 0);
  document.getElementById('today-income').textContent = "₹" + todayIncome;
  document.getElementById('today-expense').textContent = "₹" + todayExpense;
}

function renderRecentList() {
  const data = getData();
  let all = data.income.map(e => ({...e, type: 'Income'}))
              .concat(data.expenses.map(e => ({...e, type: 'Expense'})));
  all.sort((a, b) => new Date(b.date) - new Date(a.date));
  const shown = all.slice(0, 5);

  const container = document.getElementById('recent-entries');
  container.innerHTML = "";
  shown.forEach(item => {
    const li = document.createElement('div');
    li.className = "recent-entry";
    li.innerHTML = `<span class="${item.type === 'Income' ? 'income' : 'expense'}">${item.type}</span> | ${item.category} | ₹${item.amount} | ${item.date} ${item.note || ''}`;
    container.appendChild(li);
  });
      }
function filterEntriesByDate(entries, from, to) {
  // Filters entries for statement export or custom views
  let all = entries.filter(item => {
    let itemDate = new Date(item.date);
    return (!from || itemDate >= new Date(from)) && (!to || itemDate <= new Date(to));
  });
  // Sort by most recent first, true reverse chron order
  return all.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Example export statement renderer (adapt to your UI)
function renderStatement(from, to) {
  const data = getData();
  let all = data.income.concat(data.expenses);
  let filtered = filterEntriesByDate(all, from, to);
  const container = document.getElementById('statement-list');
  container.innerHTML = "";
  filtered.forEach(item => {
    const li = document.createElement('div');
    li.className = "statement-entry";
    li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} ${item.note || ''}`;
    container.appendChild(li);
  });
      }
function renderIncomeList(searchTerm = "") {
  const data = getData();
  const list = document.getElementById('income-list');
  list.innerHTML = "";

  let filtered = data.income.filter(item =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  filtered.forEach(item => {
    const li = document.createElement('div');
    li.className = "income-entry";
    li.innerHTML = `<span class="income">Income</span> | ${item.category} | ₹${item.amount} | ${item.date} ${item.note || ''}`;
    list.appendChild(li);
  });
}

function renderExpenseList(searchTerm = "") {
  const data = getData();
  const list = document.getElementById('expense-list');
  list.innerHTML = "";

  let filtered = data.expenses.filter(item =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  filtered.forEach(item => {
    const li = document.createElement('div');
    li.className = "expense-entry";
    li.innerHTML = `<span class="expense">Expense</span> | ${item.category} | ₹${item.amount} | ${item.date} ${item.note || ''}`;
    list.appendChild(li);
  });
}
function renderIncomeList(searchTerm = "") {
  const data = getData();
  const list = document.getElementById('income-list');
  list.innerHTML = "";
  let filtered = data.income.filter(item =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  filtered.forEach(item => {
    const li = document.createElement('div');
    li.className = "income-entry";
    li.innerHTML = `<span class="income">Income</span> | ${item.category} | ₹${item.amount} | ${item.date} ${item.note || ''}`;
    list.appendChild(li);
  });
}

function renderExpenseList(searchTerm = "") {
  const data = getData();
  const list = document.getElementById('expense-list');
  list.innerHTML = "";
  let filtered = data.expenses.filter(item =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  filtered.forEach(item => {
    const li = document.createElement('div');
    li.className = "expense-entry";
    li.innerHTML = `<span class="expense">Expense</span> | ${item.category} | ₹${item.amount} | ${item.date} ${item.note || ''}`;
    list.appendChild(li);
  });
}
// Add new income entry
function addIncome(category, amount, date, note = "") {
  const data = getData();
  data.income.push({ category, amount, date, note });
  setData(data);
  updateBalance();
  renderIncomeList();
  renderRecentList();
}

// Add new expense entry
function addExpense(category, amount, date, note = "") {
  const data = getData();
  data.expenses.push({ category, amount, date, note });
  setData(data);
  updateBalance();
  renderExpenseList();
  renderRecentList();
}

// Delete entry by type and index
function deleteEntry(type, index) {
  const data = getData();
  if (type === "income") {
    data.income.splice(index, 1);
    renderIncomeList();
  } else {
    data.expenses.splice(index, 1);
    renderExpenseList();
  }
  setData(data);
  updateBalance();
  renderRecentList();
}

// Autocomplete for categories
function updateAutocompletes() {
  // Suggest categories for income/expense in forms (example stub)
  // Add your logic if needed
}

// Utility to clear input fields
function clearInputs() {
  let inputs = document.querySelectorAll('input');
  inputs.forEach(input => input.value = "");
}

// Initial Load
updateBalance();
updateSummary();
renderIncomeList();
renderExpenseList();
renderRecentList();
updateAutocompletes();
