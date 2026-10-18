// 1. DARK / LIGHT MODE TOGGLE
const themeBtn = document.getElementById("theme-toggle");

themeBtn.addEventListener("click", () => {
  // Adds or removes the "light-mode" class on the <body> tag
  document.body.classList.toggle("light-mode");

  // Changes the button text depending on which mode is active
  if (document.body.classList.contains("light-mode")) {
    themeBtn.textContent = "🌙 Dark";
  } else {
    themeBtn.textContent = "☀️ Light";
  }
});

// 2. INTERACTIVE CONTACT FORM
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", (event) => {
  // Stops the browser from refreshing the page on form submit
  event.preventDefault();

  // Grabs the name typed by the user
  const userName = document.getElementById("name-input").value;

  // Shows a confirmation message and clears the form boxes
  formStatus.textContent = `Thanks ${userName}! Your message has been received.`;
  contactForm.reset();
});