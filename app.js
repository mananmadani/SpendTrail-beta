// Tabs & Page Initialization
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

// Local Storage Data
function getData() {
  return JSON.parse(localStorage.getItem('SpendTrail-data') || '{"income":[],"expenses":[]}');
}
function setData(data) {
  localStorage.setItem('SpendTrail-data', JSON.stringify(data));
}

// Update Balance Display
function updateBalance() {
  const data = getData();
  const totalIncome = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  document.getElementById('total-income').textContent = `₹${totalIncome.toFixed(2)}`;
  document.getElementById('total-expense').textContent = `₹${totalExpenses.toFixed(2)}`;
  document.getElementById('current-balance').textContent = `₹${(totalIncome - totalExpenses).toFixed(2)}`;
}

function updateSummary() {
  const data = getData();
  const today = new Date().toISOString().split('T')[0];
  const todayIncome = data.income.filter(i => i.date === today).reduce((sum, i) => sum + Number(i.amount), 0);
  const todayExpense = data.expenses.filter(e => e.date === today).reduce((sum, e) => sum + Number(e.amount), 0);
  if (document.getElementById('today-income')) document.getElementById('today-income').textContent = `₹${todayIncome.toFixed(2)}`;
  if (document.getElementById('today-expense')) document.getElementById('today-expense').textContent = `₹${todayExpense.toFixed(2)}`;
}

// Recent Entries Rendering: All entries combined and sorted by datetime desc (latest first)
function renderRecentList() {
  const data = getData();
  let all = data.income.map(e => ({...e, type: 'Income'}))
            .concat(data.expenses.map(e => ({...e, type: 'Expense'})));
  all.sort((a, b) => new Date(b.date) - new Date(a.date));
  const shown = all.slice(0, 5);
  const container = document.getElementById('recent-list');
  container.innerHTML = "";
  shown.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `${item.type} | ${item.category} | ₹${item.amount} | ${item.date}${item.note?.trim() ? ' | ' + item.note : ''}`;
    container.appendChild(li);
  });
}

// Income List Rendering with optional search filter
function renderIncomeList(filter="") {
  const data = getData();
  const list = document.getElementById('income-list');
  list.innerHTML = "";
  [...data.income]
    .map((item, idx) => ({ ...item, originalIndex: idx }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(item => {
      if (!filter || item.category.toLowerCase().includes(filter) || (item.note && item.note.toLowerCase().includes(filter))) {
        const li = document.createElement('li');
        li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note||''}
Edit
Delete`;
        list.appendChild(li);
      }
    });
}

// Expense List Rendering with optional search filter
function renderExpenseList(filter="") {
  const data = getData();
  const list = document.getElementById('expense-list');
  list.innerHTML = "";
  [...data.expenses]
    .map((item, idx) => ({ ...item, originalIndex: idx }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(item => {
      if (!filter || item.category.toLowerCase().includes(filter) || (item.note && item.note.toLowerCase().includes(filter))) {
        const li = document.createElement('li');
        li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note||''}
Edit
Delete`;
        list.appendChild(li);
      }
    });
}

// Deleting an entry by type and index
window.deleteEntry = function(type, idx) {
  const data = getData();
  data[type].splice(idx, 1);
  setData(data);
  renderIncomeList(document.getElementById('search-income')?.value || "");
  renderExpenseList(document.getElementById('search-expense')?.value || "");
  updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
  if (window.navigator.vibrate) window.navigator.vibrate(100);
};

// Edit entry modal open
window.editEntry = function(type, idx) {
  const data = getData();
  const entry = data[type][idx];
  document.getElementById('edit-amount').value = entry.amount;
  document.getElementById('edit-category').value = entry.category;
  document.getElementById('edit-date').value = entry.date;
  document.getElementById('edit-note').value = entry.note || '';
  document.getElementById('edit-type').value = type;
  document.getElementById('edit-idx').value = idx;
  document.getElementById('edit-modal').style.display = 'flex';
};

// Edit form submission handler
document.getElementById('edit-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const amount = document.getElementById('edit-amount').value;
  const category = document.getElementById('edit-category').value.trim();
  const date = document.getElementById('edit-date').value;
  const note = document.getElementById('edit-note').value;
  const type = document.getElementById('edit-type').value;
  const idx = document.getElementById('edit-idx').value;
  if (!amount || !category || !date) return;
  const data = getData();
  data[type][idx] = { amount, category, date, note };
  setData(data);
  document.getElementById('edit-modal').style.display = 'none';
  renderIncomeList(document.getElementById('search-income')?.value || "");
  renderExpenseList(document.getElementById('search-expense')?.value || "");
  updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
  if (window.navigator.vibrate) window.navigator.vibrate(22);
});

// Close edit modal handlers
document.getElementById('close-edit-modal').addEventListener('click', function() {
  document.getElementById('edit-modal').style.display = 'none';
});
document.getElementById('edit-modal').addEventListener('click', function(e){
  if(e.target.id==='edit-modal') document.getElementById('edit-modal').style.display = 'none';
});

// Income form submission
document.getElementById('income-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const amount = document.getElementById('income-amount').value;
  const category = document.getElementById('income-category').value.trim();
  const date = document.getElementById('income-date').value;
  const note = document.getElementById('income-note').value;
  if (!amount || !category || !date) return;
  const data = getData();
  data.income.push({ amount, category, date, note });
  setData(data);
  this.reset();
  renderIncomeList(); updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
  if (window.navigator.vibrate) window.navigator.vibrate(22);
});

