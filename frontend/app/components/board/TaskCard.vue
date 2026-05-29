<script setup lang="ts">
import type { Task } from '~/types'

const props = defineProps<{
  task: Task
  dragging: boolean
}>()

const emit = defineEmits<{
  dragstart: [task: Task]
  click: [task: Task]
}>()

const priorityConfig = {
  LOW:    { label: 'Baixa',   class: 'bg-surface-100 text-surface-500' },
  MEDIUM: { label: 'Média',   class: 'bg-accent-400/20 text-primary-700' },
  HIGH:   { label: 'Alta',    class: 'bg-orange-50 text-orange-600' },
  URGENT: { label: 'Urgente', class: 'bg-red-50 text-red-600' },
}

const priority = computed(() => priorityConfig[props.task.priority])

const isOverdue = computed(() => {
  if (!props.task.deadline) return false
  return new Date(props.task.deadline) < new Date()
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <div
    draggable="true"
    class="group bg-white rounded-xl p-3.5 shadow-card border border-surface-100 cursor-grab active:cursor-grabbing select-none transition-all hover:shadow-soft hover:-translate-y-0.5"
    :class="{ 'opacity-40 scale-95': dragging }"
    @dragstart="emit('dragstart', task)"
    @click="emit('click', task)"
  >
    <!-- Header row -->
    <div class="flex items-start gap-2 mb-2">
      <span class="w-4 h-4 shrink-0 mt-0.5 text-surface-400">
        <svg v-if="task.taskType === 'EXECUTION'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
        <svg v-else-if="task.taskType === 'FOCUS'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/></svg>
        <svg v-else-if="task.taskType === 'REVISION'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/></svg>
        <svg v-else-if="task.taskType === 'INSPIRATION'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>
        <svg v-else-if="task.taskType === 'MEETING'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5"/></svg>
        <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
      </span>
      <p class="flex-1 text-sm font-medium text-surface-800 leading-snug">{{ task.title }}</p>
    </div>

    <!-- Description -->
    <p v-if="task.description" class="text-xs text-surface-400 mb-2.5 line-clamp-2 pl-5">
      {{ task.description }}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between pl-5">
      <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="priority.class">
        {{ priority.label }}
      </span>

      <div class="flex items-center gap-2">
        <span v-if="task.estimatedTime" class="text-xs text-surface-300">
          {{ task.estimatedTime }}min
        </span>
        <span
          v-if="task.deadline"
          class="text-xs font-medium"
          :class="isOverdue ? 'text-red-500' : 'text-surface-400'"
        >
          {{ formatDate(task.deadline) }}
        </span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="task.tags?.length" class="flex flex-wrap gap-1 mt-2 pl-5">
      <span
        v-for="tt in task.tags"
        :key="tt.tagId"
        class="text-xs px-2 py-0.5 rounded-full text-white font-medium"
        :style="{ backgroundColor: tt.tag.color }"
      >
        {{ tt.tag.name }}
      </span>
    </div>
  </div>
</template>
