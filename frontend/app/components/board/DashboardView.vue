<script setup lang="ts">
import type { Column, Task } from '~/types'

const props = defineProps<{
  tasks: Task[]
  columns: Column[]
}>()

const emit = defineEmits<{
  taskClick: [task: Task]
  addTask: [columnId: string, date: string]
}>()

const today = new Date()
const selectedDate = ref(today.toISOString().split('T')[0])
const showChart = ref(false)

const selectedDateLabel = computed(() => {
  const d = new Date(selectedDate.value + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
})

function toDateOnly(dateStr: string | undefined) {
  if (!dateStr) return ''
  return dateStr.split('T')[0]
}

const tasksForDate = computed(() =>
  props.tasks.filter(t => {
    const d = toDateOnly(t.deadline) || toDateOnly(t.startDate) || toDateOnly(t.createdAt)
    return d === selectedDate.value
  })
)

const priorityColor: Record<string, string> = {
  LOW:    'bg-blue-100 text-blue-700 border-blue-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  HIGH:   'bg-orange-100 text-orange-700 border-orange-200',
  URGENT: 'bg-red-100 text-red-700 border-red-200',
}

const priorityDot: Record<string, string> = {
  LOW: 'bg-blue-400', MEDIUM: 'bg-amber-400', HIGH: 'bg-orange-500', URGENT: 'bg-red-500',
}

const priorityLabel: Record<string, string> = {
  LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente',
}

function columnTitle(columnId: string | undefined) {
  return props.columns.find(c => c.id === columnId)?.title ?? '—'
}

// Chart: tasks por coluna (status)
const chartData = computed(() => {
  const total = props.tasks.length
  if (total === 0) return []
  return props.columns.map(col => {
    const count = props.tasks.filter(t => t.columnId === col.id).length
    return {
      label: col.title,
      count,
      pct: Math.round((count / total) * 100),
    }
  }).filter(d => d.count > 0)
})

const chartColors = [
  'bg-primary-600', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-sky-500', 'bg-orange-500', 'bg-teal-500',
]

const chartTextColors = [
  'text-primary-600', 'text-emerald-600', 'text-amber-600', 'text-rose-600',
  'text-violet-600', 'text-sky-600', 'text-orange-600', 'text-teal-600',
]

const chartBgLight = [
  'bg-surface-50', 'bg-emerald-50', 'bg-amber-50', 'bg-rose-50',
  'bg-violet-50', 'bg-sky-50', 'bg-orange-50', 'bg-teal-50',
]
</script>

<template>
  <div class="flex flex-col h-full bg-surface-50 overflow-hidden">

    <!-- Toolbar -->
    <div class="flex items-center gap-4 px-6 py-3 bg-white border-b border-surface-100 shrink-0">
      <div class="flex items-center gap-2 flex-1">
        <label class="text-xs font-semibold text-surface-500 uppercase tracking-wide shrink-0">Data</label>
        <input
          v-model="selectedDate"
          type="date"
          class="px-3 py-1.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition bg-white"
        />
        <span class="text-sm text-surface-500 capitalize hidden sm:block">{{ selectedDateLabel }}</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-surface-400">{{ tasksForDate.length }} task{{ tasksForDate.length !== 1 ? 's' : '' }} no dia</span>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          :class="showChart ? 'bg-primary-600 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
          @click="showChart = !showChart"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          Gráfico
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white transition shadow-sm"
          @click="emit('addTask', columns[0]?.id ?? '', selectedDate)"
        >
          <span class="text-sm leading-none">+</span> Nova task
        </button>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">

      <!-- Chart panel (sidebar) -->
      <Transition name="slide-right">
        <div v-if="showChart" class="w-72 shrink-0 bg-white border-r border-surface-100 flex flex-col overflow-y-auto">
          <div class="px-5 py-4 border-b border-surface-100">
            <h3 class="text-sm font-semibold text-surface-800">Status das Tasks</h3>
            <p class="text-xs text-surface-400 mt-0.5">{{ tasks.length }} tasks no total</p>
          </div>

          <!-- Donut-style bar chart -->
          <div class="px-5 py-4 space-y-4">

            <!-- Stacked bar -->
            <div class="flex rounded-xl overflow-hidden h-4 gap-px" v-if="chartData.length">
              <div
                v-for="(item, i) in chartData"
                :key="item.label"
                class="transition-all"
                :class="chartColors[i % chartColors.length]"
                :style="{ width: `${item.pct}%` }"
                :title="`${item.label}: ${item.pct}%`"
              />
            </div>
            <div v-else class="h-4 rounded-xl bg-surface-100" />

            <!-- Legend -->
            <div class="space-y-3">
              <div
                v-for="(item, i) in chartData"
                :key="item.label"
                class="flex items-center gap-3"
              >
                <!-- Mini bar -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="chartColors[i % chartColors.length]" />
                      <span class="text-xs font-medium text-surface-700 truncate">{{ item.label }}</span>
                    </div>
                    <span class="text-xs font-bold ml-2 shrink-0" :class="chartTextColors[i % chartTextColors.length]">{{ item.pct }}%</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-surface-100 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="chartColors[i % chartColors.length]"
                      :style="{ width: `${item.pct}%` }"
                    />
                  </div>
                  <p class="text-xs text-surface-400 mt-0.5">{{ item.count }} task{{ item.count !== 1 ? 's' : '' }}</p>
                </div>
              </div>
            </div>

            <!-- Empty -->
            <div v-if="chartData.length === 0" class="text-center py-8">
              <p class="text-sm text-surface-400">Nenhuma task ainda</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Notes grid -->
      <div class="flex-1 overflow-y-auto p-6">

        <!-- Empty state for date -->
        <div v-if="tasksForDate.length === 0" class="flex flex-col items-center justify-center h-full pb-16">
          <div class="w-16 h-16 rounded-2xl bg-white border border-surface-100 flex items-center justify-center mb-4 shadow-sm">
            <svg class="w-7 h-7 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-surface-500">Nenhuma task neste dia</p>
          <p class="text-xs text-surface-400 mt-1">Clique em "Nova task" para adicionar</p>
        </div>

        <!-- Grid of note cards -->
        <div v-else class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))">
          <div
            v-for="task in tasksForDate"
            :key="task.id"
            class="bg-white rounded-2xl border border-surface-100 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all group flex flex-col gap-3"
            @click="emit('taskClick', task)"
          >
            <!-- Top row: type icon + priority badge -->
            <div class="flex items-start justify-between gap-2">
              <span class="w-5 h-5 shrink-0 text-surface-400">
                <svg v-if="task.taskType === 'EXECUTION'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                <svg v-else-if="task.taskType === 'FOCUS'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/></svg>
                <svg v-else-if="task.taskType === 'REVISION'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/></svg>
                <svg v-else-if="task.taskType === 'INSPIRATION'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>
                <svg v-else-if="task.taskType === 'MEETING'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5"/></svg>
                <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
              </span>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full border"
                :class="priorityColor[task.priority]"
              >
                {{ priorityLabel[task.priority] }}
              </span>
            </div>

            <!-- Title -->
            <p class="text-sm font-semibold text-surface-800 group-hover:text-primary-600 transition leading-snug line-clamp-3">
              {{ task.title }}
            </p>

            <!-- Description -->
            <p v-if="task.description" class="text-xs text-surface-400 leading-relaxed line-clamp-3">
              {{ task.description }}
            </p>

            <!-- Footer: column + deadline -->
            <div class="mt-auto pt-2 border-t border-surface-50 flex items-center justify-between gap-2">
              <span class="flex items-center gap-1.5 text-xs text-surface-500 min-w-0">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                <span class="truncate">{{ columnTitle(task.columnId) }}</span>
              </span>
              <span v-if="task.deadline" class="text-xs text-surface-400 shrink-0 font-mono">
                {{ new Date(task.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
