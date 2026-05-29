<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })

const authStore = useAuthStore()
const form = reactive({ name: '', email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.register(form.name, form.email, form.password)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.message ?? 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-soft p-8">
    <h2 class="text-xl font-semibold text-surface-900 mb-6">Criar conta gratuita</h2>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Nome</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-surface-700 mb-1">Senha</label>
        <input
          v-model="form.password"
          type="password"
          required
          minlength="8"
          class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-60"
      >
        {{ loading ? 'Criando conta...' : 'Criar conta' }}
      </button>
    </form>

    <p class="text-center text-sm text-surface-500 mt-6">
      Já tem conta?
      <NuxtLink to="/auth/login" class="text-primary-600 font-medium hover:underline">
        Entrar
      </NuxtLink>
    </p>
  </div>
</template>
