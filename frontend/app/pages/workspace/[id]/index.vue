<script setup lang="ts">
import type { LayoutType } from '~/types'
import ClientList from '~/components/client/ClientList.vue'
import InspirationWall from '~/components/inspiration/InspirationWall.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const workspaceStore = useWorkspaceStore()
const activeTab = ref<'boards' | 'clients' | 'inspirations'>('boards')

const showBoardForm = ref(false)
const boardForm = reactive({ title: '', layoutType: 'KANBAN' as LayoutType })
const boardLoading = ref(false)

await workspaceStore.loadWorkspace(route.params.id as string)
const ws = computed(() => workspaceStore.current)

async function createBoard() {
  if (!boardForm.title.trim() || !ws.value) return
  boardLoading.value = true
  try {
    const board = await workspaceStore.createBoard({
      workspaceId: ws.value.id,
      title: boardForm.title.trim(),
      layoutType: boardForm.layoutType,
    })
    boardForm.title = ''
    showBoardForm.value = false
    navigateTo(`/workspace/${ws.value.id}/board/${board.id}`)
  } finally {
    boardLoading.value = false
  }
}

const deleteBoardTarget = ref<string | null>(null)
const deleteLoading = ref(false)

function confirmDeleteBoard(id: string) {
  deleteBoardTarget.value = id
}

async function executeDeleteBoard() {
  if (!deleteBoardTarget.value) return
  deleteLoading.value = true
  try {
    await workspaceStore.removeBoard(deleteBoardTarget.value)
    deleteBoardTarget.value = null
  } finally {
    deleteLoading.value = false
  }
}

const layoutOptions: { value: LayoutType; label: string; icon: string }[] = [
  { value: 'KANBAN',    label: 'Kanban',     icon: '📋' },
  { value: 'CALENDAR',  label: 'Calendário', icon: '📅' },
  { value: 'TIMELINE',  label: 'Timeline',   icon: '📊' },
  { value: 'DASHBOARD', label: 'Dashboard',  icon: '⚡' },
]
</script>

