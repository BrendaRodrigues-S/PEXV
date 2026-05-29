<script setup lang="ts">
import type { Task } from '~/types'

const props = defineProps<{
  tasks: Task[]
  weekStart: Date
}>()

const emit = defineEmits<{
  taskClick: [task: Task]
  addTask: [date: Date]
}>()

const priorityColor: Record<Task['priority'], string> = {
  LOW:    'bg-slate-100 border-slate-300 text-slate-700',
  MEDIUM: 'bg-blue-50 border-blue-200 text-blue-800',
  HIGH:   'bg-orange-50 border-orange-200 text-orange-800',
  URGENT: 'bg-red-50 border-red-200 text-red-800',
}

const taskTypeIcon: Record<Task['taskType'], string> = {
  FOCUS: '🎯', INSPIRATION: '💡', EXECUTION: '⚡',
  REVISION: '🔍', MEETING: '📅', CLIENT: '👤',
}

// Generate 7 days of the week starting from weekStart
const days = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(props.weekStart)
    d.setDate(d.getDate() + i)
    return d
  }),
)

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function tasksForDay(day: Date) {
  return props.tasks.filter(t => {
    const date = t.startDate ? new Date(t.startDate) : t.deadline ? new Date(t.deadline) : null
    return date && isSameDay(date, day)
  })
}

const today = new Date()
</script>

<template>
  <div class="grid grid-cols-7 gap-3 min-h-96">
    <div
      v-for="day in days"
      :key="day.toISOString()"
      class="flex flex-col"
    >
      <!-- Day header -->
      <div
        class="text-center mb-2 py-2 rounded-xl"
        :class="isSameDay(day, today) ? 'bg-primary-500 text-white' : ''"
      >
        <p class="text-xs font-medium" :class="isSameDay(day, today) ? 'text-primary-100' : 'text-surface-400'">
          {{ dayNames[day.getDay()] }}
        </p>
        <p class="text-base font-bold" :class="isSameDay(day, today) ? 'text-white' : 'text-surface-800'">
          {{ day.getDate() }}
        </p>
      </div>

      <!-- Tasks -->
      <div
        class="flex-1 space-y-2 min-h-24 p-2 rounded-2xl bg-surface-50 hover:bg-surface-100/80 transition-colors cursor-pointer"
        @click="emit('addTask', day)"
      >
        <div
          v-for="task in tasksForDay(day)"
          :key="task.id"
          class="p-2 rounded-xl border text-xs font-medium cursor-pointer hover:shadow-sm transition-shadow"
          :class="priorityColor[task.priority]"
          @click.stop="emit('taskClick', task)"
        >
          <div class="flex items-start gap-1">
            <span class="shrink-0">{{ taskTypeIcon[task.taskType] }}</span>
            <span class="leading-tight line-clamp-2">{{ task.title }}</span>
          </div>
          <div v-if="task.estimatedTime" class="text-xs opacity-60 mt-1 pl-4">
            {{ task.estimatedTime }}min
          </div>
        </div>

        <div v-if="tasksForDay(day).length === 0" class="h-full flex items-center justify-center">
          <span class="text-xs text-surface-200">+</span>
        </div>
      </div>
    </div>
  </div>
</template>
