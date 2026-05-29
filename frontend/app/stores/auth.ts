import { defineStore } from 'pinia'
import { useAuthApi } from '~/services/api'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = useCookie('access_token', { maxAge: 60 * 15 })
  const refreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7 })

  const isAuthenticated = computed(() => !!accessToken.value)

  async function register(name: string, email: string, password: string) {
    const api = useAuthApi()
    const tokens = await api.register({ name, email, password })
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    await fetchMe()
  }

  async function login(email: string, password: string) {
    const api = useAuthApi()
    const tokens = await api.login({ email, password })
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    await fetchMe()
  }

  async function fetchMe() {
    const api = useAuthApi()
    user.value = await api.me()
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    navigateTo('/auth/login')
  }

  return { user, isAuthenticated, register, login, fetchMe, logout }
})
