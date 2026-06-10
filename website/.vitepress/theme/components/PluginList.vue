<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Search, Package, LayoutGrid, List } from 'lucide-vue-next'
import pluginData from '../../../data/plugins.json'
import PluginCard from './PluginCard.vue'
import InstallBanner from './InstallBanner.vue'

const props = defineProps<{
  lang?: 'ko' | 'en'
}>()

interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: string
  components: {
    skills: string[]
    commands: string[]
    hooks: boolean
    mcpServers: string[]
  }
  features: string[]
  installCommand: string
  uninstallCommand: string
}

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedComponent = ref('')
const viewMode = ref<'card' | 'list'>('card')
const searchInputRef = ref<HTMLInputElement | null>(null)

// Keyboard shortcut: "/" to focus search
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
}

onMounted(() => {
  readUrlParams()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// URL parameter sync
function readUrlParams() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  searchQuery.value = params.get('search') || ''
  selectedCategory.value = params.get('category') || ''
  selectedComponent.value = params.get('component') || ''
  const view = params.get('view')
  if (view === 'list' || view === 'card') {
    viewMode.value = view
  }
}

function updateUrlParams() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  if (searchQuery.value) params.set('search', searchQuery.value)
  if (selectedCategory.value) params.set('category', selectedCategory.value)
  if (selectedComponent.value) params.set('component', selectedComponent.value)
  if (viewMode.value !== 'card') params.set('view', viewMode.value)

  const queryString = params.toString()
  const newUrl = window.location.pathname + (queryString ? '?' + queryString : '')
  window.history.replaceState({}, '', newUrl)
}

// Debounced search URL sync
let searchDebounceTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(updateUrlParams, 300)
})

// Immediate URL sync for non-search filters
watch([selectedCategory, selectedComponent, viewMode], updateUrlParams)

const categories = pluginData.categories
const plugins = pluginData.plugins as Plugin[]

const categoryNames: Record<string, { ko: string; en: string }> = {
  'spec-driven':  { ko: '스펙 & 개발', en: 'Spec-Driven Dev' },
  'agents':       { ko: '에이전트',    en: 'Agents'          },
  'browser':      { ko: '브라우저',    en: 'Browser'         },
  'productivity': { ko: '생산성',      en: 'Productivity'    },
  'misc':         { ko: '기타',        en: 'Misc'            },
}

const categoryCount = (catId: string) => plugins.filter(p => p.category === catId).length

const filteredPlugins = computed(() => {
  return plugins.filter(plugin => {
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      const matchesSearch =
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.features.some(f => f.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    if (selectedCategory.value && plugin.category !== selectedCategory.value) {
      return false
    }

    if (selectedComponent.value) {
      switch (selectedComponent.value) {
        case 'skills':
          if (plugin.components.skills.length === 0) return false
          break
        case 'commands':
          if (plugin.components.commands.length === 0) return false
          break
        case 'hooks':
          if (!plugin.components.hooks) return false
          break
        case 'mcp':
          if (plugin.components.mcpServers.length === 0) return false
          break
      }
    }

    return true
  })
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedComponent.value
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedComponent.value = ''
}

const toggleCategory = (catId: string) => {
  selectedCategory.value = selectedCategory.value === catId ? '' : catId
}

const getCategoryLabel = (categoryId: string) => {
  const lang = props.lang || 'en'
  return categoryNames[categoryId]?.[lang] || categoryId
}

const labels = computed(() => {
  const lang = props.lang || 'en'
  return {
    searchPlaceholder: lang === 'ko' ? '> 플러그인 검색...' : '> search plugins...',
    allCategories: lang === 'ko' ? '전체' : 'All',
    allComponents: lang === 'ko' ? '모든 컴포넌트' : 'All Components',
    pluginCount: lang === 'ko'
      ? `${filteredPlugins.value.length}개의 플러그인`
      : `${filteredPlugins.value.length} plugins`,
    clearFilters: lang === 'ko' ? '필터 초기화' : 'Clear filters',
    noPlugins: lang === 'ko' ? '검색 결과가 없습니다' : 'No plugins found',
    noPluginsHint: lang === 'ko' ? '다른 키워드로 검색해 보세요' : 'Try a different search term'
  }
})
</script>

<template>
  <div class="plugin-list">
    <InstallBanner :lang="lang" />

    <div class="plugin-list-header">
      <div class="search-container">
        <Search :size="18" class="search-icon" />
        <input
          ref="searchInputRef"
          type="text"
          v-model="searchQuery"
          :placeholder="labels.searchPlaceholder"
          class="search-input"
        />
        <kbd class="search-kbd">/</kbd>
      </div>

      <div class="filter-group">
        <select v-model="selectedComponent" class="filter-select">
          <option value="">{{ labels.allComponents }}</option>
          <option value="skills">Skills</option>
          <option value="commands">Commands</option>
          <option value="hooks">Hooks</option>
          <option value="mcp">MCP Servers</option>
        </select>

        <div class="view-toggle">
          <button
            :class="['view-toggle-btn', { active: viewMode === 'card' }]"
            @click="viewMode = 'card'"
            :title="lang === 'ko' ? '카드 보기' : 'Card view'"
          >
            <LayoutGrid :size="18" />
          </button>
          <button
            :class="['view-toggle-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
            :title="lang === 'ko' ? '리스트 보기' : 'List view'"
          >
            <List :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Category pills -->
    <div class="category-pills">
      <button
        :class="['category-pill', { active: !selectedCategory }]"
        data-cat="all"
        @click="selectedCategory = ''"
      >
        {{ labels.allCategories }}
        <span class="pill-count">({{ plugins.length }})</span>
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['category-pill', { active: selectedCategory === cat.id }]"
        :data-cat="cat.id"
        @click="toggleCategory(cat.id)"
      >
        {{ getCategoryLabel(cat.id) }}
        <span class="pill-count">({{ categoryCount(cat.id) }})</span>
      </button>
    </div>

    <div class="plugin-results-meta">
      <span class="plugin-count">{{ labels.pluginCount }}</span>
      <button v-if="hasActiveFilters" @click="clearFilters" class="clear-filters">
        {{ labels.clearFilters }}
      </button>
    </div>

    <div v-if="filteredPlugins.length > 0" :class="viewMode === 'card' ? 'plugin-grid' : 'plugin-list-view'">
      <PluginCard
        v-for="plugin in filteredPlugins"
        :key="plugin.id"
        :plugin="plugin"
        :lang="lang"
        :view="viewMode"
      />
    </div>

    <div v-else class="empty-state">
      <Package :size="48" />
      <p>{{ labels.noPlugins }}</p>
      <p style="font-size: 0.85rem; margin-top: 0.5rem;">{{ labels.noPluginsHint }}</p>
    </div>
  </div>
</template>
