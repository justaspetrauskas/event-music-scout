import puppeteer from "puppeteer-core"

async function getBrowser() {
	const browser = await puppeteer.connect({
		browserWSEndpoint: process.env.PUPPETEER_WS_ENDPOINT || "ws://localhost:3000",
	})

	return browser
}

export async function getEventPageText(url: string): Promise<string | null> {
	try {
		const browser = await getBrowser()
		if (browser === null) throw new Error("Browser not initialized")
		const page = await browser.newPage()

		await page.goto(url, { waitUntil: "networkidle0" })
		const pageText = await page.evaluate(() => document.body.innerText)

		await page.close()
		return pageText
	}
	catch (error) {
		console.log("Scraping error:", error)
		return null
	}
}
