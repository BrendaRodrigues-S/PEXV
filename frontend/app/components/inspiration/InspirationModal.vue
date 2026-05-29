<script setup lang="ts">
import type { Inspiration } from '~/types'

const props = defineProps<{
  open: boolean
  workspaceId: string
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<Inspiration>]
}>()

const form = reactive({ title: '', imageUrl: '', sourceUrl: '', category: '' })

watch(() => props.open, (open) => {
  if (open) Object.assign(form, { title: '', imageUrl: '', sourceUrl: '', category: '' })
})

function submit() {
  if (!form.title.trim() || !form.imageUrl.trim()) return
  emit('save', { ...form, workspaceId: props.workspaceId })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="emit('close')" />
        <div class="relative bg-white rounded-2xl shadow-soft w-full max-w-md">

          <div class="flex items-center justify-between p-6 border-b border-surface-100">
            <h2 class="text-base font-semibold text-surface-900">Adicionar inspiração</h2>
            <button class="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 transition" @click="emit('close')">✕</button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="submit">
            <div>
              <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Título *</label>
              <input v-model="form.title" type="text" required autofocus
                class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
                placeholder="Nome da referência" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">URL da imagem *</label>
              <input v-model="form.imageUrl" type="url" required
                class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
                placeholder="https://..." />
            </div>

            <!-- Preview -->
            <div v-if="form.imageUrl" class="rounded-xl overflow-hidden border border-surface-100 h-40 bg-surface-50">
              <img :src="form.imageUrl" :alt="form.title" class="w-full h-full object-cover" @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Fonte <span class="text-surface-300 font-normal">(opcional)</span></label>
              <input v-model="form.sourceUrl" type="url"
                class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
                placeholder="https://dribbble.com/..." />
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Categoria <span class="text-surface-300 font-normal">(opcional)</span></label>
              <input v-model="form.category" type="text"
                class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
                placeholder="Ex: Tipografia, Paletas, UI..." />
            </div>

            <div class="flex gap-3 justify-end pt-2">
              <button type="button" class="px-4 py-2 text-sm text-surface-400 hover:text-surface-600 transition" @click="emit('close')">Cancelar</button>
              <button type="submit" class="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition">
                Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
