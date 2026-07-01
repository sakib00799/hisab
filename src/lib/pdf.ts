/** Simple HTML-to-response PDF placeholder using browser print styles.
 *  For production, swap with Puppeteer + @sparticuz/chromium. */
export function htmlToPdfResponse(html: string, filename: string) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
      "X-PDF-Mode": "html",
    },
  });
}