// Expense form submission
document.getElementById('expense-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const amount = document.getElementById('expense-amount').value;
  const category = document.getElementById('expense-category').value.trim();
  const date = document.getElementById('expense-date').value;
  const note = document.getElementById('expense-note').value;
  if (!amount || !category || !date) return;
  const data = getData();
  data.expenses.push({ amount, category, date, note });
  setData(data);
  this.reset();
  renderExpenseList(); updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
  if (window.navigator.vibrate) window.navigator.vibrate(22);
});

// Search filters by typing
document.getElementById('search-income').addEventListener('input', function() {
  renderIncomeList(this.value.toLowerCase());
});
document.getElementById('search-expense').addEventListener('input', function() {
  renderExpenseList(this.value.toLowerCase());
});

// Export PDF of all entries
document.getElementById('export-pdf-btn').addEventListener('click', function() {
  const data = getData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(18);
  doc.text('SpendTrail Report', 10, y); y += 8;
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, y); y += 8;
  doc.setFont(undefined, 'bold');
  doc.text('Income:', 10, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  data.income.forEach(i => {
    doc.text(`₹${i.amount} | ${i.category} | ${i.date} | ${i.note||''}`, 12, y);
    y += 6;
  });
  y += 6;
  doc.setFont(undefined, 'bold');
  doc.text('Expense:', 10, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  data.expenses.forEach(e => {
    doc.text(`₹${e.amount} | ${e.category} | ${e.date} | ${e.note||''}`, 12, y);
    y += 6;
  });
  y += 8;
  doc.save('SpendTrail-report.pdf');
  if (window.navigator.vibrate) window.navigator.vibrate(50);
});

// Delete all data handler
document.getElementById('delete-all-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
    localStorage.removeItem('SpendTrail-data');
    renderIncomeList(); renderExpenseList();
    updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(100);
  }
});

// Autocomplete categories
function updateAutocompletes() {
  const data = getData();
  const incList = document.getElementById('inc-category-list');
  incList.innerHTML = '';
  [...new Set(data.income.map(e => (e.category || '').trim()).filter(x => !!x))]
    .forEach(cat => incList.innerHTML += `<option value="${cat}"></option>`);
  const expList = document.getElementById('exp-category-list');
  expList.innerHTML = '';
  [...new Set(data.expenses.map(e => (e.category || '').trim()).filter(x => !!x))]
    .forEach(cat => expList.innerHTML += `<option value="${cat}"></option>`);
}

// Filter entries by date range for statements
function filterEntriesByDate(startDate, endDate) {
  const data = getData();
  const start = new Date(startDate);
  const end = new Date(endDate);
  let all = data.income.map(e => ({ ...e, type: 'Income' }))
             .concat(data.expenses.map(e => ({ ...e, type: 'Expense' })));
  all = all.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
  return all.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Statement list generation
document.getElementById('generate-statement-btn').addEventListener('click', function() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  if (!startDate || !endDate) return;
  const filtered = filterEntriesByDate(startDate, endDate);
  const list = document.getElementById('statement-list');
  list.innerHTML = '';
  if (filtered.length === 0) {
    list.innerHTML = 'No entries in this range.';
  } else {
    filtered.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `${item.type} | ₹${item.amount} | ${item.category} | ${item.date}` +
        (item.note?.trim() ? ` | ${item.note}` : '');
      list.appendChild(li);
    });
  }
  if (window.navigator.vibrate) window.navigator.vibrate(22);
});

// Export statement PDF by date range
document.getElementById('export-statement-pdf-btn').addEventListener('click', function() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  if (!startDate || !endDate) return;
  const filtered = filterEntriesByDate(startDate, endDate);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(18);
  doc.text('SpendTrail Statement', 10, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(`Date Range: ${startDate} to ${endDate}`, 10, y);
  y += 8;
  doc.setFontSize(10);
  filtered.forEach(item => {
    let line = `${item.type} | ₹${item.amount} | ${item.category} | ${item.date}` +
      (item.note?.trim() ? ` | ${item.note}` : "");
    doc.text(line, 10, y);
    y += 6;
  });
  doc.save('SpendTrail-statement.pdf');
  if (window.navigator.vibrate) window.navigator.vibrate(50);
});

// Initialization Function
function initialize() {
  renderIncomeList();
  renderExpenseList();
  updateBalance();
  updateSummary();
  renderRecentList();
  updateAutocompletes();
}
initialize();

// UI Controls

document.getElementById('menu-btn').onclick = function() {
  document.getElementById('side-menu').style.display = 'block';
  document.getElementById('menu-overlay').style.display = 'block';
  if (window.navigator.vibrate) window.navigator.vibrate(20);
};

function closeMenu() {
  document.getElementById('side-menu').style.display = 'none';
  document.getElementById('menu-overlay').style.display = 'none';
}

function showPrivacyPolicy() {
  closeMenu();
  document.getElementById('page-content').innerHTML = `
    <h2>Privacy Policy</h2>
    <p><strong>Data Privacy:</strong><br>SpendTrail keeps your financial data private. All your entries are stored only on your device with your browser’s local storage.</p>
    <p><strong>Permissions:</strong><br>This app does not use your contacts, location, camera, or personal info. No information about you or your device is shared.</p>
    <p><strong>Removing Data:</strong><br>If you delete the app or clear your browser storage, records will be erased.</p>
    <p><strong>Updates:</strong><br>This policy will be updated with app changes.</p>
    <p>Contact support with questions.</p>
  `;
  document.getElementById('page-view').style.display = 'block';
}

// More functions (ledger, etc.) can be added here as needed.
