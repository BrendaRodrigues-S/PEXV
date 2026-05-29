<script setup lang="ts">
import type { Column, Task } from '~/types'
import TaskCard from '~/components/board/TaskCard.vue'

const props = defineProps<{
  column: Column
  tasks: Task[]
  draggingTaskId: string | null
}>()

const emit = defineEmits<{
  taskDragStart: [task: Task]
  taskDrop: [columnId: string, position: number]
  taskClick: [task: Task]
  addTask: [columnId: string]
  deleteColumn: [columnId: string]
  renameColumn: [column: Column]
}>()

const isOver = ref(false)
const showMenu = ref(false)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isOver.value = true
}

function onDragLeave() {
  isOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isOver.value = false
  emit('taskDrop', props.column.id, props.tasks.length)
}
</script>

<template>
  <div class="flex flex-col w-72 shrink-0">
    <!-- Column header -->
    <div class="flex items-center justify-between mb-3 px-1">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold text-surface-700">{{ column.title }}</h3>
        <span class="text-xs bg-surface-100 text-surface-400 font-medium rounded-full px-2 py-0.5">
          {{ tasks.length }}
        </span>
      </div>

      <div class="relative">
        <button
          class="w-6 h-6 rounded-lg flex items-center justify-center text-surface-300 hover:bg-surface-100 hover:text-surface-600 transition opacity-0 group-hover:opacity-100"
          @click="showMenu = !showMenu"
          @blur="setTimeout(() => showMenu = false, 150)"
        >
          ···
        </button>
        <div
          v-if="showMenu"
          class="absolute right-0 top-8 bg-white rounded-xl shadow-soft border border-surface-100 z-10 py-1 w-40"
        >
          <button
            class="w-full text-left px-4 py-2 text-sm text-surface-600 hover:bg-surface-50 transition"
            @click="emit('renameColumn', column); showMenu = false"
          >
            Renomear
          </button>
          <button
            class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
            @click="emit('deleteColumn', column.id); showMenu = false"
          >
            Excluir coluna
          </button>
        </div>
      </div>
    </div>

    <!-- Drop zone + cards -->
    <div
      class="flex-1 min-h-24 rounded-2xl p-2 transition-colors space-y-2"
      :class="isOver ? 'bg-surface-50 border-2 border-dashed border-primary-400' : 'bg-surface-100/60'"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :dragging="draggingTaskId === task.id"
        @dragstart="emit('taskDragStart', $event)"
        @click="emit('taskClick', $event)"
      />

      <div
        v-if="tasks.length === 0 && !isOver"
        class="h-16 flex items-center justify-center text-xs text-surface-300"
      >
        Solte tasks aqui
      </div>
    </div>

    <!-- Add task button -->
    <button
      class="mt-2 w-full py-2 rounded-xl text-sm text-surface-400 hover:text-primary-600 hover:bg-surface-50 transition flex items-center justify-center gap-1.5"
      @click="emit('addTask', column.id)"
    >
      <span class="text-base leading-none">+</span> Adicionar task
    </button>
  </div>
</template>
