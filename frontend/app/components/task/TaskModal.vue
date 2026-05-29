<script setup lang="ts">
import type { Column, LayoutType, Task } from '~/types'

const props = defineProps<{
  open: boolean
  boardId: string
  layoutType?: LayoutType
  columns: Column[]
  task?: Task | null
  defaultDate?: string
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<Task>]
  delete: [id: string]
}>()

const form = reactive({
  title: '',
  description: '',
  columnId: '',
  taskType: 'EXECUTION' as Task['taskType'],
  priority: 'MEDIUM' as Task['priority'],
  startDate: '',
  deadline: '',
  estimatedTime: '' as string | number,
})

const descOpen = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    descOpen.value = false
    if (props.task) {
      form.title       = props.task.title
      form.description = props.task.description ?? ''
      form.columnId    = props.task.columnId ?? ''
      form.taskType    = props.task.taskType
      form.priority    = props.task.priority
      form.startDate   = props.task.startDate ? props.task.startDate.slice(0, 10) : ''
      form.deadline    = props.task.deadline  ? props.task.deadline.slice(0, 10)  : ''
      form.estimatedTime = props.task.estimatedTime ?? ''
      if (form.description) descOpen.value = true
    } else {
      form.title       = ''
      form.description = ''
      form.columnId    = props.columns[0]?.id ?? ''
      form.taskType    = 'EXECUTION'
      form.priority    = 'MEDIUM'
      form.startDate   = props.defaultDate ?? ''
      form.deadline    = props.defaultDate ?? ''
      form.estimatedTime = ''
    }
  },
  { immediate: true },
)

function submit() {
  if (!form.title.trim()) return
  emit('save', {
    title:         form.title.trim(),
    description:   form.description || undefined,
    columnId:      form.columnId || undefined,
    taskType:      form.taskType,
    priority:      form.priority,
    startDate:     form.startDate ? new Date(form.startDate + 'T12:00:00').toISOString() : undefined,
    deadline:      form.deadline  ? new Date(form.deadline  + 'T12:00:00').toISOString() : undefined,
    estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : undefined,
  })
}

// duration in days between startDate and deadline
const durationDays = computed(() => {
  if (!form.startDate || !form.deadline) return null
  const diff = new Date(form.deadline).getTime() - new Date(form.startDate).getTime()
  const days = Math.round(diff / 86400000)
  return days >= 0 ? days + 1 : null
})

const taskTypes: { value: Task['taskType']; label: string; icon: string }[] = [
  { value: 'EXECUTION',   label: 'Execução',   icon: '⚡' },
  { value: 'FOCUS',       label: 'Foco',       icon: '🎯' },
  { value: 'REVISION',    label: 'Revisão',    icon: '🔍' },
  { value: 'INSPIRATION', label: 'Inspiração', icon: '💡' },
  { value: 'MEETING',     label: 'Reunião',    icon: '📅' },
  { value: 'CLIENT',      label: 'Cliente',    icon: '👤' },
]

const priorities: { value: Task['priority']; label: string; dot: string; ring: string }[] = [
  { value: 'LOW',    label: 'Baixa',   dot: 'bg-blue-400',   ring: 'ring-blue-300' },
  { value: 'MEDIUM', label: 'Média',   dot: 'bg-amber-400',  ring: 'ring-amber-300' },
  { value: 'HIGH',   label: 'Alta',    dot: 'bg-orange-500', ring: 'ring-orange-300' },
  { value: 'URGENT', label: 'Urgente', dot: 'bg-red-500',    ring: 'ring-red-300' },
]

