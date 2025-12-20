export const useTheme = () => {
	const theme = useState<"light" | "dark">("theme", () => {
		if (import.meta.client) {
			return (localStorage.getItem("theme") as "light" | "dark")
				|| (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
		}
		return "light"
	})

	const toggleTheme = () => {
		theme.value = theme.value === "light" ? "dark" : "light"
		if (import.meta.client) {
			localStorage.setItem("theme", theme.value)
			document.documentElement.classList.toggle("dark", theme.value === "dark")
		}
	}

	onMounted(() => {
		document.documentElement.classList.toggle("dark", theme.value === "dark")
	})

	return { theme, toggleTheme }
}
