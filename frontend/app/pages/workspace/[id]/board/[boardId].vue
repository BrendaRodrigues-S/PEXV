<script setup lang="ts">
import type { Column, Task } from '~/types'
import KanbanColumn from '~/components/board/KanbanColumn.vue'
import CalendarView from '~/components/board/CalendarView.vue'
import TimelineView from '~/components/board/TimelineView.vue'
import DashboardView from '~/components/board/DashboardView.vue'
import MonthlyTimeline from '~/components/board/MonthlyTimeline.vue'
import TaskModal from '~/components/task/TaskModal.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const workspaceId = route.params.id as string
const boardId = route.params.boardId as string

const boardStore = useBoardStore()

const taskModal = reactive<{ open: boolean; task: Task | null; columnId?: string; defaultDate?: string }>({
  open: false,
  task: null,
})
const newColumnInput = ref('')
const showColumnInput = ref(false)
const columnInputRef = ref<HTMLInputElement | null>(null)
const draggingTaskId = ref<string | null>(null)
const draggingTask = ref<Task | null>(null)
const renameTarget = ref<Column | null>(null)
const renameValue = ref('')
const loadError = ref('')
const loadingBoard = ref(true)

const isCalendar = computed(() => boardStore.current?.layoutType === 'CALENDAR')
const isTimeline = computed(() => boardStore.current?.layoutType === 'TIMELINE')
const isDashboard = computed(() => boardStore.current?.layoutType === 'DASHBOARD')
const showMonthlyTimeline = ref(false)

onMounted(async () => {
  try {
    await boardStore.loadBoard(workspaceId, boardId)
  } catch (e: any) {
    loadError.value = e?.message ?? 'Erro ao carregar board'
  } finally {
    loadingBoard.value = false
  }
})

onUnmounted(() => boardStore.reset())

async function addColumn() {
  if (!newColumnInput.value.trim()) return
  await boardStore.createColumn(boardId, newColumnInput.value.trim())
  newColumnInput.value = ''
  showColumnInput.value = false
}

function startRename(col: Column) {
  renameTarget.value = col
  renameValue.value = col.title
}

async function submitRename() {
  if (!renameTarget.value || !renameValue.value.trim()) return
  await boardStore.updateColumn(renameTarget.value.id, { title: renameValue.value.trim() })
  renameTarget.value = null
}

async function deleteColumn(id: string) {
  if (!confirm('Excluir esta coluna e todas as suas tasks?')) return
  await boardStore.removeColumn(id)
}

function onTaskDragStart(task: Task) {
  draggingTaskId.value = task.id
  draggingTask.value = task
}

async function onTaskDrop(columnId: string, position: number) {
  if (!draggingTask.value) return
  await boardStore.moveTask(draggingTask.value.id, columnId, position)
  draggingTaskId.value = null
  draggingTask.value = null
}

function onDragEnd() {
  draggingTaskId.value = null
  draggingTask.value = null
}

function openNewTask(columnId: string) {
  taskModal.open = true
  taskModal.task = null
  taskModal.columnId = columnId
  taskModal.defaultDate = undefined
}

function openNewTaskOnDate(dateStr: string) {
  taskModal.open = true
  taskModal.task = null
  taskModal.columnId = boardStore.columns[0]?.id
  taskModal.defaultDate = dateStr
}

function openFromTimeline(colId: string, date: string) {
  taskModal.open = true
  taskModal.task = null
  taskModal.columnId = colId
  taskModal.defaultDate = date
}

function openEditTask(task: Task) {
  taskModal.open = true
  taskModal.task = task
  taskModal.columnId = task.columnId ?? undefined
  taskModal.defaultDate = undefined
}

function closeModal() {
  taskModal.open = false
}

async function saveTask(data: Partial<Task>) {
  try {
    if (taskModal.task) {
      await boardStore.updateTask(taskModal.task.id, data)
    } else {
      await boardStore.createTask({
        ...data,
        boardId,
        columnId: taskModal.columnId ?? data.columnId,
      })
    }
    taskModal.open = false
  } catch (e: any) {
    alert(e?.message ?? 'Erro ao salvar task')
  }
}

async function deleteTask(id: string) {
  await boardStore.removeTask(id)
  taskModal.open = false
}