const inputCls = 'w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition bg-white'
const labelCls = 'block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5'
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-black/25 backdrop-blur-sm" @click="emit('close')" />

        <div class="relative bg-white w-full sm:rounded-2xl sm:max-w-md rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

          <!-- Handle (mobile) -->
          <div class="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
            <div class="w-10 h-1 rounded-full bg-surface-200" />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-surface-100 shrink-0">
            <div class="flex items-center gap-2.5">
              <!-- Layout icon -->
              <span class="w-4 h-4 shrink-0 text-surface-500">
                <svg v-if="layoutType === 'KANBAN'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>
                <svg v-else-if="layoutType === 'CALENDAR'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5"/></svg>
                <svg v-else-if="layoutType === 'TIMELINE'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>
                <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"/></svg>
              </span>
              <h2 class="text-sm font-semibold text-surface-900">
                {{ task ? 'Editar task' : 'Nova task' }}
              </h2>
            </div>
            <button class="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 transition" @click="emit('close')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Form -->
          <form class="overflow-y-auto flex-1" @submit.prevent="submit">
            <div class="px-6 py-5 space-y-4">

              <!-- TITLE — all layouts -->
              <div>
                <label :class="labelCls">Título</label>
                <input v-model="form.title" type="text" required autofocus :class="inputCls" placeholder="Nome da task..." />
              </div>

              <!-- ───── KANBAN ───── -->
              <template v-if="layoutType === 'KANBAN'">
                <!-- Column -->
                <div>
                  <label :class="labelCls">Coluna</label>
                  <select v-model="form.columnId" :class="inputCls">
                    <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.title }}</option>
                  </select>
                </div>

                <!-- Type -->
                <div>
                  <label :class="labelCls">Tipo</label>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="t in taskTypes" :key="t.value" type="button"
                      class="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition"
                      :class="form.taskType === t.value ? 'border-primary-400 bg-surface-50 text-primary-600' : 'border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-50'"
                      @click="form.taskType = t.value"
                    >
                      <span class="text-base">{{ t.icon }}</span>
                      {{ t.label }}
                    </button>
                  </div>
                </div>

                <!-- Priority -->
                <div>
                  <label :class="labelCls">Prioridade</label>
                  <div class="flex gap-2">
                    <button
                      v-for="p in priorities" :key="p.value" type="button"
                      class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition"
                      :class="form.priority === p.value ? `border-transparent bg-surface-900 text-white ring-2 ${p.ring}` : 'border-surface-200 text-surface-500 hover:border-surface-300'"
                      @click="form.priority = p.value"
                    >
                      <span class="w-2 h-2 rounded-full" :class="p.dot" />
                      {{ p.label }}
                    </button>
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <label :class="labelCls">Descrição</label>
                  <textarea v-model="form.description" rows="3" :class="inputCls" placeholder="Detalhes opcionais..." class="resize-none" />
                </div>

                <!-- Estimated time -->
                <div>
                  <label :class="labelCls">Tempo estimado (min)</label>
                  <input v-model="form.estimatedTime" type="number" min="0" :class="inputCls" placeholder="Ex: 60" />
                </div>
              </template>

              <!-- ───── CALENDAR ───── -->
              <template v-else-if="layoutType === 'CALENDAR'">
                <!-- Priority -->
                <div>
                  <label :class="labelCls">Prioridade</label>
                  <div class="flex gap-2">
                    <button
                      v-for="p in priorities" :key="p.value" type="button"
                      class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition"
                      :class="form.priority === p.value ? `border-transparent bg-surface-900 text-white ring-2 ${p.ring}` : 'border-surface-200 text-surface-500 hover:border-surface-300'"
                      @click="form.priority = p.value"
                    >
                      <span class="w-2 h-2 rounded-full" :class="p.dot" />
                      {{ p.label }}
                    </button>
                  </div>
                </div>

                <!-- Dates side by side with visual accent -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-surface-50 rounded-xl p-3 border border-surface-100">
                    <label class="block text-xs font-semibold text-surface-400 mb-1.5">Início</label>
                    <input v-model="form.startDate" type="date" class="w-full text-sm font-medium text-surface-800 bg-transparent focus:outline-none" />
                  </div>
                  <div class="bg-surface-50 rounded-xl p-3 border border-primary-100">
                    <label class="block text-xs font-semibold text-primary-600 mb-1.5">Prazo</label>
                    <input v-model="form.deadline" type="date" class="w-full text-sm font-medium text-primary-600 bg-transparent focus:outline-none" />
                  </div>
                </div>

                <!-- Column -->
                <div>
                  <label :class="labelCls">Coluna</label>
                  <select v-model="form.columnId" :class="inputCls">
                    <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.title }}</option>
                  </select>
                </div>

                <!-- Description -->
                <div>
                  <label :class="labelCls">Descrição</label>
                  <textarea v-model="form.description" rows="2" :class="inputCls" placeholder="Detalhes opcionais..." class="resize-none" />
                </div>
              </template>

              <!-- ───── TIMELINE ───── -->
              <template v-else-if="layoutType === 'TIMELINE'">
                <!-- Column -->
                <div>
                  <label :class="labelCls">Coluna</label>
                  <select v-model="form.columnId" :class="inputCls">
                    <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.title }}</option>
                  </select>
                </div>

                <!-- Date range with duration badge -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label :class="labelCls" class="mb-0">Período</label>
                    <span v-if="durationDays !== null" class="text-xs font-semibold text-primary-600 bg-surface-50 px-2 py-0.5 rounded-full">
                      {{ durationDays }} dia{{ durationDays !== 1 ? 's' : '' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-surface-50 rounded-xl p-3 border border-surface-100">
                      <p class="text-xs text-surface-400 mb-1">Início</p>
                      <input v-model="form.startDate" type="date" class="w-full text-sm font-medium text-surface-800 bg-transparent focus:outline-none" />
                    </div>
                    <svg class="w-4 h-4 text-surface-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                    <div class="flex-1 bg-surface-50 rounded-xl p-3 border border-primary-100">
                      <p class="text-xs text-primary-600 mb-1">Fim</p>
                      <input v-model="form.deadline" type="date" class="w-full text-sm font-medium text-primary-600 bg-transparent focus:outline-none" />
                    </div>
                  </div>
                  <!-- Duration bar -->
                  <div v-if="durationDays !== null" class="mt-2 h-1.5 rounded-full bg-surface-100 overflow-hidden">
                    <div class="h-full rounded-full bg-primary-400 transition-all" :style="{ width: `${Math.min(durationDays / 30 * 100, 100)}%` }" />
                  </div>
                </div>

                <!-- Priority -->
                <div>
                  <label :class="labelCls">Prioridade</label>
                  <div class="flex gap-2">
                    <button
                      v-for="p in priorities" :key="p.value" type="button"
                      class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition"
                      :class="form.priority === p.value ? `border-transparent bg-surface-900 text-white ring-2 ${p.ring}` : 'border-surface-200 text-surface-500 hover:border-surface-300'"
                      @click="form.priority = p.value"
                    >
                      <span class="w-2 h-2 rounded-full" :class="p.dot" />
                      {{ p.label }}
                    </button>
                  </div>
                </div>

                <!-- Description collapsible -->
                <div>
                  <button type="button" class="flex items-center gap-1.5 text-xs font-semibold text-surface-400 hover:text-surface-600 transition mb-2" @click="descOpen = !descOpen">
                    <svg class="w-3.5 h-3.5 transition-transform" :class="descOpen ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                    {{ descOpen ? 'Ocultar descrição' : 'Adicionar descrição' }}
                  </button>
                  <textarea v-if="descOpen" v-model="form.description" rows="2" :class="inputCls" placeholder="Detalhes..." class="resize-none" />
                </div>
              </template>

              <!-- ───── DASHBOARD / default ───── -->
              <template v-else>
                <!-- Description -->
                <div>
                  <label :class="labelCls">Descrição</label>
                  <textarea v-model="form.description" rows="3" :class="inputCls" placeholder="Detalhes, contexto, links..." class="resize-none" />
                </div>

                <!-- Column -->
                <div>
                  <label :class="labelCls">Coluna</label>
                  <select v-model="form.columnId" :class="inputCls">
                    <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.title }}</option>
                  </select>
                </div>

                <!-- Type + Priority -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label :class="labelCls">Tipo</label>
                    <select v-model="form.taskType" :class="inputCls">
                      <option v-for="t in taskTypes" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
                    </select>
                  </div>
                  <div>
                    <label :class="labelCls">Prioridade</label>
                    <select v-model="form.priority" :class="inputCls">
                      <option v-for="p in priorities" :key="p.value" :value="p.value">{{ p.label }}</option>
                    </select>
                  </div>
                </div>

                <!-- Dates -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-surface-50 rounded-xl p-3 border border-surface-100">
                    <label class="block text-xs font-semibold text-surface-400 mb-1.5">Início</label>
                    <input v-model="form.startDate" type="date" class="w-full text-sm font-medium text-surface-800 bg-transparent focus:outline-none" />
                  </div>
                  <div class="bg-surface-50 rounded-xl p-3 border border-primary-100">
                    <label class="block text-xs font-semibold text-primary-600 mb-1.5">Prazo</label>
                    <input v-model="form.deadline" type="date" class="w-full text-sm font-medium text-primary-600 bg-transparent focus:outline-none" />
                  </div>
                </div>

                <!-- Estimated time -->
                <div>
                  <label :class="labelCls">Tempo estimado (min)</label>
                  <input v-model="form.estimatedTime" type="number" min="0" :class="inputCls" placeholder="Ex: 60" />
                </div>
              </template>

            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-surface-100 shrink-0 bg-white">
              <button
                v-if="task"
                type="button"
                class="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition"
                @click="emit('delete', task.id)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Excluir
              </button>
              <div v-else />

              <div class="flex gap-2">
                <button type="button" class="px-4 py-2 text-sm text-surface-500 hover:text-surface-700 font-medium transition rounded-xl hover:bg-surface-100" @click="emit('close')">
                  Cancelar
                </button>
                <button type="submit" class="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
                  {{ task ? 'Salvar' : 'Criar task' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
