<script setup lang="ts">
import type { Client } from '~/types'
import { useClientApi } from '~/services/api'
import ClientModal from '~/components/client/ClientModal.vue'

const props = defineProps<{ workspaceId: string }>()

const clientApi = useClientApi()
const clients = ref<Client[]>([])
const modal = ref<{ open: boolean; client: Client | null }>({ open: false, client: null })
const loading = ref(true)

async function load() {
  loading.value = true
  clients.value = await clientApi.list(props.workspaceId)
  loading.value = false
}

async function save(data: Partial<Client>) {
  if (modal.value.client) {
    const updated = await clientApi.update(modal.value.client.id, data)
    const idx = clients.value.findIndex(c => c.id === modal.value.client!.id)
    if (idx !== -1) clients.value[idx] = updated
  } else {
    const created = await clientApi.create(data)
    clients.value.unshift(created)
  }
  modal.value.open = false
}

async function remove(id: string) {
  await clientApi.remove(id)
  clients.value = clients.value.filter(c => c.id !== id)
  modal.value.open = false
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-base font-semibold text-surface-800">Clientes</h2>
      <button
        class="text-sm text-primary-600 font-medium hover:text-primary-700 transition"
        @click="modal = { open: true, client: null }"
      >
        + Novo cliente
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 bg-surface-100 rounded-2xl animate-pulse" />
    </div>

    <div v-else-if="clients.length === 0" class="bg-white rounded-2xl p-10 shadow-card text-center">
      <p class="text-4xl mb-3">👤</p>
      <p class="text-surface-600 font-medium mb-1">Nenhum cliente ainda</p>
      <p class="text-surface-400 text-sm mb-4">Adicione clientes para centralizar briefings e contactos.</p>
      <button
        class="inline-block bg-primary-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-600 transition"
        @click="modal = { open: true, client: null }"
      >
        Adicionar primeiro cliente
      </button>
    </div>

    <div v-else class="space-y-3">
      <button
        v-for="client in clients"
        :key="client.id"
        class="w-full bg-white rounded-2xl p-5 shadow-card hover:shadow-soft transition-shadow text-left block"
        @click="modal = { open: true, client }"
      >
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
            {{ client.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <p class="font-semibold text-surface-900">{{ client.name }}</p>
              <span v-if="client.company" class="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">
                {{ client.company }}
              </span>
            </div>
            <p class="text-sm text-surface-400">{{ client.email }}</p>
            <p v-if="client.phone" class="text-xs text-surface-300 mt-0.5">{{ client.phone }}</p>
          </div>
          <span class="text-surface-200 text-lg shrink-0">›</span>
        </div>
        <p v-if="client.notes" class="text-sm text-surface-400 mt-3 line-clamp-2 pl-14">
          {{ client.notes }}
        </p>
      </button>
    </div>

    <ClientModal
      :open="modal.open"
      :workspace-id="workspaceId"
      :client="modal.client"
      @close="modal.open = false"
      @save="save"
      @delete="remove"
    />
  </div>
</template>
