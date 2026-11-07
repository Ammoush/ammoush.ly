// Track the section under the header and match the header's tone to it.
const header = document.querySelector<HTMLElement>(".site-header");
const sections = document.querySelectorAll<HTMLElement>("main > section");
let observer: IntersectionObserver | undefined;

function setCurrent(section: Element) {
  if (header) {
    const dark = section.classList.contains("tone-dark");
    header.classList.toggle("tone-dark", dark);
    header.classList.toggle("tone-light", !dark);
  }

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
