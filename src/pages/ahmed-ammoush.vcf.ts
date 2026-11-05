import type { APIRoute } from "astro";
import { profile } from "../lib/profile";

const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1");

export const GET: APIRoute = ({ site }) => {
  const { person, contact } = profile;
  const [first, ...rest] = person.name.en.split(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escape(rest.join(" "))};${escape(first)};;;`,
    `FN:${escape(person.name.en)}`,
    `ORG:${escape(person.organization)}`,
    `TITLE:${escape(person.title.en)}`,
    `EMAIL;TYPE=INTERNET,PREF:${contact.email}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    `ADR;TYPE=WORK:;;;Tripoli;;;Libya`,
    `URL:${new URL("/", site).href}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${contact.linkedin}`,
    "END:VCARD",
  ];

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ahmed-ammoush.vcf"',
    },
  });
};
