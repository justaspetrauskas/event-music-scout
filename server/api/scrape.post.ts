import puppeteer from "puppeteer"

export default defineEventHandler(async (event) => {
	let browser = null
	let page = null

	try {
		browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-gpu",
			],
			executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
		})

		page = await browser.newPage()
		const { url } = await readBody(event)
		await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 })

		const pageText = await page.evaluate(() => {
			document.querySelectorAll("script, style").forEach(el => el.remove())
			return document.body.innerText.trim().replace(/\s+/g, " ").substring(0, 50000)
		})

		return { success: true, text: pageText }
	}
	catch (error: any) {
		return { success: false, error: error.message }
	}
	finally {
		if (page) await page.close().catch(() => {})
		if (browser) await browser.close().catch(() => {})
	}
})
