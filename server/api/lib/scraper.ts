import { chromium } from "playwright"

// Use Playwright to fetch all text content from the event page
export async function getEventPageText(url: string): Promise<string> {
	const browser = await chromium.launch()
	const page = await browser.newPage()
	await page.goto(url, { waitUntil: "domcontentloaded" })
	const text = await page.evaluate(() => document.body.innerText)
	await browser.close()
	return text
}
