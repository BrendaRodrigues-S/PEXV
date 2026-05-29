<script setup lang="ts">
import type { Task } from '~/types'

const props = defineProps<{
  tasks: Task[]
  columns: { id: string; title: string }[]
}>()

const emit = defineEmits<{
  taskClick: [task: Task]
  addTask: [columnId: string, date: string]
}>()

const today = new Date()
today.setHours(0, 0, 0, 0)

const zoom = ref<'week' | 'month' | 'quarter'>('month')
const offsetDays = ref(0)

const DAY_WIDTH = computed(() => zoom.value === 'week' ? 120 : zoom.value === 'month' ? 40 : 16)
const TOTAL_DAYS = computed(() => zoom.value === 'week' ? 14 : zoom.value === 'month' ? 60 : 120)

const startDate = computed(() => {
  const d = new Date(today)
  d.setDate(d.getDate() - Math.floor(TOTAL_DAYS.value * 0.25) + offsetDays.value)
  return d
})

const days = computed(() => {
  return Array.from({ length: TOTAL_DAYS.value }, (_, i) => {
    const d = new Date(startDate.value)
    d.setDate(d.getDate() + i)
    return d
  })
})

function toMidnight(date: Date | string) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateStr(date: Date) {
  return date.toISOString().split('T')[0]
}

function dayIndex(date: Date | string) {
  const d = toMidnight(date)
  return Math.round((d.getTime() - startDate.value.getTime()) / 86400000)
}

function isToday(date: Date) {
  return toMidnight(date).getTime() === today.getTime()
}

function isWeekend(date: Date) {
  const d = date.getDay()
  return d === 0 || d === 6
}

const todayIndex = computed(() => dayIndex(today))

// Group tasks by column
const tasksByColumn = computed(() => {
  const map: Record<string, Task[]> = {}
  for (const col of props.columns) {
    map[col.id] = props.tasks.filter(t => t.columnId === col.id)
  }
  // tasks without column
  const uncategorized = props.tasks.filter(t => !t.columnId)
  if (uncategorized.length) map['__none__'] = uncategorized
  return map
})

const priorityColor: Record<string, string> = {
  LOW:    'bg-blue-400',
  MEDIUM: 'bg-amber-400',
  HIGH:   'bg-orange-500',
  URGENT: 'bg-red-500',
}

const priorityBg: Record<string, string> = {
  LOW:    'bg-blue-50 border-blue-200 text-blue-800',
  MEDIUM: 'bg-amber-50 border-amber-200 text-amber-800',
  HIGH:   'bg-orange-50 border-orange-200 text-orange-800',
  URGENT: 'bg-red-50 border-red-200 text-red-800',
}

function taskLeft(task: Task) {
  const ref = task.startDate ?? task.createdAt
  if (!ref) return 0
  return dayIndex(ref) * DAY_WIDTH.value
}

function taskWidth(task: Task) {
  const start = task.startDate ?? task.createdAt
  const end = task.deadline
  if (!start || !end) return DAY_WIDTH.value * 1
  const s = toMidnight(start)
  const e = toMidnight(end)
  const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1)
  return diff * DAY_WIDTH.value
}

function formatDay(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit' })
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'short' })
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

function showMonthLabel(date: Date, i: number) {
  return i === 0 || date.getDate() === 1
}

function navigate(dir: number) {
  offsetDays.value += dir * Math.floor(TOTAL_DAYS.value * 0.3)
}

function goToday() {
  offsetDays.value = 0
}

const totalWidth = computed(() => TOTAL_DAYS.value * DAY_WIDTH.value)
const ROW_HEIGHT = 48
const HEADER_HEIGHT = zoom.value === 'week' ? 64 : 52
</script>

