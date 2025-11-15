export const useUseUtilMethods = () => {
	const padTo2Digits = (num: number): string => {
		return num.toString().padStart(2, "0")
	}

	const msToMinutesSeconds = (ms: number): string => {
		const minutes = Math.floor(ms / 60000)
		const seconds = Math.floor((ms % 60000) / 1000)
		return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
	}

	return {
		msToMinutesSeconds,
	}
}
