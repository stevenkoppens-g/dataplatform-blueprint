export type CloudProvider = 'azure' | 'aws' | 'gcp'

export type Archetype = 'lakehouse' | 'modern-dw' | 'hybrid' | 'custom'

export type ComponentCategory =
  | 'compute'
  | 'warehouse'
  | 'orchestration'
  | 'storage'
  | 'networking'
  | 'governance'
  | 'monitoring'
  | 'security'

export type ComponentTier = 'basic' | 'standard' | 'premium'

export interface CostFactor {
  name: string
  unit: string
  unitCost: number
  description: string
  defaultQuantity: number
}

export interface TerraformVar {
  name: string
  type: string
  description: string
  default?: string | number | boolean
  required: boolean
}

export interface CloudComponent {
  id: string
  name: string
  category: ComponentCategory
  cloud: CloudProvider
  description: string
  icon: string
  monthlyBaseCost: number
  costFactors: CostFactor[]
  requiresPrivateConnectivity: boolean
  privateConnectivityCost: number
  dependencies: string[]
  conflictsWith: string[]
  terraformModule: string
  terraformVariables: TerraformVar[]
  tier: ComponentTier
}

export interface ComponentConfig {
  [key: string]: string | number | boolean | string[]
}

export interface NetworkingConfig {
  private: boolean
  vpnGateway: boolean
  expressRoute: boolean
  nsgRules: string
}

export interface TagsConfig {
  project: string
  environment: string
  owner: string
  costCenter: string
}

export interface ValidationError {
  componentId: string
  message: string
  severity: 'error' | 'warning'
}

export interface PlatformConfig {
  version: string
  cloud: CloudProvider
  archetype: Archetype
  components: Array<{
    id: string
    tier?: ComponentTier
    config: ComponentConfig
  }>
  networking: NetworkingConfig
  environment: string
  tags: TagsConfig
  estimatedMonthlyCost: number
  createdAt: string
}

export interface TerraformOutput {
  files: Record<string, string>
  summary: string
}

export interface SavedConfig {
  id: string
  name: string
  config: PlatformConfig
  savedAt: string
}
