const tbody = document.getElementById("expense-list");
const emptyMessage = document.getElementById("empty-message");
const countBadge = document.getElementById("count");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter-category");
const toast = document.getElementById("toast");
const editForm = document.getElementById("edit-form");
const editModal = new bootstrap.Modal(document.getElementById("edit-modal"));

const SAMPLE = [
  { title: "Coffee", amount: 150, category: "Food", date: "2026-01-10" },
  { title: "Bus ticket", amount: 40, category: "Transport", date: "2026-01-11" },
  { title: "JavaScript book", amount: 1800, category: "Books", date: "2026-01-12" }
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function getExpenses() {
  try {
    const data = JSON.parse(localStorage.getItem("expenses"));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function updateStats(expenses) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  document.getElementById("stat-total").textContent = total + " Lek";
  document.getElementById("stat-count").textContent = expenses.length;
  document.getElementById("stat-average").textContent =
    (expenses.length ? Math.round(total / expenses.length) : 0) + " Lek";
  const biggest = expenses.reduce((max, e) => (!max || e.amount > max.amount ? e : max), null);
  document.getElementById("stat-biggest").textContent = biggest
    ? biggest.title + " (" + biggest.amount + " Lek)"
    : "none";
}

function cell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function render() {
  const all = getExpenses();
  updateStats(all);

  const term = searchInput.value.trim().toLowerCase();
  const category = filterSelect.value;
  const shown = all.filter(
    (e) => e.title.toLowerCase().includes(term) && (category === "" || e.category === category)
  );

  tbody.innerHTML = "";
  shown.forEach((e) => {
    const tr = document.createElement("tr");
    tr.appendChild(cell(e.date));
    tr.appendChild(cell(e.title));
    tr.appendChild(cell(e.category));
    tr.appendChild(cell(e.amount + " Lek", "text-end"));

    const actions = document.createElement("td");
    actions.className = "text-end";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-sm btn-outline-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEdit(e.id));
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-sm btn-outline-danger";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteExpense(e.id));
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    tr.appendChild(actions);
    tbody.appendChild(tr);
  });

  countBadge.textContent = shown.length;
  emptyMessage.classList.toggle("d-none", all.length > 0);
}

function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  saveExpenses(getExpenses().filter((e) => e.id !== id));
  render();
  showToast("Expense deleted");
}

function openEdit(id) {
  const expense = getExpenses().find((e) => e.id === id);
  if (!expense) return;
  document.getElementById("edit-id").value = expense.id;
  document.getElementById("edit-title").value = expense.title;
  document.getElementById("edit-amount").value = expense.amount;
  document.getElementById("edit-category").value = expense.category;
  document.getElementById("edit-date").value = expense.date;
  editForm.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  editModal.show();
}

function setError(field, message) {
  const input = editForm.elements[field];
  const box = editForm.querySelector('.error[data-for="' + field + '"]');
  input.classList.toggle("is-invalid", !!message);
  box.textContent = message || "";
}

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = Number(document.getElementById("edit-id").value);
  const updated = {
    title: editForm.elements.title.value.trim(),
    amount: Number(editForm.elements.amount.value),
    category: editForm.elements.category.value,
    date: editForm.elements.date.value
  };

  const errors = {
    title: updated.title === "" ? "Title is required." : "",
    amount: !(updated.amount >= 1) ? "Amount must be at least 1." : "",
    category: updated.category === "" ? "Please choose a category." : "",
    date: updated.date === "" ? "Date is required." : ""
  };
  let valid = true;
  for (const field in errors) {
    setError(field, errors[field]);
    if (errors[field]) valid = false;
  }
  if (!valid) return;

  const expenses = getExpenses().map((e) => (e.id === id ? Object.assign({}, e, updated) : e));
  saveExpenses(expenses);
  editModal.hide();
  render();
  showToast("Expense updated");
});

document.getElementById("load-sample").addEventListener("click", () => {
  const withIds = SAMPLE.map((e, i) => Object.assign({ id: Date.now() + i }, e));
  saveExpenses(getExpenses().concat(withIds));
  render();
});

document.getElementById("clear-all").addEventListener("click", () => {
  if (!confirm("Delete all expenses?")) return;
  saveExpenses([]);
  render();
  showToast("All expenses deleted");
});

searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);

setInterval(() => {
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = new Date().toLocaleTimeString();
}, 1000);

render();
