const status = document.querySelector<HTMLElement>("[data-copy-status]");

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
  const label = button.querySelector("span");
  let timer: number | undefined;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy ?? "");
    } catch {
      return;
    }
    if (label) label.textContent = button.dataset.done ?? "";
    if (status) status.textContent = button.dataset.done ?? "";
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (label) label.textContent = button.dataset.label ?? "";
      if (status) status.textContent = "";
    }, 2000);
  });
});

export {};
