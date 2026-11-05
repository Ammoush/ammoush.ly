const root = document.documentElement;
const button = document.querySelector<HTMLButtonElement>(".theme-toggle");
const systemDark = matchMedia("(prefers-color-scheme: dark)");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

function storedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

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

systemDark.addEventListener("change", (event) => {
  if (!storedTheme()) apply(event.matches ? "dark" : "light");
});

syncButton();

export {};
