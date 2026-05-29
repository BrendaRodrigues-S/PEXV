<script setup lang="ts">
import type { Client } from '~/types'

const props = defineProps<{
  open: boolean
  workspaceId: string
  client?: Client | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<Client>]
  delete: [id: string]
}>()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  notes: '',
})

watch(() => props.open, (open) => {
  if (!open) return
  if (props.client) {
    form.name = props.client.name
    form.email = props.client.email
    form.phone = props.client.phone ?? ''
    form.company = props.client.company ?? ''
    form.notes = props.client.notes ?? ''
  } else {
    Object.assign(form, { name: '', email: '', phone: '', company: '', notes: '' })
  }
}, { immediate: true })

function submit() {
  if (!form.name.trim() || !form.email.trim()) return
  emit('save', { ...form, workspaceId: props.workspaceId })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="emit('close')" />
        <div class="relative bg-white rounded-2xl shadow-soft w-full max-w-md max-h-[90vh] overflow-y-auto">

          <div class="flex items-center justify-between p-6 border-b border-surface-100">
            <h2 class="text-base font-semibold text-surface-900">
              {{ client ? 'Editar cliente' : 'Novo cliente' }}
            </h2>
            <button class="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 transition" @click="emit('close')">✕</button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="submit">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Nome *</label>
                <input v-model="form.name" type="text" required autofocus
                  class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
                  placeholder="Nome do cliente ou empresa" />
              </div>

              <div class="col-span-2">
                <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input v-model="form.email" type="email" required
                  class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
                  placeholder="email@cliente.com" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Telefone</label>
                <input v-model="form.phone" type="tel"
                  class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
                  placeholder="+55 11 99999-9999" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Empresa</label>
                <input v-model="form.company" type="text"
                  class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition"
                  placeholder="Nome da empresa" />
              </div>

              <div class="col-span-2">
                <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Notas</label>
                <textarea v-model="form.notes" rows="3"
                  class="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition resize-none"
                  placeholder="Histórico, preferências, informações relevantes..." />
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <button v-if="client" type="button" class="text-sm text-red-500 hover:text-red-700 font-medium transition"
                @click="emit('delete', client.id)">
                Excluir cliente
              </button>
              <div v-else />
              <div class="flex gap-3">
                <button type="button" class="px-4 py-2 text-sm text-surface-400 hover:text-surface-600 transition" @click="emit('close')">Cancelar</button>
                <button type="submit" class="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition">
                  {{ client ? 'Salvar' : 'Adicionar cliente' }}
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
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
