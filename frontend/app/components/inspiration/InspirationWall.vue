<script setup lang="ts">
import type { Inspiration } from '~/types'
import { useInspirationApi } from '~/services/api'
import InspirationModal from '~/components/inspiration/InspirationModal.vue'

const props = defineProps<{ workspaceId: string }>()

const inspirationApi = useInspirationApi()
const inspirations = ref<Inspiration[]>([])
const showModal = ref(false)
const loading = ref(true)
const selectedCategory = ref('')

const categories = computed(() => {
  const cats = inspirations.value.map(i => i.category).filter(Boolean) as string[]
  return [...new Set(cats)]
})

const filtered = computed(() =>
  selectedCategory.value
    ? inspirations.value.filter(i => i.category === selectedCategory.value)
    : inspirations.value,
)

async function load() {
  loading.value = true
  inspirations.value = await inspirationApi.list(props.workspaceId)
  loading.value = false
}

async function save(data: Partial<Inspiration>) {
  const created = await inspirationApi.create(data)
  inspirations.value.unshift(created)
  showModal.value = false
}

async function remove(id: string) {
  if (!confirm('Remover esta inspiração?')) return
  await inspirationApi.remove(id)
  inspirations.value = inspirations.value.filter(i => i.id !== id)
}

onMounted(load)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <h2 class="text-base font-semibold text-surface-800">Mural de Inspirações</h2>
        <span v-if="inspirations.length" class="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">
          {{ inspirations.length }}
        </span>
      </div>
      <button class="text-sm text-primary-600 font-medium hover:text-primary-700 transition" @click="showModal = true">
        + Adicionar
      </button>
    </div>

    <!-- Category filter -->
    <div v-if="categories.length" class="flex flex-wrap gap-2 mb-5">
      <button
        class="text-xs px-3 py-1.5 rounded-full font-medium transition"
        :class="selectedCategory === '' ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'"
        @click="selectedCategory = ''"
      >
        Todos
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        class="text-xs px-3 py-1.5 rounded-full font-medium transition"
        :class="selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="columns-2 sm:columns-3 lg:columns-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-surface-100 rounded-2xl animate-pulse mb-4"
        :style="{ height: `${120 + (i % 3) * 60}px` }" />
    </div>

    <!-- Empty state -->
    <div v-else-if="inspirations.length === 0" class="bg-white rounded-2xl p-10 shadow-card text-center">
      <p class="text-4xl mb-3">💡</p>
      <p class="text-surface-600 font-medium mb-1">Mural vazio</p>
      <p class="text-surface-400 text-sm mb-4">Coleccione referências visuais para alimentar o processo criativo.</p>
      <button class="inline-block bg-primary-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-600 transition"
        @click="showModal = true">
        Adicionar primeira inspiração
      </button>
    </div>

    <!-- Masonry grid -->
    <div v-else class="columns-2 sm:columns-3 lg:columns-4 gap-4">
      <div
        v-for="item in filtered"
        :key="item.id"
        class="mb-4 break-inside-avoid group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-shadow"
      >
        <img
          :src="item.imageUrl"
          :alt="item.title"
          class="w-full object-cover block"
          loading="lazy"
        />

        <!-- Overlay on hover -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col justify-end p-3">
          <p class="text-white text-xs font-semibold leading-tight truncate">{{ item.title }}</p>
          <div class="flex items-center justify-between mt-1">
            <span v-if="item.category" class="text-white/70 text-xs">{{ item.category }}</span>
            <div class="flex gap-2 ml-auto">
              <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank"
                class="text-white/80 hover:text-white transition text-xs" @click.stop>
                ↗
              </a>
              <button class="text-white/60 hover:text-red-300 transition text-xs" @click.stop="remove(item.id)">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <InspirationModal
      :open="showModal"
      :workspace-id="workspaceId"
      @close="showModal = false"
      @save="save"
    />
  </div>
</template>
