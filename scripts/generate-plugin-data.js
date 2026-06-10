import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

const categoryMeta = {
  'spec-driven':  { id: 'spec-driven',  name: { ko: '스펙 & 개발', en: 'Spec-Driven Dev' }, icon: '📋' },
  'agents':       { id: 'agents',       name: { ko: '에이전트',    en: 'Agents'          }, icon: '🤖' },
  'browser':      { id: 'browser',      name: { ko: '브라우저',    en: 'Browser'         }, icon: '🌐' },
  'productivity': { id: 'productivity', name: { ko: '생산성',      en: 'Productivity'    }, icon: '⚡' },
  'misc':         { id: 'misc',         name: { ko: '기타',        en: 'Misc'            }, icon: '🛠️' },
}

function parseSkillFrontmatter(content) {
  const lines = content.split('\n')
  if (lines[0].trim() !== '---') return {}

  const fm = {}
  let i = 1
  while (i < lines.length && lines[i].trim() !== '---') {
    const line = lines[i]
    const colonIdx = line.indexOf(':')
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim()
      let value = line.slice(colonIdx + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (key && value) fm[key] = value
    }
    i++
  }
  return fm
}

function readSkillMeta(skillRelPath) {
  const skillMdPath = path.join(rootDir, skillRelPath.replace('./', ''), 'SKILL.md')
  if (!fs.existsSync(skillMdPath)) return null

  const content = fs.readFileSync(skillMdPath, 'utf-8')
  const fm = parseSkillFrontmatter(content)

  let desc = fm.description || ''
  const useWhenIdx = desc.indexOf(' Use when')
  if (useWhenIdx !== -1) desc = desc.slice(0, useWhenIdx)

  return { name: fm.name || '', description: desc.trim() }
}

function generatePluginData() {
  const pluginJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, '.claude-plugin', 'plugin.json'), 'utf-8')
  )

  const skills = []
  for (const skillPath of pluginJson.skills) {
    // e.g. "./skills/spec-driven/writing-specs"
    const parts = skillPath.replace('./', '').split('/')
    const category = parts[1]
    const skillName = parts[2]

    const meta = readSkillMeta(skillPath)
    if (!meta) {
      console.warn(`Skipping ${skillPath}: SKILL.md not found`)
      continue
    }

    skills.push({
      id: `skills/${category}/${skillName}`,
      name: skillName,
      version: pluginJson.version || '0.1.0',
      description: meta.description,
      author: 'Stefan Cho',
      category,
      components: {
        skills: [skillName],
        commands: [],
        hooks: false,
        mcpServers: [],
      },
      features: [],
      installCommand: `npx skills@latest add devstefancho/claude-plugins --skill ${skillName} -a claude-code -y`,
      uninstallCommand: '',
    })
  }

  skills.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

  const usedCategoryIds = [...new Set(skills.map(s => s.category))]
  const categories = usedCategoryIds.filter(c => categoryMeta[c]).map(c => categoryMeta[c])

  const data = {
    marketplace: {
      name: 'devstefancho-skills',
      repo: 'devstefancho/claude-plugins',
      installCommand: 'npx skills@latest add devstefancho/claude-plugins',
    },
    plugins: skills,
    categories,
  }

  const outputPath = path.join(rootDir, 'website', 'data', 'plugins.json')
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
  console.log(`Generated skill data for ${skills.length} skills → ${outputPath}`)
}

generatePluginData()
