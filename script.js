const themeButton = document.getElementById("theme-toggle");

if (themeButton) {
  const themeIcon = themeButton.querySelector(".theme-icon");
  const themeLabel = themeButton.querySelector(".theme-label");
  const savedTheme = localStorage.getItem("tanmay-portfolio-theme");

  function setTheme(theme, savePreference = false) {
    const lightMode = theme === "light";
    document.body.classList.toggle("light-mode", lightMode);
    themeButton.setAttribute("aria-pressed", String(lightMode));
    themeButton.setAttribute(
      "aria-label",
      lightMode ? "Switch to dark mode" : "Switch to light mode"
    );

    themeIcon.textContent = lightMode ? "☾" : "☼";
    themeLabel.textContent = lightMode ? "Dark mode" : "Light mode";

    if (savePreference) {
      localStorage.setItem("tanmay-portfolio-theme", lightMode ? "light" : "dark");
    }
  }

  setTheme(savedTheme === "light" ? "light" : "dark");

  themeButton.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
    setTheme(nextTheme, true);
  });
}
