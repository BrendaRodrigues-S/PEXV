<script setup lang="ts">
import type { Task } from '~/types'

const props = defineProps<{
  tasks: Task[]
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  taskClick: [task: Task]
}>()

const today = new Date()
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
)

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

function goToday() {
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
}

function toMidnight(d: Date | string) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  return date
}

function isToday(d: Date) {
  return toMidnight(d).getTime() === toMidnight(today).getTime()
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

type TaskEvent = {
  task: Task
  type: 'deadline' | 'created' | 'start'
  dateStr: string
  time: string
  day: Date
}

const groupedEvents = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const all: TaskEvent[] = []

  for (const task of props.tasks) {
    const add = (dateStr: string | undefined, type: TaskEvent['type']) => {
      if (!dateStr) return
      const d = new Date(dateStr)
      if (d.getFullYear() === year && d.getMonth() === month) {
        all.push({ task, type, dateStr, time: formatTime(dateStr), day: new Date(year, month, d.getDate()) })
      }
    }
    add(task.deadline, 'deadline')
    add(task.startDate, 'start')
    add(task.createdAt, 'created')
  }

  all.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())

  // group by day number
  const groups: { day: Date; events: TaskEvent[] }[] = []
  for (const evt of all) {
    const last = groups[groups.length - 1]
    if (last && toMidnight(last.day).getTime() === toMidnight(evt.day).getTime()) {
      last.events.push(evt)
    } else {
      groups.push({ day: evt.day, events: [evt] })
    }
  }

  return groups
})

const totalEvents = computed(() => groupedEvents.value.reduce((s, g) => s + g.events.length, 0))

const priorityColor: Record<string, string> = {
  LOW:    'bg-blue-400',
  MEDIUM: 'bg-amber-400',
  HIGH:   'bg-orange-500',
  URGENT: 'bg-red-500',
}

const priorityLabel: Record<string, string> = {
  LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente',
}

const eventTypeConfig: Record<string, { label: string; bg: string; border: string; dot: string; text: string }> = {
  deadline: { label: 'Prazo',  bg: 'bg-red-50',     border: 'border-red-200',    dot: 'bg-red-400',     text: 'text-red-600' },
  start:    { label: 'Início', bg: 'bg-green-50',   border: 'border-green-200',  dot: 'bg-green-400',   text: 'text-green-600' },
  created:  { label: 'Criada', bg: 'bg-surface-50', border: 'border-surface-200',dot: 'bg-surface-300', text: 'text-surface-400' },
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="open" class="fixed inset-0 z-50 flex flex-col">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="emit('close')" />

        <!-- Panel -->
        <div class="relative mt-auto bg-white rounded-t-3xl shadow-2xl flex flex-col" style="height: 85vh">

          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-1 shrink-0">
            <div class="w-10 h-1 rounded-full bg-surface-200" />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-3 border-b border-surface-100 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-surface-900">Linha Temporal Mensal</h2>
                <p class="text-xs text-surface-400">{{ totalEvents }} evento{{ totalEvents !== 1 ? 's' : '' }}</p>
              </div>
            </div>

            <!-- Month nav -->
            <div class="flex items-center gap-1">
              <button class="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 transition" @click="prevMonth">‹</button>
              <button
                class="px-3 py-1 text-xs font-semibold rounded-lg capitalize min-w-0"
                :class="currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear() ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
                @click="goToday"
              >{{ monthLabel }}</button>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 transition" @click="nextMonth">›</button>
            </div>

            <button class="w-8 h-8 rounded-xl flex items-center justify-center text-surface-400 hover:bg-surface-100 transition shrink-0" @click="emit('close')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Scrollable list -->
          <div class="flex-1 overflow-y-auto px-6 py-4">

            <!-- Empty state -->
            <div v-if="totalEvents === 0" class="flex flex-col items-center justify-center h-full pb-16">
              <div class="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-surface-500 capitalize">Nenhuma atividade em {{ monthLabel }}</p>
              <p class="text-xs text-surface-400 mt-1">Tasks com prazos ou datas de início aparecerão aqui</p>
            </div>

            <!-- Day groups -->
            <div v-for="group in groupedEvents" :key="group.day.getDate()" class="mb-6">

              <!-- Day label -->
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm"
                  :class="isToday(group.day) ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-700'"
                >
                  <span class="text-xs font-bold leading-none" style="font-size: 9px">
                    {{ group.day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase() }}
                  </span>
                  <span class="text-base font-bold leading-tight">{{ group.day.getDate() }}</span>
                </div>
                <div class="flex-1 h-px bg-surface-100" />
                <span class="text-xs text-surface-400">{{ group.events.length }} evento{{ group.events.length !== 1 ? 's' : '' }}</span>
              </div>

              <!-- Events for this day -->
              <div class="space-y-2 pl-1">
                <div
                  v-for="(evt, i) in group.events"
                  :key="i"
                  class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-all group"
                  :class="`${eventTypeConfig[evt.type].bg} ${eventTypeConfig[evt.type].border}`"
                  @click="emit('taskClick', evt.task)"
                >
                  <!-- Time -->
                  <div class="shrink-0 flex flex-col items-center pt-0.5">
                    <span class="font-mono font-semibold text-surface-600" style="font-size: 11px">{{ evt.time }}</span>
                  </div>

                  <!-- Divider -->
                  <div class="w-px self-stretch shrink-0" :class="eventTypeConfig[evt.type].border" />

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 mb-1">
                      <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="eventTypeConfig[evt.type].dot" />
                      <span class="text-xs font-semibold" :class="eventTypeConfig[evt.type].text">{{ eventTypeConfig[evt.type].label }}</span>
                    </div>
                    <p class="text-sm font-medium text-surface-800 group-hover:text-primary-600 transition leading-snug truncate">
                      {{ evt.task.title }}
                    </p>
                    <div class="flex items-center gap-1.5 mt-1">
                      <span class="w-1.5 h-1.5 rounded-full" :class="priorityColor[evt.task.priority]" />
                      <span class="text-xs text-surface-400">{{ priorityLabel[evt.task.priority] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
