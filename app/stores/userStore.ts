import { ref } from "vue"
import type { User } from "~~/types"

export const useUserStore = defineStore("userStore", () => {
	const user = ref<User | null>(null)
	const loading = ref(false)
	const error = ref<string | null>(null)

	const setUser = (profile: User) => {
		user.value = profile
	}

	return {
		user,
		loading,
		error,
		setUser,
	}
})
