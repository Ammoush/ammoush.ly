import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// The pre-paint theme script is inlined verbatim, so its hash is computed here.
const themeInit = readFileSync(new URL("./src/scripts/theme-init.js", import.meta.url), "utf8");
const themeInitHash = `sha256-${createHash("sha256").update(themeInit).digest("base64")}`;

export default defineConfig({
  site: "https://ammoush.ly",
  trailingSlash: "ignore",
  markdown: { syntaxHighlight: false },
  build: {
    format: "directory",
    inlineStylesheets: "always",
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        "base-uri 'self'",
        "form-action 'none'",
        "object-src 'none'",
        "upgrade-insecure-requests",
      ],
      scriptDirective: {
        resources: ["'self'", "https://static.cloudflareinsights.com"],
        hashes: [themeInitHash],
      },
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", ar: "ar" },
      },
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
