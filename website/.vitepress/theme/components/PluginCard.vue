<script setup lang="ts">
import { ref } from 'vue'
import {
  Code2,
  GitBranch,
  FileText,
  Wrench,
  Server,
  Brain,
  Terminal,
  Webhook,
  Plug,
  Copy,
  ExternalLink,
  Check
} from 'lucide-vue-next'

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

const props = defineProps<{
  plugin: Plugin
  lang?: 'ko' | 'en'
  view?: 'card' | 'list'
}>()

const copied = ref(false)

const categoryNames = {
  'spec-driven':  { ko: '스펙 & 개발', en: 'Spec-Driven Dev' },
  'agents':       { ko: '에이전트',    en: 'Agents'          },
  'browser':      { ko: '브라우저',    en: 'Browser'         },
  'productivity': { ko: '생산성',      en: 'Productivity'    },
  'misc':         { ko: '기타',        en: 'Misc'            },
}

const copyInstallCommand = async () => {
  try {
    await navigator.clipboard.writeText(props.plugin.installCommand)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const getCategoryName = (categoryId: string) => {
  const lang = props.lang || 'en'
  return categoryNames[categoryId]?.[lang] || categoryId
}

const getCategoryIcon = (categoryId: string) => {
  const icons = {
    'spec-driven':  FileText,
    'agents':       Brain,
    'browser':      Terminal,
    'productivity': Wrench,
    'misc':         Server,
  }
  return icons[categoryId] || Wrench
}
</script>

<template>
  <!-- Card View -->
  <article v-if="view !== 'list'" class="plugin-card" :data-category="plugin.category">
    <div class="plugin-card-header">
      <div class="plugin-card-meta">
        <span class="plugin-card-category" :data-cat="plugin.category">
          <component :is="getCategoryIcon(plugin.category)" :size="12" />
          {{ getCategoryName(plugin.category) }}
        </span>
        <span class="plugin-card-version">v{{ plugin.version }}</span>
      </div>
      <a :href="`https://github.com/devstefancho/claude-plugins/tree/main/${plugin.id}`" target="_blank" class="detail-link" :title="lang === 'en' ? 'View on GitHub' : 'GitHub에서 보기'">
        <ExternalLink :size="14" />
      </a>
    </div>

    <div class="plugin-card-content">
      <h3 class="plugin-card-title">{{ plugin.name }}</h3>
      <p class="plugin-card-description">{{ plugin.description }}</p>
    </div>

    <!-- Install command preview with copy -->
    <div class="install-command-preview" @click="copyInstallCommand">
      <span class="prompt">$</span>
      <span class="cmd">{{ plugin.installCommand }}</span>
      <button class="cmd-copy-btn" @click.stop="copyInstallCommand">
        <Check v-if="copied" :size="13" />
        <Copy v-else :size="13" />
      </button>
    </div>

    <ul v-if="plugin.features.length > 0" class="plugin-card-features">
      <li v-for="feature in plugin.features.slice(0, 3)" :key="feature">
        <span class="feature-bullet"></span>
        {{ feature }}
      </li>
    </ul>

    <div class="plugin-card-badges">
      <span v-if="plugin.components.skills.length > 0" class="badge badge-skill">
        <Brain :size="12" />
        Skills ({{ plugin.components.skills.length }})
      </span>
      <span v-if="plugin.components.commands.length > 0" class="badge badge-command">
        <Terminal :size="12" />
        Commands ({{ plugin.components.commands.length }})
      </span>
      <span v-if="plugin.components.hooks" class="badge badge-hook">
        <Webhook :size="12" />
        Hooks
      </span>
      <span v-if="plugin.components.mcpServers.length > 0" class="badge badge-mcp">
        <Plug :size="12" />
        MCP ({{ plugin.components.mcpServers.length }})
      </span>
    </div>

  </article>

  <!-- List View -->
  <article v-else class="plugin-card plugin-card-list" :data-category="plugin.category">
    <span class="plugin-list-icon">
      <component :is="getCategoryIcon(plugin.category)" :size="18" />
    </span>

    <div class="plugin-list-main">
      <div class="plugin-list-title-row">
        <h3 class="plugin-card-title">{{ plugin.name }}</h3>
        <span class="plugin-card-version">v{{ plugin.version }}</span>
      </div>
      <p class="plugin-card-description">{{ plugin.description }}</p>
    </div>

    <div class="plugin-list-right">
      <div class="plugin-card-badges">
        <span v-if="plugin.components.skills.length > 0" class="badge badge-skill">
          <Brain :size="12" />
          {{ plugin.components.skills.length }}
        </span>
        <span v-if="plugin.components.commands.length > 0" class="badge badge-command">
          <Terminal :size="12" />
          {{ plugin.components.commands.length }}
        </span>
        <span v-if="plugin.components.hooks" class="badge badge-hook">
          <Webhook :size="12" />
        </span>
        <span v-if="plugin.components.mcpServers.length > 0" class="badge badge-mcp">
          <Plug :size="12" />
          {{ plugin.components.mcpServers.length }}
        </span>
      </div>
      <div class="plugin-card-actions">
        <button class="btn btn-primary btn-sm" @click="copyInstallCommand">
          <Copy v-if="!copied" :size="14" />
          <Check v-else :size="14" />
          {{ copied ? (lang === 'en' ? 'Copied!' : '복사됨!') : (lang === 'en' ? 'Install' : '설치') }}
        </button>
        <a :href="`https://github.com/devstefancho/claude-plugins/tree/main/${plugin.id}`" target="_blank" class="btn btn-ghost btn-sm">
          {{ lang === 'en' ? 'Details' : '상세' }}
          <ExternalLink :size="14" />
        </a>
      </div>
    </div>
  </article>
</template>
