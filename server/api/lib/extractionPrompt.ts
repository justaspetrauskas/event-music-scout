export function eventExtractionPrompt(pageText: string) {
	return `
        Here is the full text from a music event website:
        """
        ${pageText}
        """
        Extract and return ONLY valid JSON (no markdown, no code block). 
        Use this schema:
        {
        "name": "",
        "date": "",
        "location": "",
        "artists": ["artist1", "artist2", ...],
        "genres": ["genre1", "genre2", ...]
        }
        Respond ONLY with this JSON object and nothing else.
        Include similar genres
    `
}
