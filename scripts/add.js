const form = document.getElementById("expense-form");
const recentCard = document.getElementById("recent");
const recentList = document.getElementById("recent-list");
const toast = document.getElementById("toast");

document.getElementById("date").valueAsDate = new Date();

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

function setError(field, message) {
  const input = form.elements[field];
  const box = form.querySelector('.error[data-for="' + field + '"]');
  input.classList.toggle("is-invalid", !!message);
  box.textContent = message || "";
}

function validate(expense) {
  let valid = true;
  const rules = {
    title: expense.title.trim() === "" ? "Title is required." : "",
    amount: !(Number(expense.amount) >= 1) ? "Amount must be at least 1." : "",
    category: expense.category === "" ? "Please choose a category." : "",
    date: expense.date === "" ? "Date is required." : ""
  };
  for (const field in rules) {
    setError(field, rules[field]);
    if (rules[field]) valid = false;
  }
  return valid;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const expense = {
    id: Date.now(),
    title: form.elements.title.value.trim(),
    amount: Number(form.elements.amount.value),
    category: form.elements.category.value,
    date: form.elements.date.value
  };

  if (!validate(expense)) return;

  const expenses = getExpenses();
  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between";
  li.textContent = expense.date + " - " + expense.title + " (" + expense.category + ")";
  const amount = document.createElement("strong");
  amount.textContent = expense.amount + " Lek";
  li.appendChild(amount);
  recentList.prepend(li);
  recentCard.classList.remove("d-none");

  form.reset();
  document.getElementById("date").valueAsDate = new Date();
  showToast("Expense added");
});

setInterval(() => {
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = new Date().toLocaleTimeString();
}, 1000);
