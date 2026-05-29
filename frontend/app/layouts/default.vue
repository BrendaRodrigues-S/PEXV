<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useWorkspaceStore } from '~/stores/workspace'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const route = useRoute()

const activeWorkspaceId = computed(() => {
  const match = route.path.match(/\/workspace\/([^/]+)/)
  return match ? match[1] : null
})

const deleteTarget = ref<{ id: string; name: string } | null>(null)
const deleteLoading = ref(false)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await Promise.all([authStore.fetchMe(), workspaceStore.loadWorkspaces()])
  }
})

async function executeDeleteWorkspace() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  const id = deleteTarget.value.id
  const wasActive = activeWorkspaceId.value === id
  try {
    await workspaceStore.removeWorkspace(id)
    deleteTarget.value = null
    if (wasActive) navigateTo('/dashboard')
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-surface-200 flex flex-col shrink-0" style="box-shadow: 1px 0 0 0 #dde2c4">
      <!-- Logo -->
      <div class="px-5 py-5 border-b border-surface-100">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-base font-bold text-surface-900 tracking-tight">
            Creative<span class="text-primary-600">Flow</span>
          </h1>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <!-- Dashboard -->
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
          :class="route.path === '/dashboard' ? 'bg-primary-600 text-white' : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Início
        </NuxtLink>

        <!-- Workspaces section -->
        <div class="pt-5 pb-1.5">
          <p class="px-3 text-xs font-semibold text-surface-400 uppercase tracking-widest">Workspaces</p>
        </div>

        <div v-for="ws in workspaceStore.workspaces" :key="ws.id" class="group/ws">
          <div class="relative">
            <NuxtLink
              :to="`/workspace/${ws.id}`"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors pr-9"
              :class="activeWorkspaceId === ws.id ? 'bg-accent-400/20 text-primary-700 font-semibold' : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'"
            >
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
                :class="ws.status === 'ACTIVE' ? 'bg-primary-500' : 'bg-surface-300'"
              />
              <span class="truncate flex-1">{{ ws.name }}</span>
            </NuxtLink>

            <button
              class="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-surface-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover/ws:opacity-100"
              @click.prevent="deleteTarget = { id: ws.id, name: ws.name }"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>

          <!-- Sub-links when workspace is active -->
          <div v-if="activeWorkspaceId === ws.id" class="ml-5 mt-0.5 space-y-0.5">
            <NuxtLink
              :to="`/workspace/${ws.id}/agenda`"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              :class="route.path === `/workspace/${ws.id}/agenda` ? 'bg-accent-400/20 text-primary-700' : 'text-surface-400 hover:text-surface-700 hover:bg-surface-100'"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke-linecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke-linecap="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke-linecap="round"/>
              </svg>
              Agenda
            </NuxtLink>
          </div>
        </div>

        <NuxtLink
          to="/workspace/new"
          class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors mt-1"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Novo workspace
        </NuxtLink>
      </nav>

      <!-- User footer -->
      <div class="px-3 py-4 border-t border-surface-100 shrink-0">
        <div class="flex items-center gap-2.5 px-2">
          <div class="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {{ authStore.user?.name?.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-surface-800 truncate">{{ authStore.user?.name }}</p>
            <p class="text-xs text-surface-400 truncate">{{ authStore.user?.email }}</p>
          </div>
          <button
            class="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition shrink-0"
            title="Sair"
            @click="authStore.logout()"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto min-w-0 bg-surface-50">
      <slot />
    </main>
  </div>

  <!-- Delete workspace modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="deleteTarget = null" />
        <div class="relative bg-white rounded-2xl shadow-soft w-full max-w-sm p-6">
          <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/>
            </svg>
          </div>
          <h3 class="text-base font-semibold text-surface-900 mb-2">Excluir workspace</h3>
          <p class="text-sm text-surface-500 mb-1">
            Tem certeza que deseja excluir <span class="font-semibold text-surface-800">{{ deleteTarget.name }}</span>?
          </p>
          <p class="text-sm text-surface-400 mb-6">Todos os boards, colunas e tasks serão permanentemente removidos.</p>
          <div class="flex gap-3 justify-end">
            <button class="px-4 py-2 text-sm text-surface-500 hover:text-surface-700 font-medium transition rounded-xl hover:bg-surface-100" @click="deleteTarget = null">
              Cancelar
            </button>
            <button
              :disabled="deleteLoading"
              class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60"
              @click="executeDeleteWorkspace"
            >
              {{ deleteLoading ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
