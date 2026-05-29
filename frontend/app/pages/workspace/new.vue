<script setup lang="ts">
import type { LayoutType, WorkspaceType } from '~/types'

definePageMeta({ middleware: 'auth' })

const workspaceStore = useWorkspaceStore()

const step = ref<1 | 2 | 3>(1)
const loading = ref(false)
const error = ref('')

const form = reactive({
  workspaceType: '' as WorkspaceType | '',
  name: '',
  description: '',
})

// Template previews (mirrors backend TEMPLATES)
const templates: Record<WorkspaceType, { label: string; description: string; icon: string; color: string; boards: { title: string; layoutType: LayoutType; columns: string[] }[] }> = {
  CREATIVE_ROUTINE: {
    label: 'Rotina Criativa',
    description: 'Hábitos, blocos de foco e controlo de energia mental.',
    icon: '🧠',
    color: 'from-violet-50 to-purple-50 border-violet-200',
    boards: [
      { title: 'Rotina Semanal', layoutType: 'KANBAN', columns: ['Para Fazer', 'Em Foco', 'Bloqueado', 'Concluído'] },
      { title: 'Blocos de Energia', layoutType: 'CALENDAR', columns: ['Alta Energia', 'Energia Média', 'Repouso Criativo'] },
    ],
  },
  CLIENT_PROJECT: {
    label: 'Projeto de Cliente',
    description: 'Sprints de entrega, colunas de aprovação e prazos.',
    icon: '💼',
    color: 'from-blue-50 to-sky-50 border-blue-200',
    boards: [
      { title: 'Pipeline do Projeto', layoutType: 'KANBAN', columns: ['Briefing', 'Pesquisa', 'Criação', 'Revisão', 'Entrega'] },
    ],
  },
  FULL_MANAGEMENT: {
    label: 'Gestão Completa',
    description: 'Ecossistema total interligando todas as funcionalidades.',
    icon: '⚡',
    color: 'from-amber-50 to-orange-50 border-amber-200',
    boards: [
      { title: 'Pipeline de Projetos', layoutType: 'KANBAN', columns: ['Briefing', 'Pesquisa', 'Criação', 'Revisão', 'Entrega'] },
      { title: 'Rotina Semanal', layoutType: 'KANBAN', columns: ['Para Fazer', 'Em Foco', 'Revisão', 'Concluído'] },
      { title: 'Agenda Criativa', layoutType: 'CALENDAR', columns: ['Manhã', 'Tarde', 'Noite'] },
    ],
  },
  CUSTOM: {
    label: 'Personalizado',
    description: 'Crie do zero com a sua estrutura.',
    icon: '✏️',
    color: 'from-surface-50 to-slate-50 border-surface-200',
    boards: [],
  },
}

const selectedTemplate = computed(() =>
  form.workspaceType ? templates[form.workspaceType] : null,
)

const layoutIcon: Record<LayoutType, string> = {
  KANBAN: '📋',
  CALENDAR: '📅',
  TIMELINE: '📊',
  DASHBOARD: '⚡',
}

function selectType(type: WorkspaceType) {
  form.workspaceType = type
  step.value = 2
}

function back() {
  if (step.value === 2) { step.value = 1; return }
  if (step.value === 3) { step.value = 2 }
}

