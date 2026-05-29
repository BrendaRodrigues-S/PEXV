<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })

const authStore = useAuthStore()
const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const submitted = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  submitted.value = true
  try {
    await authStore.login(form.email, form.password)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.message ?? 'Erro ao entrar'
    submitted.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 login-card">

    <div class="mb-6">
      <h2 class="text-xl font-bold text-surface-900">Bem-vinda de volta</h2>
      <p class="text-sm text-surface-400 mt-0.5">Entre na sua conta para continuar</p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <!-- Email -->
      <div class="field-wrap">
        <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Email</label>
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          </span>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all bg-surface-50 focus:bg-white"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="field-wrap">
        <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Senha</label>
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          </span>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="w-full pl-10 pr-10 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all bg-surface-50 focus:bg-white"
            placeholder="••••••••"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500 transition"
            @click="showPassword = !showPassword"
          >
            <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Error -->
      <Transition name="shake">
        <p v-if="error" class="text-red-500 text-sm flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
          {{ error }}
        </p>
      </Transition>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all relative overflow-hidden"
        :class="loading ? 'bg-primary-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'"
      >
        <span class="flex items-center justify-center gap-2 transition-all" :class="loading ? 'opacity-0' : 'opacity-100'">
          Entrar
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </span>
        <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
          <svg class="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </span>
      </button>
    </form>

    <div class="flex items-center gap-3 my-6">
      <div class="flex-1 h-px bg-surface-100" />
      <span class="text-xs text-surface-300 font-medium">ou</span>
      <div class="flex-1 h-px bg-surface-100" />
    </div>

    <p class="text-center text-sm text-surface-500">
      Não tem conta?
      <NuxtLink to="/auth/register" class="text-primary-600 font-semibold hover:text-primary-700 transition ml-1">
        Criar conta →
      </NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.login-card {
  animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Stagger fields */
.field-wrap:nth-child(1) { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
.field-wrap:nth-child(2) { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Error shake */
.shake-enter-active { animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
.shake-leave-active { transition: opacity 0.2s; }
.shake-leave-to     { opacity: 0; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}
</style>