<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">

    <!-- Toolbar -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-surface-100 shrink-0">
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 transition"
          @click="goToday"
        >
          Hoje
        </button>
        <div class="flex items-center gap-1">
          <button class="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 transition text-lg" @click="navigate(-1)">‹</button>
          <button class="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 transition text-lg" @click="navigate(1)">›</button>
        </div>
        <span class="text-sm font-semibold text-surface-700">
          {{ days[0]?.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }}
        </span>
      </div>

      <div class="flex items-center gap-1 bg-surface-100 rounded-lg p-0.5">
        <button
          v-for="z in [{ key: 'week', label: 'Semana' }, { key: 'month', label: 'Mês' }, { key: 'quarter', label: 'Trimestre' }]"
          :key="z.key"
          class="px-3 py-1 text-xs font-medium rounded-md transition"
          :class="zoom === z.key ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'"
          @click="zoom = z.key as any"
        >
          {{ z.label }}
        </button>
      </div>

      <div class="flex items-center gap-3 text-xs text-surface-400">
        <span v-for="(label, key) in { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente' }" :key="key" class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full" :class="priorityColor[key]" />
          {{ label }}
        </span>
      </div>
    </div>

    <!-- Timeline -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Left column labels -->
      <div class="w-44 shrink-0 border-r border-surface-100 flex flex-col">
        <!-- Header spacer -->
        <div class="shrink-0 border-b border-surface-100" :style="{ height: '52px' }" />

        <!-- Column rows -->
        <div class="overflow-y-auto flex-1">
          <div
            v-for="col in columns"
            :key="col.id"
            class="border-b border-surface-50 flex items-center px-4 gap-2"
            :style="{ height: `${ROW_HEIGHT + Math.max(0, (tasksByColumn[col.id]?.length ?? 1) - 1) * (ROW_HEIGHT * 0.6)}px`, minHeight: `${ROW_HEIGHT}px` }"
          >
            <span class="w-2 h-2 rounded-full bg-primary-400 shrink-0" />
            <span class="text-xs font-semibold text-surface-600 truncate flex-1">{{ col.title }}</span>
            <button
              class="w-5 h-5 rounded-md flex items-center justify-center text-surface-300 hover:text-primary-600 hover:bg-surface-50 transition text-base leading-none"
              :title="`Nova task em ${col.title}`"
              @click="emit('addTask', col.id, toDateStr(today))"
            >+</button>
          </div>
        </div>
      </div>

      <!-- Scrollable grid -->
      <div class="flex-1 overflow-auto">
        <div :style="{ width: `${totalWidth}px`, minWidth: '100%' }">

          <!-- Day headers -->
          <div class="flex border-b border-surface-100 bg-surface-50 sticky top-0 z-10" style="height: 52px">
            <div
              v-for="(day, i) in days"
              :key="i"
              class="shrink-0 flex flex-col items-center justify-center border-r border-surface-100 relative"
              :style="{ width: `${DAY_WIDTH}px` }"
              :class="[isToday(day) ? 'bg-primary-50' : isWeekend(day) ? 'bg-surface-100/60' : '']"
            >
              <span
                v-if="showMonthLabel(day, i)"
                class="absolute top-1 left-1.5 text-xs font-bold text-surface-500 uppercase tracking-wide"
                style="font-size: 9px"
              >
                {{ formatMonth(day) }}
              </span>
              <span
                class="text-xs font-semibold mt-2 w-6 h-6 flex items-center justify-center rounded-full transition"
                :class="isToday(day) ? 'bg-primary-600 text-white' : 'text-surface-500'"
              >
                {{ formatDay(day) }}
              </span>
              <span v-if="zoom === 'week'" class="text-xs text-surface-300 capitalize" style="font-size: 9px">
                {{ formatWeekday(day) }}
              </span>
            </div>
          </div>

          <!-- Rows per column -->
          <div class="overflow-y-auto">
            <div
              v-for="col in columns"
              :key="col.id"
              class="relative border-b border-surface-50"
              :style="{ height: `${ROW_HEIGHT}px`, minHeight: `${ROW_HEIGHT}px` }"
            >
              <!-- Day grid lines — clickable -->
              <div class="absolute inset-0 flex">
                <div
                  v-for="(day, i) in days"
                  :key="i"
                  class="shrink-0 h-full border-r cursor-pointer"
                  :style="{ width: `${DAY_WIDTH}px` }"
                  :class="[
                    isToday(day) ? 'bg-primary-50/40 border-primary-200 hover:bg-primary-100/40' :
                    isWeekend(day) ? 'bg-surface-50 border-surface-100 hover:bg-surface-100' : 'border-surface-100 hover:bg-surface-50/20'
                  ]"
                  @click="emit('addTask', col.id, toDateStr(day))"
                />
              </div>

              <!-- Today vertical line -->
              <div
                v-if="todayIndex >= 0 && todayIndex < TOTAL_DAYS"
                class="absolute top-0 bottom-0 w-0.5 bg-primary-400 z-10 pointer-events-none"
                :style="{ left: `${todayIndex * DAY_WIDTH + DAY_WIDTH / 2}px` }"
              />

              <!-- Tasks -->
              <div class="absolute inset-0 flex items-center px-0 pointer-events-none">
                <div
                  v-for="task in tasksByColumn[col.id] ?? []"
                  :key="task.id"
                  class="absolute pointer-events-auto cursor-pointer flex items-center gap-1.5 rounded-lg border text-xs font-medium px-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all overflow-hidden"
                  :class="priorityBg[task.priority] ?? 'bg-surface-100 border-surface-200 text-surface-700'"
                  :style="{
                    left: `${taskLeft(task)}px`,
                    width: `${Math.max(taskWidth(task) - 4, 20)}px`,
                    height: '32px',
                    top: '8px',
                  }"
                  @click="emit('taskClick', task)"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="priorityColor[task.priority]" />
                  <span class="truncate">{{ task.title }}</span>
                  <span v-if="task.deadline && zoom !== 'quarter'" class="ml-auto shrink-0 opacity-60" style="font-size: 9px">
                    {{ new Date(task.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>