<template>
  <div v-if="ws" class="flex flex-col h-full">
    <!-- Header -->
    <div class="bg-white border-b border-surface-100 px-8 py-5">
      <div class="flex items-center justify-between">
        <div>
          <NuxtLink to="/dashboard" class="text-xs text-surface-300 hover:text-surface-500 transition">
            ← Dashboard
          </NuxtLink>
          <h1 class="text-xl font-semibold text-surface-900 mt-1">{{ ws.name }}</h1>
          <p v-if="ws.description" class="text-sm text-surface-400 mt-0.5">{{ ws.description }}</p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink
            :to="`/workspace/${ws.id}/agenda`"
            class="text-sm text-surface-500 hover:text-primary-600 font-medium transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-surface-50"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Agenda
          </NuxtLink>
          <span
            class="text-xs px-3 py-1 rounded-full font-medium"
            :class="{
              'bg-green-50 text-green-700': ws.status === 'ACTIVE',
              'bg-yellow-50 text-yellow-700': ws.status === 'DRAFT',
            }"
          >
            {{ ws.status === 'ACTIVE' ? 'Ativo' : 'Rascunho' }}
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mt-5">
        <button
          v-for="tab in [{ key: 'boards', label: 'Boards' }, { key: 'clients', label: 'Clientes' }, { key: 'inspirations', label: 'Inspirações' }]"
          :key="tab.key"
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition"
          :class="activeTab === tab.key
            ? 'bg-surface-50 text-primary-600'
            : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'"
          @click="activeTab = tab.key as any"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-8">

      <!-- Boards tab -->
      <div v-if="activeTab === 'boards'">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-semibold text-surface-800">Boards</h2>
          <button
            class="text-sm text-primary-600 font-medium hover:text-primary-700 transition"
            @click="showBoardForm = !showBoardForm"
          >
            {{ showBoardForm ? '✕ Cancelar' : '+ Novo board' }}
          </button>
        </div>

        <!-- New board form -->
        <div v-if="showBoardForm" class="bg-white rounded-2xl p-5 shadow-card mb-5">
          <h3 class="text-sm font-semibold text-surface-800 mb-4">Criar novo board</h3>
          <div class="mb-4">
            <label class="block text-xs text-surface-500 font-medium mb-1.5">Nome</label>
            <input
              v-model="boardForm.title"
              type="text"
              autofocus
              placeholder="Ex: Sprint 01, Calendário de Conteúdo..."
              class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
              @keyup.enter="createBoard"
            />
          </div>

          <div class="mb-4">
            <label class="block text-xs text-surface-500 font-medium mb-2">Layout</label>
            <div class="flex gap-2">
              <button
                v-for="opt in layoutOptions"
                :key="opt.value"
                type="button"
                class="flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition text-center"
                :class="boardForm.layoutType === opt.value
                  ? 'border-primary-400 bg-surface-50 text-primary-600'
                  : 'border-surface-200 text-surface-500 hover:border-surface-300'"
                @click="boardForm.layoutType = opt.value"
              >
                {{ opt.icon }}<br />
                <span class="text-xs">{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <button
            :disabled="boardLoading || !boardForm.title.trim()"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-60"
            @click="createBoard"
          >
            {{ boardLoading ? 'Criando...' : 'Criar board' }}
          </button>
        </div>

        <div v-if="workspaceStore.boards.length === 0 && !showBoardForm" class="bg-white rounded-2xl p-10 shadow-card text-center">
          <p class="text-surface-400 mb-4">Nenhum board criado ainda.</p>
          <button
            class="inline-block bg-primary-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-700 transition"
            @click="showBoardForm = true"
          >
            Criar primeiro board
          </button>
        </div>

        <div v-if="workspaceStore.boards.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="board in workspaceStore.boards"
            :key="board.id"
            class="bg-white rounded-2xl p-5 shadow-card hover:shadow-soft transition-shadow block group cursor-pointer relative"
            @click="navigateTo(`/workspace/${ws!.id}/board/${board.id}`)"
          >
            <button
              class="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-surface-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
              @click.stop="confirmDeleteBoard(board.id)"
            >
              ✕
            </button>
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center text-primary-600">
                <!-- KANBAN -->
                <svg v-if="board.layoutType === 'KANBAN'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5h6v9H3v-9zm6-4.5h6v6H9V3zm6 4.5h6v9h-6v-9z" />
                </svg>
                <!-- CALENDAR -->
                <svg v-else-if="board.layoutType === 'CALENDAR'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <!-- TIMELINE -->
                <svg v-else-if="board.layoutType === 'TIMELINE'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                <!-- DASHBOARD -->
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-surface-900 group-hover:text-primary-600 transition">
                  {{ board.title }}
                </h3>
                <p class="text-xs text-surface-400">
                  {{ board.layoutType.charAt(0) + board.layoutType.slice(1).toLowerCase() }}
                  · {{ board.columns?.length ?? 0 }} colunas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Clients tab -->
      <ClientList v-else-if="activeTab === 'clients'" :workspace-id="ws.id" />

      <!-- Inspirations tab -->
      <InspirationWall v-else :workspace-id="ws.id" />
    </div>
  </div>

  <div v-else class="p-8 text-center text-surface-400">
    Workspace não encontrado.
  </div>

  <!-- Delete board modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="deleteBoardTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="deleteBoardTarget = null" />
        <div class="relative bg-white rounded-2xl shadow-soft w-full max-w-sm p-6">
          <h3 class="text-base font-semibold text-surface-900 mb-2">Excluir board</h3>
          <p class="text-sm text-surface-500 mb-6">
            Todas as colunas e tasks dentro deste board serão permanentemente removidas. Esta ação não pode ser desfeita.
          </p>
          <div class="flex gap-3 justify-end">
            <button
              class="px-4 py-2 text-sm text-surface-500 hover:text-surface-700 transition"
              @click="deleteBoardTarget = null"
            >
              Cancelar
            </button>
            <button
              :disabled="deleteLoading"
              class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition disabled:opacity-60"
              @click="executeDeleteBoard"
            >
              {{ deleteLoading ? 'Excluindo...' : 'Excluir board' }}
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
