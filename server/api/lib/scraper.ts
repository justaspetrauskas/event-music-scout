import type { Browser } from "puppeteer-core"
import puppeteer from "puppeteer-core"

let browser: Browser | null = null

export async function getBrowser() {
	return puppeteer.launch({
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--disable-accelerated-2d-canvas",
			"--no-first-run",
			"--no-zygote",
			"--disable-gpu",
			"--single-process",
		],
	})
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