async function submit() {
  if (!form.name.trim() || !form.workspaceType) return
  error.value = ''
  loading.value = true
  try {
    const ws = await workspaceStore.createWorkspace({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      workspaceType: form.workspaceType,
    })
    navigateTo(`/workspace/${ws.id}`)
  } catch (e: any) {
    error.value = e.message ?? 'Erro ao criar workspace'
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30 p-8">
    <div class="max-w-3xl mx-auto">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-10">
        <NuxtLink to="/dashboard" class="text-surface-400 hover:text-surface-600 transition text-sm">
          ← Dashboard
        </NuxtLink>
        <div class="flex-1" />
        <!-- Step indicator -->
        <div class="flex items-center gap-2">
          <div
            v-for="s in [1, 2, 3]"
            :key="s"
            class="flex items-center gap-2"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
              :class="step >= s ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-400'"
            >
              {{ s }}
            </div>
            <div v-if="s < 3" class="w-8 h-px" :class="step > s ? 'bg-primary-400' : 'bg-surface-200'" />
          </div>
        </div>
      </div>

      <!-- STEP 1 — Choose type -->
      <Transition name="slide" mode="out-in">
        <div v-if="step === 1" key="step1">
          <h1 class="text-2xl font-semibold text-surface-900 mb-2">Qual é o objetivo deste workspace?</h1>
          <p class="text-surface-400 text-sm mb-8">A estrutura inicial será gerada automaticamente com base na sua escolha.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              v-for="(tpl, type) in templates"
              :key="type"
              class="text-left p-5 rounded-2xl border-2 bg-gradient-to-br transition-all hover:shadow-soft hover:-translate-y-0.5 group"
              :class="tpl.color"
              @click="selectType(type as WorkspaceType)"
            >
              <div class="text-3xl mb-3">{{ tpl.icon }}</div>
              <h3 class="font-semibold text-surface-900 mb-1 group-hover:text-primary-600 transition">{{ tpl.label }}</h3>
              <p class="text-sm text-surface-500">{{ tpl.description }}</p>

              <div v-if="tpl.boards.length" class="mt-4 space-y-1">
                <div
                  v-for="board in tpl.boards"
                  :key="board.title"
                  class="flex items-center gap-2 text-xs text-surface-400"
                >
                  <span>{{ layoutIcon[board.layoutType] }}</span>
                  <span>{{ board.title }}</span>
                  <span class="text-surface-300">· {{ board.columns.length }} colunas</span>
                </div>
              </div>
              <div v-else class="mt-4 text-xs text-surface-400">Estrutura livre — você define</div>
            </button>
          </div>
        </div>
      </Transition>

      <!-- STEP 2 — Name + description -->
      <Transition name="slide" mode="out-in">
        <div v-if="step === 2" key="step2">
          <div class="flex items-center gap-3 mb-8">
            <span class="text-3xl">{{ selectedTemplate?.icon }}</span>
            <div>
              <h1 class="text-2xl font-semibold text-surface-900">{{ selectedTemplate?.label }}</h1>
              <p class="text-surface-400 text-sm">{{ selectedTemplate?.description }}</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-card space-y-5">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1.5">Nome do workspace</label>
              <input
                v-model="form.name"
                type="text"
                autofocus
                class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                placeholder="Ex: Clientes 2025, Projetos Pessoais..."
                @keyup.enter="form.name.trim() && (step = 3)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1.5">Descrição <span class="text-surface-300">(opcional)</span></label>
              <textarea
                v-model="form.description"
                rows="2"
                class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition resize-none"
                placeholder="Para que serve este workspace?"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button class="px-5 py-2.5 text-sm text-surface-500 hover:text-surface-700 font-medium transition" @click="back">
              ← Voltar
            </button>
            <button
              :disabled="!form.name.trim()"
              class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-xl text-sm transition disabled:opacity-50"
              @click="step = 3"
            >
              Ver estrutura →
            </button>
          </div>
        </div>
      </Transition>

      <!-- STEP 3 — Preview + confirm -->
      <Transition name="slide" mode="out-in">
        <div v-if="step === 3" key="step3">
          <h1 class="text-2xl font-semibold text-surface-900 mb-1">Confirmar estrutura</h1>
          <p class="text-surface-400 text-sm mb-8">Isso será criado automaticamente. Você pode personalizar depois.</p>

          <!-- Workspace preview card -->
          <div class="bg-white rounded-2xl p-6 shadow-card mb-5">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-base">
                {{ form.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-surface-900">{{ form.name }}</p>
                <p v-if="form.description" class="text-sm text-surface-400">{{ form.description }}</p>
              </div>
              <span class="ml-auto text-2xl">{{ selectedTemplate?.icon }}</span>
            </div>

            <div v-if="selectedTemplate?.boards.length" class="space-y-3">
              <p class="text-xs font-semibold text-surface-400 uppercase tracking-wide">Boards gerados</p>
              <div
                v-for="board in selectedTemplate.boards"
                :key="board.title"
                class="border border-surface-100 rounded-xl p-4"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span>{{ layoutIcon[board.layoutType] }}</span>
                  <span class="font-medium text-sm text-surface-800">{{ board.title }}</span>
                  <span class="text-xs text-surface-300 ml-auto">{{ board.layoutType }}</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="col in board.columns"
                    :key="col"
                    class="text-xs bg-surface-100 text-surface-500 px-2.5 py-1 rounded-full"
                  >
                    {{ col }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="text-sm text-surface-400 text-center py-4">
              Workspace vazio — você adiciona os boards que quiser.
            </div>
          </div>

          <p v-if="error" class="text-red-500 text-sm mb-3">{{ error }}</p>

          <div class="flex gap-3">
            <button class="px-5 py-2.5 text-sm text-surface-500 hover:text-surface-700 font-medium transition" @click="back">
              ← Voltar
            </button>
            <button
              :disabled="loading"
              class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60"
              @click="submit"
            >
              {{ loading ? 'Criando workspace...' : '✨ Criar workspace' }}
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