watch(showColumnInput, async (v) => {
  if (v) {
    await nextTick()
    columnInputRef.value?.focus()
  }
})
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">

    <!-- Loading -->
    <div v-if="loadingBoard" class="flex-1 flex items-center justify-center text-surface-400">
      Carregando board...
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="flex-1 flex items-center justify-center text-red-500">
      {{ loadError }}
    </div>

    <template v-else>
      <!-- Board header -->
      <div class="bg-white border-b border-surface-100 px-8 py-4 flex items-center gap-4 shrink-0">
        <NuxtLink :to="`/workspace/${workspaceId}`" class="text-sm text-surface-400 hover:text-surface-600 transition">←</NuxtLink>
        <div class="w-px h-4 bg-surface-200" />
        <h1 class="text-base font-semibold text-surface-900">{{ boardStore.current?.title ?? 'Board' }}</h1>
        <span class="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full flex items-center gap-1">
          <template v-if="isCalendar">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Calendário
          </template>
          <template v-else-if="isTimeline">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Timeline
          </template>
          <template v-else-if="isDashboard">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            Dashboard
          </template>
          <template v-else>{{ boardStore.columns.length }} colunas · {{ boardStore.tasks.length }} tasks</template>
        </span>
        <div class="ml-auto">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            :class="showMonthlyTimeline ? 'bg-primary-600 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
            @click="showMonthlyTimeline = !showMonthlyTimeline"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Linha temporal mensal
          </button>
        </div>
      </div>

      <!-- Calendar view -->
      <CalendarView
        v-if="isCalendar"
        :tasks="boardStore.tasks"
        :columns="boardStore.columns"
        class="flex-1 overflow-hidden"
        @task-click="openEditTask"
        @day-click="openNewTaskOnDate"
      />

      <!-- Timeline view -->
      <TimelineView
        v-else-if="isTimeline"
        :tasks="boardStore.tasks"
        :columns="boardStore.columns"
        class="flex-1 overflow-hidden"
        @task-click="openEditTask"
        @add-task="openFromTimeline"
      />

      <!-- Dashboard view -->
      <DashboardView
        v-else-if="isDashboard"
        :tasks="boardStore.tasks"
        :columns="boardStore.columns"
        class="flex-1 overflow-hidden"
        @task-click="openEditTask"
        @add-task="openFromTimeline"
      />

      <!-- Kanban -->
      <div v-else class="flex-1 overflow-x-auto overflow-y-hidden px-8 py-6" @dragend="onDragEnd">
        <div class="flex gap-4 h-full items-start">
          <KanbanColumn
            v-for="col in boardStore.columns"
            :key="col.id"
            :column="col"
            :tasks="boardStore.tasksByColumn[col.id] ?? []"
            :dragging-task-id="draggingTaskId"
            @task-drag-start="onTaskDragStart"
            @task-drop="onTaskDrop"
            @task-click="openEditTask"
            @add-task="openNewTask"
            @delete-column="deleteColumn"
            @rename-column="startRename"
          />

          <div class="w-72 shrink-0">
            <div v-if="showColumnInput" class="bg-white rounded-2xl p-3 shadow-card">
              <input
                ref="columnInputRef"
                v-model="newColumnInput"
                type="text"
                placeholder="Nome da coluna..."
                class="w-full px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition mb-2"
                @keyup.enter="addColumn"
                @keyup.esc="showColumnInput = false"
              />
              <div class="flex gap-2">
                <button class="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 rounded-xl transition" @click="addColumn">Adicionar</button>
                <button class="px-3 py-2 text-surface-400 hover:text-surface-600 text-sm transition" @click="showColumnInput = false">✕</button>
              </div>
            </div>
            <button
              v-else
              class="w-full py-3 rounded-2xl border-2 border-dashed border-surface-200 text-sm text-surface-400 hover:border-primary-400 hover:text-primary-600 hover:bg-surface-50 transition flex items-center justify-center gap-2"
              @click="showColumnInput = true"
            >
              <span class="text-base">+</span> Nova coluna
            </button>
          </div>
        </div>
      </div>

      <!-- Rename column dialog -->
      <Teleport to="body">
        <div v-if="renameTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="renameTarget = null">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="renameTarget = null" />
          <div class="relative bg-white rounded-2xl shadow-soft p-6 w-80">
            <h3 class="text-base font-semibold text-surface-900 mb-4">Renomear coluna</h3>
            <input
              v-model="renameValue"
              type="text"
              autofocus
              class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition mb-4"
              @keyup.enter="submitRename"
              @keyup.esc="renameTarget = null"
            />
            <div class="flex gap-3 justify-end">
              <button class="px-4 py-2 text-sm text-surface-400 hover:text-surface-600 transition" @click="renameTarget = null">Cancelar</button>
              <button class="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition" @click="submitRename">Salvar</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Monthly timeline panel -->
      <MonthlyTimeline
        :open="showMonthlyTimeline"
        :tasks="boardStore.tasks"
        @close="showMonthlyTimeline = false"
        @task-click="openEditTask"
      />

      <!-- Task modal -->
      <TaskModal
        :open="taskModal.open"
        :board-id="boardId"
        :layout-type="boardStore.current?.layoutType"
        :columns="boardStore.columns"
        :task="taskModal.task"
        :default-date="taskModal.defaultDate"
        @close="closeModal"
        @save="saveTask"
        @delete="deleteTask"
      />
    </template>
  </div>
</template>
