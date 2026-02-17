import { create } from 'zustand'
import type {
  CloudProvider,
  Archetype,
  ComponentConfig,
  NetworkingConfig,
  TagsConfig,
  PlatformConfig,
  SavedConfig,
} from '@/types/config'

const TOTAL_STEPS = 8
const SAVED_CONFIGS_KEY = 'dataplatform-saved-configs'

interface ConfigState {
  currentStep: number
  cloud: CloudProvider | null
  archetype: Archetype | null
  selectedComponentIds: string[]
  componentConfigs: Record<string, ComponentConfig>
  networking: NetworkingConfig
  environment: string
  tags: TagsConfig
  currency: 'EUR' | 'USD'
  costThreshold: number
  savedConfigs: SavedConfig[]
}

interface ConfigActions {
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  selectCloud: (cloud: CloudProvider) => void
  selectArchetype: (archetype: Archetype) => void
  toggleComponent: (id: string) => void
  addComponent: (id: string) => void
  removeComponent: (id: string) => void
  updateComponentConfig: (id: string, config: Partial<ComponentConfig>) => void
  setNetworking: (networking: Partial<NetworkingConfig>) => void
  setEnvironment: (env: string) => void
  setTags: (tags: Partial<TagsConfig>) => void
  setCurrency: (currency: 'EUR' | 'USD') => void
  setCostThreshold: (threshold: number) => void
  importConfig: (json: string) => boolean
  exportConfig: () => string
  saveConfig: (name: string) => void
  loadConfig: (id: string) => void
  deleteSavedConfig: (id: string) => void
  reset: () => void
}

const defaultNetworking: NetworkingConfig = {
  private: false,
  vpnGateway: false,
  expressRoute: false,
  nsgRules: 'default',
}

const defaultTags: TagsConfig = {
  project: 'data-platform',
  environment: 'dev',
  owner: '',
  costCenter: '',
}

function getInitialState(): ConfigState {
  return {
    currentStep: 0,
    cloud: null,
    archetype: null,
    selectedComponentIds: [],
    componentConfigs: {},
    networking: { ...defaultNetworking },
    environment: 'dev',
    tags: { ...defaultTags },
    currency: 'EUR',
    costThreshold: 5000,
    savedConfigs: loadSavedConfigsFromStorage(),
  }
}

