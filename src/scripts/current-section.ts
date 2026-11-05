// Track the section under the header: match the header's tone to it, and
// point the language links at the same section in the other language.
const header = document.querySelector<HTMLElement>(".site-header");
const sections = document.querySelectorAll<HTMLElement>("main > section");
const langLinks = document.querySelectorAll<HTMLAnchorElement>("a[hreflang]");
let observer: IntersectionObserver | undefined;

function setCurrent(section: Element) {
  if (header) {
    const dark = section.classList.contains("tone-dark");
    header.classList.toggle("tone-dark", dark);
    header.classList.toggle("tone-light", !dark);
  }

  const id = section.id && section.id !== "top" ? `#${section.id}` : "";
  langLinks.forEach((link) => {
    link.hash = id;
  });
}

function observe() {
  if (!header) return;
  observer?.disconnect();
  const h = header.offsetHeight;
  // A one-pixel band just below the header.
  observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && setCurrent(entry.target)),
    { rootMargin: `-${h}px 0px -${Math.max(innerHeight - h - 1, 0)}px 0px` },
  );
  sections.forEach((section) => observer!.observe(section));
}

observe();
addEventListener("resize", observe);

export {};
