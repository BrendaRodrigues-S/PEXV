<script setup lang="ts">
import type { Task } from '~/types'
import AgendaWeek from '~/components/agenda/AgendaWeek.vue'
import TaskModal from '~/components/task/TaskModal.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const workspaceId = route.params.id as string
const config = useRuntimeConfig()
const token = useCookie('access_token')

const weekStart = ref(getMonday(new Date()))
const tasks = ref<Task[]>([])
const loading = ref(true)

const taskModal = ref<{ open: boolean; task: Task | null; defaultDate?: Date }>({
  open: false, task: null,
})

// Boards for the task modal (need a boardId)
const boards = ref<{ id: string; title: string }[]>([])
const columns = ref<{ id: string; title: string; boardId: string }[]>([])

function getMonday(d: Date) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function weekEnd(start: Date) {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return end
}

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

async function loadWeek() {
  loading.value = true
  const start = weekStart.value.toISOString()
  const end = weekEnd(weekStart.value).toISOString()

  const res = await fetch(
    `${config.public.apiBase}/tasks/agenda?workspaceId=${workspaceId}&start=${start}&end=${end}`,
    { headers: { Authorization: `Bearer ${token.value}` } },
  )
  tasks.value = res.ok ? await res.json() : []
  loading.value = false
}

async function loadBoards() {
  const wsRes = await fetch(`${config.public.apiBase}/workspaces/${workspaceId}`, {
    headers: { Authorization: `Bearer ${token.value}` },
  })
  if (wsRes.ok) {
    const ws = await wsRes.json()
    boards.value = ws.boards ?? []
    columns.value = (ws.boards ?? []).flatMap((b: any) =>
      (b.columns ?? []).map((c: any) => ({ ...c, boardId: b.id })),
    )
  }
}

function prevWeek() {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() - 7)
  weekStart.value = d
}

function nextWeek() {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() + 7)
  weekStart.value = d
}

function goToday() {
  weekStart.value = getMonday(new Date())
}

watch(weekStart, loadWeek)

// Save task via board store
const boardStore = useBoardStore()

async function saveTask(data: Partial<Task>) {
  if (taskModal.value.task) {
    await boardStore.updateTask(taskModal.value.task.id, data)
    const idx = tasks.value.findIndex(t => t.id === taskModal.value.task!.id)
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx]!, ...data } as Task
  } else {
    const created = await boardStore.createTask({
      ...data,
      startDate: taskModal.value.defaultDate?.toISOString(),
    })
    tasks.value.push(created)
  }
  taskModal.value.open = false
}

async function deleteTask(id: string) {
  await boardStore.removeTask(id)
  tasks.value = tasks.value.filter(t => t.id !== id)
  taskModal.value.open = false
}

await Promise.all([loadWeek(), loadBoards()])
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="bg-white border-b border-surface-100 px-8 py-4 flex items-center gap-4 shrink-0">
      <NuxtLink :to="`/workspace/${workspaceId}`" class="text-sm text-surface-400 hover:text-surface-600 transition">
        ←
      </NuxtLink>
      <div class="w-px h-4 bg-surface-200" />
      <h1 class="text-base font-semibold text-surface-900">Agenda Criativa</h1>

      <div class="ml-auto flex items-center gap-3">
        <button class="text-xs text-surface-500 hover:text-surface-700 font-medium transition px-3 py-1.5 rounded-lg hover:bg-surface-100" @click="goToday">
          Hoje
        </button>
        <div class="flex items-center gap-1">
          <button class="w-8 h-8 rounded-lg hover:bg-surface-100 transition flex items-center justify-center text-surface-500" @click="prevWeek">‹</button>
          <span class="text-sm font-medium text-surface-700 min-w-44 text-center">
            {{ formatDate(weekStart) }} — {{ formatDate(weekEnd(weekStart)) }}
          </span>
          <button class="w-8 h-8 rounded-lg hover:bg-surface-100 transition flex items-center justify-center text-surface-500" @click="nextWeek">›</button>
        </div>
      </div>
    </div>

    <!-- Calendar body -->
    <div class="flex-1 overflow-auto p-6">
      <div v-if="loading" class="grid grid-cols-7 gap-3">
        <div v-for="i in 7" :key="i" class="bg-surface-100 rounded-2xl animate-pulse h-64" />
      </div>

      <AgendaWeek
        v-else
        :tasks="tasks"
        :week-start="weekStart"
        @task-click="(task) => (taskModal = { open: true, task })"
        @add-task="(date) => (taskModal = { open: true, task: null, defaultDate: date })"
      />

      <p v-if="!loading && tasks.length === 0" class="text-center text-surface-300 text-sm mt-8">
        Nenhuma task com data nesta semana. Clique em um dia para adicionar.
      </p>
    </div>

    <!-- Task modal -->
    <TaskModal
      v-if="columns.length"
      :open="taskModal.open"
      :board-id="boards[0]?.id ?? ''"
      :columns="columns"
      :task="taskModal.task"
      @close="taskModal.open = false"
      @save="saveTask"
      @delete="deleteTask"
    />
  </div>
</template>
