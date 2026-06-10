<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Copy, Check, X } from 'lucide-vue-next'

const props = defineProps<{
  lang?: 'ko' | 'en'
}>()

const command = 'npx skills@latest add devstefancho/claude-plugins'
const copied = ref(false)
const dismissed = ref(true)

onMounted(() => {
  if (typeof window !== 'undefined') {
    dismissed.value = localStorage.getItem('install-banner-dismissed') === 'true'
  }
})

const copyCommand = async () => {
  try {
    await navigator.clipboard.writeText(command)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const dismiss = () => {
  dismissed.value = true
  if (typeof window !== 'undefined') {
    localStorage.setItem('install-banner-dismissed', 'true')
  }
}

const labels = {
  en: {
    prefix: 'First time?',
    desc: 'Install all skills into your coding agent:',
    copied: 'Copied!',
    copy: 'Copy',
  },
  ko: {
    prefix: '처음이신가요?',
    desc: '코딩 에이전트에 스킬을 설치하세요:',
    copied: '복사됨!',
    copy: '복사',
  }
}

const t = labels[props.lang || 'en']
</script>

<template>
  <div v-if="!dismissed" class="install-banner">
    <div class="banner-content">
      <div class="banner-text">
        <span class="banner-prefix">{{ t.prefix }}</span>
        <span class="banner-desc">{{ t.desc }}</span>
      </div>
      <div class="banner-command">
        <code class="command-text">
          <span class="prompt">$</span>
          {{ command }}
        </code>
        <button class="banner-copy" @click="copyCommand">
          <Check v-if="copied" :size="14" />
          <Copy v-else :size="14" />
          {{ copied ? t.copied : t.copy }}
        </button>
      </div>
    </div>
    <button class="banner-close" @click="dismiss" :aria-label="lang === 'ko' ? '닫기' : 'Close'">
      <X :size="16" />
    </button>
  </div>
</template>

<style scoped>
.install-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #1a1a2e;
  border-radius: 10px;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.banner-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.banner-text {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.banner-prefix {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 0.85rem;
  color: #d4a574;
}

.banner-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.banner-command {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.command-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #e8e4df;
  white-space: nowrap;
}

.command-text .prompt {
  color: #4ade80;
  margin-right: 0.5rem;
}

.banner-copy {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.banner-copy:hover {
  background: rgba(255, 255, 255, 0.15);
}

.banner-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.banner-close:hover {
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .install-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .banner-content {
    flex-direction: column;
    gap: 0.75rem;
  }

  .banner-command {
    overflow-x: auto;
  }

  .banner-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }

  .install-banner {
    position: relative;
    padding-right: 2.5rem;
  }
}
</style>
