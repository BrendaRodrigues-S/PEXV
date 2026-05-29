export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('access_token')
  const publicRoutes = ['/auth/login', '/auth/register']

  if (!token.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/auth/login')
  }

  if (token.value && publicRoutes.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