function loadSavedConfigsFromStorage(): SavedConfig[] {
  try {
    const raw = localStorage.getItem(SAVED_CONFIGS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as SavedConfig[]
  } catch {
    return []
  }
}

function persistSavedConfigs(configs: SavedConfig[]): void {
  try {
    localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(configs))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function isValidCloudProvider(value: unknown): value is CloudProvider {
  return value === 'azure' || value === 'aws' || value === 'gcp'
}

function isValidArchetype(value: unknown): value is Archetype {
  return (
    value === 'lakehouse' ||
    value === 'modern-dw' ||
    value === 'hybrid' ||
    value === 'custom'
  )
}

function isValidPlatformConfig(obj: unknown): obj is PlatformConfig {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>

  if (typeof record.version !== 'string') return false
  if (!isValidCloudProvider(record.cloud)) return false
  if (!isValidArchetype(record.archetype)) return false
  if (!Array.isArray(record.components)) return false
  if (typeof record.networking !== 'object' || record.networking === null) return false
  if (typeof record.environment !== 'string') return false
  if (typeof record.tags !== 'object' || record.tags === null) return false
  if (typeof record.estimatedMonthlyCost !== 'number') return false
  if (typeof record.createdAt !== 'string') return false

  return true
}

export const useConfigStore = create<ConfigState & ConfigActions>((set, get) => ({
  ...getInitialState(),

  setStep: (step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      set({ currentStep: step })
    }
  },

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < TOTAL_STEPS - 1) {
      set({ currentStep: currentStep + 1 })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },

  selectCloud: (cloud: CloudProvider) => {
    set({ cloud })
  },

  selectArchetype: (archetype: Archetype) => {
    set({ archetype })
  },

  toggleComponent: (id: string) => {
    const { selectedComponentIds } = get()
    if (selectedComponentIds.includes(id)) {
      set({
        selectedComponentIds: selectedComponentIds.filter((cid) => cid !== id),
      })
    } else {
      set({
        selectedComponentIds: [...selectedComponentIds, id],
      })
    }
  },

  addComponent: (id: string) => {
    const { selectedComponentIds } = get()
    if (!selectedComponentIds.includes(id)) {
      set({ selectedComponentIds: [...selectedComponentIds, id] })
    }
  },

  removeComponent: (id: string) => {
    const { selectedComponentIds, componentConfigs } = get()
    const updatedConfigs = { ...componentConfigs }
    delete updatedConfigs[id]
    set({
      selectedComponentIds: selectedComponentIds.filter((cid) => cid !== id),
      componentConfigs: updatedConfigs,
    })
  },

  updateComponentConfig: (id: string, config: Partial<ComponentConfig>) => {
    const { componentConfigs } = get()
    const existing: ComponentConfig = componentConfigs[id] ?? {}
    const merged: ComponentConfig = { ...existing }
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        merged[key] = value
      }
    }
    set({
      componentConfigs: {
        ...componentConfigs,
        [id]: merged,
      },
    })
  },

  setNetworking: (networking: Partial<NetworkingConfig>) => {
    const current = get().networking
    set({ networking: { ...current, ...networking } })
  },

  setEnvironment: (env: string) => {
    set({ environment: env })
  },

  setTags: (tags: Partial<TagsConfig>) => {
    const current = get().tags
    set({ tags: { ...current, ...tags } })
  },

  setCurrency: (currency: 'EUR' | 'USD') => {
    set({ currency })
  },

  setCostThreshold: (threshold: number) => {
    set({ costThreshold: threshold })
  },

  importConfig: (json: string): boolean => {
    try {
      const parsed: unknown = JSON.parse(json)
      if (!isValidPlatformConfig(parsed)) return false

      const config = parsed as PlatformConfig
      const componentIds = config.components.map((c) => c.id)
      const componentConfigs: Record<string, ComponentConfig> = {}
      for (const component of config.components) {
        componentConfigs[component.id] = { ...component.config }
      }

      set({
        cloud: config.cloud,
        archetype: config.archetype,
        selectedComponentIds: componentIds,
        componentConfigs,
        networking: { ...config.networking },
        environment: config.environment,
        tags: { ...config.tags },
      })

      return true
    } catch {
      return false
    }
  },

  exportConfig: (): string => {
    const state = get()
    const components = state.selectedComponentIds.map((id) => ({
      id,
      config: state.componentConfigs[id] ?? {},
    }))

    const platformConfig: PlatformConfig = {
      version: '1.0.0',
      cloud: state.cloud ?? 'azure',
      archetype: state.archetype ?? 'custom',
      components,
      networking: { ...state.networking },
      environment: state.environment,
      tags: { ...state.tags },
      estimatedMonthlyCost: 0,
      createdAt: new Date().toISOString(),
    }

    return JSON.stringify(platformConfig, null, 2)
  },

  saveConfig: (name: string) => {
    const state = get()
    const components = state.selectedComponentIds.map((id) => ({
      id,
      config: state.componentConfigs[id] ?? {},
    }))

    const platformConfig: PlatformConfig = {
      version: '1.0.0',
      cloud: state.cloud ?? 'azure',
      archetype: state.archetype ?? 'custom',
      components,
      networking: { ...state.networking },
      environment: state.environment,
      tags: { ...state.tags },
      estimatedMonthlyCost: 0,
      createdAt: new Date().toISOString(),
    }

    const savedConfig: SavedConfig = {
      id: crypto.randomUUID(),
      name,
      config: platformConfig,
      savedAt: new Date().toISOString(),
    }

    const updatedConfigs = [...state.savedConfigs, savedConfig]
    persistSavedConfigs(updatedConfigs)
    set({ savedConfigs: updatedConfigs })
  },

  loadConfig: (id: string) => {
    const { savedConfigs } = get()
    const saved = savedConfigs.find((sc) => sc.id === id)
    if (!saved) return

    const config = saved.config
    const componentIds = config.components.map((c) => c.id)
    const componentConfigs: Record<string, ComponentConfig> = {}
    for (const component of config.components) {
      componentConfigs[component.id] = { ...component.config }
    }

    set({
      cloud: config.cloud,
      archetype: config.archetype,
      selectedComponentIds: componentIds,
      componentConfigs,
      networking: { ...config.networking },
      environment: config.environment,
      tags: { ...config.tags },
    })
  },

  deleteSavedConfig: (id: string) => {
    const { savedConfigs } = get()
    const updatedConfigs = savedConfigs.filter((sc) => sc.id !== id)
    persistSavedConfigs(updatedConfigs)
    set({ savedConfigs: updatedConfigs })
  },

  reset: () => {
    set({
      currentStep: 0,
      cloud: null,
      archetype: null,
      selectedComponentIds: [],
      componentConfigs: {},
      networking: { ...defaultNetworking },
      environment: 'dev',
      tags: { ...defaultTags },
      currency: 'EUR',
      costThreshold: 5000,
    })
  },
}))
