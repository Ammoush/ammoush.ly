import { parse } from "yaml";
import { z } from "astro/zod";
import source from "../content/profile.yaml?raw";

export const languages = ["en", "ar"] as const;
export type Lang = (typeof languages)[number];

const text = z.object({ en: z.string().min(1), ar: z.string().min(1) });
export type Text = z.infer<typeof text>;

// YAML may read 2024-03 as a string or (if someone writes 2024-03-01) a Date.
const month = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 7) : value),
  z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM"),
);

const schema = z.object({
  meta: z.object({ title: text, description: text }),
  person: z.object({ name: text, title: text, location: text, organization: z.string() }),
  contact: z.object({
    email: z.email(),
    phone: z.string().regex(/^\+\d{8,15}$/, "Use international format, digits only, e.g. +218912345678"),
    phone_display: z.string(),
    linkedin: z.url(),
    github: z.url().nullable(),
    source: z.url().nullable(),
    cv: z.string().nullable(),
  }),
  nav: z.object({ about: text, how_i_work: text, experience: text, skills: text, contact: text }),
  hero: z.object({
    tagline: text,
    cta_primary: text,
    cta_secondary: text,
    console: z.object({
      label: text,
      title: text,
      subtitle: text,
      hint: text,
      gates: z
        .array(z.object({ name: text, state: text, detail: text }))
        .length(3, "The panel animation is timed for exactly three gates"),
      passed: text,
      summary: text,
      done: text,
      rerun: text,
    }),
  }),
  about: z.object({ heading: text, body: text }),
  how_i_work: z.object({
    heading: text,
    items: z.array(z.object({ step: text, title: text, body: text })).length(4),
  }),
  experience: z.object({
    heading: text,
    present: text,
    range_to: text,
    status: z.object({ current: text, completed: text, graduated: text }),
    items: z.array(
      z.object({
        kind: z.enum(["role", "education"]),
        id: z.string().regex(/^[a-z]+$/),
        short: text.optional(),
        role: text,
        org: z.string(),
        start: month.nullable(),
        end: month.nullable(),
        summary: text.optional(),
        highlights: z.array(text).optional(),
      }),
    ),
  }),
  skills: z.object({
    heading: text,
    used_in: text,
    hint: text,
    groups: z.array(z.object({ name: text, used_in: z.array(z.string()).min(1), items: z.array(text).min(1) })),
  }),
  education: z.object({
    heading: text,
    items: z.array(z.object({ degree: text, school: text, date: month })),
  }),
  languages: z.object({
    heading: text,
    items: z.array(z.object({ name: text, level: text })),
  }),
  contact_section: z.object({
    heading: text,
    body: text,
    actions: z.object({
      copy_email: text,
      copy: text,
      open: text,
      copied: text,
      whatsapp: text,
      linkedin: text,
      github: text,
      save_contact: text,
      download_cv: text,
    }),
  }),
  ui: z.object({
    skip_to_content: text,
    switch_language: text,
    theme_light: text,
    theme_dark: text,
    qr: text,
    email: text,
    sections: text,
  }),
  footer: z.object({ built_with: text, source: text, copyright: text }),
  not_found: z.object({ title: text, body: text, back: text }),
});

export type Profile = z.infer<typeof schema>;

function load(): Profile {
  const result = schema.safeParse(parse(source));
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`src/content/profile.yaml is invalid:\n${issues}`);
  }
  return result.data;
}

export const profile = load();

{
  const ids = new Set(profile.experience.items.map((item) => item.id));
  for (const group of profile.skills.groups) {
    const unknown = group.used_in.filter((id) => !ids.has(id));
    if (unknown.length) throw new Error(`src/content/profile.yaml: skills group "${group.name.en}" uses unknown experience ids: ${unknown.join(", ")}`);
  }
}

export const dir = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");
export const otherLang = (lang: Lang): Lang => (lang === "ar" ? "en" : "ar");
export const homePath = (lang: Lang) => (lang === "ar" ? "/ar/" : "/");

// Latin digits in both languages, as used in Libya.
const locales: Record<Lang, string> = { en: "en-US", ar: "ar-LY-u-nu-latn" };

export function formatMonth(value: string, lang: Lang) {
  const [year, m] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locales[lang], { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, m - 1, 1)),
  );
}

export function toIso(value: string) {
  return `${value}-01`;
}
