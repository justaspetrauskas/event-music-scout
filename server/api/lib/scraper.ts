import type { Browser } from "puppeteer"
import puppeteer from "puppeteer"

let browser: Browser | null = null

async function getBrowser() {
	if (!browser) {
		browser = await puppeteer.launch({ headless: true })
	}
	return browser
}

export async function getEventPageText(url: string): Promise<string> {
	const b = await getBrowser()
	const page = await b.newPage()

	await page.goto(url, { waitUntil: "networkidle0" })
	const text = await page.evaluate(() => document.body.innerText)

	await page.close()
	return text
}

// Cleanup when app shuts down - PLACE THIS HERE at top level
process.on("beforeExit", async () => {
	if (browser) {
		await browser.close()
		browser = null
	}
})
