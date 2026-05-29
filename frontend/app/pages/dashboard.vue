<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

const activeWorkspaces = computed(() =>
  workspaceStore.workspaces.filter((w) => w.status === 'ACTIVE'),
)
const draftWorkspaces = computed(() =>
  workspaceStore.workspaces.filter((w) => w.status === 'DRAFT'),
)
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-surface-900">
        Olá, {{ authStore.user?.name?.split(' ')[0] }} 👋
      </h1>
      <p class="text-surface-500 mt-1 text-sm">Bem-vindo ao seu espaço criativo</p>
    </div>

    <!-- Quick stats -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-white rounded-2xl p-5 shadow-card">
        <p class="text-sm text-surface-400 mb-1">Workspaces ativos</p>
        <p class="text-2xl font-semibold text-surface-900">{{ activeWorkspaces.length }}</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-card">
        <p class="text-sm text-surface-400 mb-1">Em rascunho</p>
        <p class="text-2xl font-semibold text-surface-900">{{ draftWorkspaces.length }}</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-card">
        <p class="text-sm text-surface-400 mb-1">Total</p>
        <p class="text-2xl font-semibold text-surface-900">{{ workspaceStore.workspaces.length }}</p>
      </div>
    </div>

    <!-- Workspaces grid -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold text-surface-800">Seus workspaces</h2>
      <NuxtLink
        to="/workspace/new"
        class="text-sm text-primary-600 font-medium hover:text-primary-700 transition"
      >
        + Novo workspace
      </NuxtLink>
    </div>

    <div v-if="workspaceStore.workspaces.length === 0" class="bg-white rounded-2xl p-10 shadow-card text-center">
      <p class="text-surface-400 mb-4">Nenhum workspace criado ainda.</p>
      <NuxtLink
        to="/workspace/new"
        class="inline-block bg-primary-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-700 transition"
      >
        Criar primeiro workspace
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="ws in workspaceStore.workspaces"
        :key="ws.id"
        :to="`/workspace/${ws.id}`"
        class="bg-white rounded-2xl p-5 shadow-card hover:shadow-soft transition-shadow block"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-base">
            {{ ws.name.charAt(0).toUpperCase() }}
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="{
              'bg-green-50 text-green-700': ws.status === 'ACTIVE',
              'bg-yellow-50 text-yellow-700': ws.status === 'DRAFT',
              'bg-surface-100 text-surface-500': ws.status === 'ARCHIVED',
            }"
          >
            {{ ws.status === 'ACTIVE' ? 'Ativo' : ws.status === 'DRAFT' ? 'Rascunho' : 'Arquivado' }}
          </span>
        </div>
        <h3 class="font-semibold text-surface-900 mb-1">{{ ws.name }}</h3>
        <p v-if="ws.description" class="text-sm text-surface-400 line-clamp-2">
          {{ ws.description }}
        </p>
        <p class="text-xs text-surface-300 mt-3">
          {{ new Date(ws.createdAt).toLocaleDateString('pt-BR') }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
