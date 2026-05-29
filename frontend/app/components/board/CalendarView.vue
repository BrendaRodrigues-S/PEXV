<script setup lang="ts">
import type { Task } from '~/types'

const props = defineProps<{
  tasks: Task[]
  columns: { id: string; title: string }[]
}>()

const emit = defineEmits<{
  taskClick: [task: Task]
  dayClick: [date: string]
}>()

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
)

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}

function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

function goToday() {
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
}

const days = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { date: Date; isCurrentMonth: boolean }[] = []

  // padding days from prev month
  const startPad = firstDay === 0 ? 6 : firstDay - 1
  for (let i = startPad - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), isCurrentMonth: false })
  }

  // current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }

  // padding days from next month
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
  }

  return cells
})

function toDateStr(date: Date) {
  return date.toISOString().split('T')[0]
}

function isToday(date: Date) {
  return toDateStr(date) === toDateStr(today)
}

function tasksForDay(date: Date) {
  const dateStr = toDateStr(date)
  return props.tasks.filter(t => {
    const deadline = t.deadline ? toDateStr(new Date(t.deadline)) : null
    const startDate = t.startDate ? toDateStr(new Date(t.startDate)) : null
    return deadline === dateStr || startDate === dateStr
  })
}

const priorityColor: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700 border-blue-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  URGENT: 'bg-red-100 text-red-700 border-red-200',
}

const priorityDot: Record<string, string> = {
  LOW: 'bg-blue-400',
  MEDIUM: 'bg-amber-400',
  HIGH: 'bg-orange-400',
  URGENT: 'bg-red-500',
}

function columnTitle(columnId?: string | null) {
  return props.columns.find(c => c.id === columnId)?.title ?? ''
}
</script>

<template>
  <div class="flex flex-col h-full select-none">
    <!-- Calendar header -->
    <div class="flex items-center justify-between px-8 py-4 bg-white border-b border-surface-100 shrink-0">
      <div class="flex items-center gap-3">
        <button
          class="px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-lg transition"
          @click="goToday"
        >
          Hoje
        </button>
        <div class="flex items-center gap-1">
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition"
            @click="prevMonth"
          >
            ‹
          </button>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition"
            @click="nextMonth"
          >
            ›
          </button>
        </div>
        <h2 class="text-base font-semibold text-surface-900 capitalize">{{ monthName }}</h2>
      </div>
      <div class="flex items-center gap-3 text-xs text-surface-400">
        <span v-for="(label, key) in { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente' }" :key="key" class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full" :class="priorityDot[key]" />
          {{ label }}
        </span>
      </div>
    </div>

    <!-- Weekday labels -->
    <div class="grid grid-cols-7 border-b border-surface-100 bg-surface-50 shrink-0">
      <div
        v-for="day in ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']"
        :key="day"
        class="py-2 text-center text-xs font-semibold text-surface-400 uppercase tracking-widest"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="flex-1 grid grid-cols-7 grid-rows-6 overflow-hidden">
      <div
        v-for="(cell, i) in days"
        :key="i"
        class="border-r border-b border-surface-100 p-1.5 overflow-hidden flex flex-col cursor-pointer transition-colors group"
        :class="[
          !cell.isCurrentMonth ? 'bg-surface-50/60' : 'bg-white hover:bg-surface-50/30',
          isToday(cell.date) ? 'bg-primary-50/50' : '',
        ]"
        @click="emit('dayClick', toDateStr(cell.date))"
      >
        <!-- Day number -->
        <div class="flex items-center justify-between mb-1">
          <span
            class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition"
            :class="[
              isToday(cell.date)
                ? 'bg-primary-600 text-white'
                : cell.isCurrentMonth
                  ? 'text-surface-700 group-hover:bg-surface-100 group-hover:text-primary-600'
                  : 'text-surface-300',
            ]"
          >
            {{ cell.date.getDate() }}
          </span>
          <span
            v-if="tasksForDay(cell.date).length > 0"
            class="text-xs text-surface-300 font-medium"
          >
            {{ tasksForDay(cell.date).length }}
          </span>
        </div>

        <!-- Tasks -->
        <div class="flex flex-col gap-0.5 overflow-hidden">
          <button
            v-for="task in tasksForDay(cell.date).slice(0, 3)"
            :key="task.id"
            class="w-full text-left px-1.5 py-0.5 rounded-md text-xs font-medium border truncate transition hover:opacity-80"
            :class="priorityColor[task.priority] ?? 'bg-surface-100 text-surface-600 border-surface-200'"
            @click.stop="emit('taskClick', task)"
          >
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="priorityDot[task.priority]" />
              <span class="truncate">{{ task.title }}</span>
            </span>
          </button>
          <span
            v-if="tasksForDay(cell.date).length > 3"
            class="text-xs text-surface-400 pl-1"
          >
            +{{ tasksForDay(cell.date).length - 3 }} mais
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
