import { existsSync } from "fs";
import type { Browser } from "puppeteer-core";

/** Well-known Chrome/Edge locations for local development. */
const LOCAL_BROWSER_PATHS = [
  // Windows
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  // macOS
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  // Linux
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

async function launchBrowser(): Promise<Browser> {
  const puppeteer = (await import("puppeteer-core")).default;

  // Vercel / AWS Lambda: use the bundled serverless Chromium build.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ??
    LOCAL_BROWSER_PATHS.find((p) => existsSync(p));

  if (!executablePath) {
    throw new Error(
      "No local Chrome/Edge found for PDF rendering. Set PUPPETEER_EXECUTABLE_PATH."
    );
  }

  return puppeteer.launch({ executablePath, headless: true });
}

export async function renderPdf(html: string): Promise<Uint8Array> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    return await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "12mm", right: "12mm" },
    });
  } finally {
    await browser.close();
  }
}

/** Serve HTML directly (fallback when no browser is available in dev). */
export function htmlToPdfResponse(html: string, filename: string) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
      "X-PDF-Mode": "html",
    },
  });
}

/**
 * Render HTML to a real PDF response. If Chromium cannot be launched
 * (e.g. local dev without Chrome installed), falls back to inline HTML so
 * the feature stays usable.
 */
export async function pdfResponse(html: string, filename: string) {
  try {
    const pdf = await renderPdf(html);
    return new Response(pdf as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF rendering failed, serving HTML fallback:", error);
    return htmlToPdfResponse(html, filename.replace(/\.pdf$/, ".html"));
  }
}
