import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

export async function getEventPageText(url: string): Promise<string> {
	const browser = await puppeteer.launch({
		args: chromium.args,
		defaultViewport: chromium.defaultViewport,
		executablePath: await chromium.executablePath(),
		headless: chromium.headless,
	})
	const page = await browser.newPage()
	await page.goto(url, { waitUntil: "domcontentloaded" })
	const text = await page.evaluate(() => document.body.innerText)
	await browser.close()
	return text
}
