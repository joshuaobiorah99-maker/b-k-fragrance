const form = document.getElementById("scentForm");
const status = document.getElementById("formStatus");
const summaryNotes = document.getElementById("summaryNotes");
const summaryOccasion = document.getElementById("summaryOccasion");
const summarySize = document.getElementById("summarySize");
const phone = document.getElementById("phone");

const PHONE_KEY = "bk-phone-numbers";

// Update the scent brief as the visitor makes choices.
function updateSummary() {
  const notes = [...form.querySelectorAll('input[name="notes"]:checked')].map((n) => n.value);
  const occasion = form.querySelector('input[name="occasion"]:checked');
  const size = form.querySelector('input[name="size"]:checked');

  summaryNotes.innerHTML = `<strong>Notes:</strong> ${notes.length ? notes.join(", ") : "none selected"}`;
  summaryOccasion.innerHTML = `<strong>Occasion:</strong> ${occasion ? occasion.value : "not selected"}`;
  summarySize.innerHTML = `<strong>Size:</strong> ${size ? size.value : "not selected"}`;
}

form.addEventListener("change", updateSummary);

// Turn any phone value into +234 followed by the number.
// Handles 0801..., 234801..., +234801... and plain 801...
function normalisePhone(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("234")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return "+234" + digits;
}

// Remember the last five numbers used on this device
function savedPhones() {
  try {
    return JSON.parse(localStorage.getItem(PHONE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function rememberPhone(number) {
  if (!number || number.length <= 4) return;
  const list = savedPhones().filter((p) => p !== number);
  list.unshift(number);
  localStorage.setItem(PHONE_KEY, JSON.stringify(list.slice(0, 5)));
  renderPhoneSuggestions();
}

function renderPhoneSuggestions() {
  const list = document.getElementById("phone-suggestions");
  if (!list) return;
  list.innerHTML = savedPhones()
    .map((p) => `<option value="${p}"></option>`)
    .join("");
}

phone.addEventListener("focus", () => {
  if (!phone.value.startsWith("+234")) phone.value = "+234";
});

phone.addEventListener("keydown", (e) => {
  // Stop backspace or delete from removing the +234 prefix
  if ((e.key === "Backspace" || e.key === "Delete") && phone.selectionStart <= 4) {
    e.preventDefault();
  }
});

// Runs when the user types, pastes or picks a suggestion
phone.addEventListener("input", () => {
  if (!phone.value.startsWith("+234")) {
    phone.value = normalisePhone(phone.value);
  }
});

// Send the form to Formspree without leaving the page.
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const notes = [...form.querySelectorAll('input[name="notes"]:checked')];
  if (notes.length === 0) {
    status.textContent = "Please choose at least one scent note.";
    status.className = "form-status error";
    return;
  }

  status.textContent = "Sending...";
  status.className = "form-status";

  const numberToRemember = phone.value;

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });

    if (response.ok) {
      rememberPhone(numberToRemember);
      form.reset();
      phone.value = "+234";
      updateSummary();
      status.textContent = "Thank you! We will contact you shortly with your scent recommendations.";
      status.className = "form-status success";
    } else {
      throw new Error("Request failed");
    }
  } catch (error) {
    status.textContent = "Something went wrong. Please try again or email hello@bkfragrance.com.";
    status.className = "form-status error";
  }
});

renderPhoneSuggestions();
updateSummary();