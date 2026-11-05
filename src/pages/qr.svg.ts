import type { APIRoute } from "astro";
import QRCode from "qrcode";

export const GET: APIRoute = async ({ site }) => {
  const svg = await QRCode.toString(new URL("/", site).href, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#20261a", light: "#ffffff" },
  });

  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
};
