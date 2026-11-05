// Dark is the default; the toggle switches themes and remembers the choice.
const root = document.documentElement;
const button = document.querySelector<HTMLButtonElement>(".theme-toggle");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

function syncButton() {
  if (!button) return;
  const dark = root.dataset.theme === "dark";
  button.setAttribute("aria-label", (dark ? button.dataset.labelLight : button.dataset.labelDark) ?? "");
  button.setAttribute("aria-pressed", String(dark));
}

function apply(theme: string) {
  root.dataset.theme = theme;
  syncButton();
}

button?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("theme", next);
  } catch {}
  if (document.startViewTransition && !reduceMotion.matches) {
    document.startViewTransition(() => apply(next));
  } else {
    apply(next);
  }
});

syncButton();

export {};
