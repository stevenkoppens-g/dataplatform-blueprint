import type {
  CloudComponent,
  CloudProvider,
  ComponentConfig,
  NetworkingConfig,
  TagsConfig,
  TerraformOutput,
} from '@/types/config'

// ---------------------------------------------------------------------------
// Provider metadata used across several generators
// ---------------------------------------------------------------------------

interface ProviderMeta {
  providerName: string
  providerSource: string
  providerVersion: string
  locationVar: string
  resourceGroupBlock: string
  moduleResourceGroupRef: string
}

const PROVIDER_META: Record<CloudProvider, ProviderMeta> = {
  azure: {
    providerName: 'azurerm',
    providerSource: 'hashicorp/azurerm',
    providerVersion: '~> 3.80',
    locationVar: 'location',
    resourceGroupBlock: [
      'resource "azurerm_resource_group" "main" {',
      '  name     = "${var.project_name}-${var.environment}-rg"',
      '  location = var.location',
      '  tags     = var.tags',
      '}',
    ].join('\n'),
    moduleResourceGroupRef: 'azurerm_resource_group.main.name',
  },
  aws: {
    providerName: 'aws',
    providerSource: 'hashicorp/aws',
    providerVersion: '~> 5.30',
    locationVar: 'region',
    resourceGroupBlock: '',
    moduleResourceGroupRef: '',
  },
  gcp: {
    providerName: 'google',
    providerSource: 'hashicorp/google',
    providerVersion: '~> 5.10',
    locationVar: 'region',
    resourceGroupBlock: [
      'resource "google_project" "main" {',
      '  name       = "${var.project_name}-${var.environment}"',
      '  project_id = "${var.project_name}-${var.environment}"',
      '  org_id     = var.org_id',
      '}',
    ].join('\n'),
    moduleResourceGroupRef: 'google_project.main.project_id',
  },
}

// ---------------------------------------------------------------------------
// Backend configuration
// ---------------------------------------------------------------------------

export function generateBackendConfig(
  cloud: CloudProvider,
  environment: string,
): string {
  switch (cloud) {
    case 'azure':
      return [
        '  backend "azurerm" {',
        `    resource_group_name  = "terraform-state-rg"`,
        `    storage_account_name = "tfstate${environment}"`,
        `    container_name       = "tfstate"`,
        `    key                  = "${environment}.terraform.tfstate"`,
        '  }',
      ].join('\n')
    case 'aws':
      return [
        '  backend "s3" {',
        `    bucket         = "terraform-state-${environment}"`,
        `    key            = "${environment}/terraform.tfstate"`,
        `    region         = "us-east-1"`,
        '    encrypt        = true',
        `    dynamodb_table = "terraform-locks-${environment}"`,
        '  }',
      ].join('\n')
    case 'gcp':
      return [
        '  backend "gcs" {',
        `    bucket = "terraform-state-${environment}"`,
        `    prefix = "${environment}"`,
        '  }',
      ].join('\n')
  }
}

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

export function generateProviderConfig(cloud: CloudProvider): string {
  const meta = PROVIDER_META[cloud]

  switch (cloud) {
    case 'azure':
      return [
        `provider "${meta.providerName}" {`,
        '  features {',
        '    resource_group {',
        '      prevent_deletion_if_contains_resources = false',
        '    }',
        '  }',
        '}',
      ].join('\n')
    case 'aws':
      return [
        `provider "${meta.providerName}" {`,
        '  region = var.region',
        '',
        '  default_tags {',
        '    tags = var.tags',
        '  }',
        '}',
      ].join('\n')
    case 'gcp':
      return [
        `provider "${meta.providerName}" {`,
        '  project = var.project_name',
        '  region  = var.region',
        '}',
      ].join('\n')
  }
}

// ---------------------------------------------------------------------------
// Module HCL for a single component
// ---------------------------------------------------------------------------

export function generateModuleHCL(
  component: CloudComponent,
  config: ComponentConfig,
  cloud: CloudProvider,
): string {
  const meta = PROVIDER_META[cloud]
  const moduleName = component.id.replace(/-/g, '_')

  const lines: string[] = [
    `module "${moduleName}" {`,
    `  source = "${component.terraformModule}"`,
    '',
    `  environment = var.environment`,
    `  ${meta.locationVar.padEnd(11)} = var.${meta.locationVar}`,
  ]

  // Resource group / project reference (when the cloud uses one)
  if (cloud === 'azure') {
    lines.push(`  resource_group = ${meta.moduleResourceGroupRef}`)
  } else if (cloud === 'gcp') {
    lines.push(`  project_id = ${meta.moduleResourceGroupRef}`)
  }

  lines.push('  tags' + ' '.repeat(8) + '= var.tags')
  lines.push('')

  // Component-specific terraform variables
  lines.push('  # Component-specific variables')
  for (const tfVar of component.terraformVariables) {
    const value = config[tfVar.name] ?? tfVar.default
    if (value === undefined) continue

    const formattedValue = formatHCLValue(value, tfVar.type)
    lines.push(`  ${tfVar.name.padEnd(12)} = ${formattedValue}`)
  }

  lines.push('}')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Main entry – generate the full Terraform output
// ---------------------------------------------------------------------------

export function generateTerraform(
  cloud: CloudProvider,
  components: CloudComponent[],
  configs: Record<string, ComponentConfig>,
  networking: NetworkingConfig,
  environment: string,
  tags: TagsConfig,
): TerraformOutput {
  const meta = PROVIDER_META[cloud]

  // ----- main.tf ----- //
  const mainTf = buildMainTf(cloud, components, configs, environment, meta)

  // ----- variables.tf ----- //
  const variablesTf = buildVariablesTf(cloud, components, environment, tags, meta)

  // ----- outputs.tf ----- //
  const outputsTf = buildOutputsTf(components)

  // ----- terraform.tfvars ----- //
  const tfvars = buildTfvars(cloud, environment, tags, networking)

  // ----- providers.tf ----- //
  const providersTf = generateProviderConfig(cloud)

  const files: Record<string, string> = {
    'main.tf': mainTf,
    'variables.tf': variablesTf,
    'outputs.tf': outputsTf,
    'terraform.tfvars': tfvars,
    'providers.tf': providersTf,
  }

  const summary = [
    `Generated Terraform configuration for ${cloud.toUpperCase()} with ${components.length} component(s).`,
    `Environment: ${environment}`,
    `Provider: ${meta.providerSource} ${meta.providerVersion}`,
    `Files generated: ${Object.keys(files).join(', ')}`,
    networking.private
      ? 'Private networking is enabled.'
      : 'Public networking is configured.',
  ].join('\n')

  return { files, summary }
}

// ---------------------------------------------------------------------------
// Internal builders
// ---------------------------------------------------------------------------

function buildMainTf(
  cloud: CloudProvider,
  components: CloudComponent[],
  configs: Record<string, ComponentConfig>,
  environment: string,
  meta: ProviderMeta,
): string {
  const sections: string[] = []

  // terraform block
  sections.push(
    [
      'terraform {',
      '  required_version = ">= 1.5.0"',
      '',
      '  required_providers {',
      `    ${meta.providerName} = {`,
      `      source  = "${meta.providerSource}"`,
      `      version = "${meta.providerVersion}"`,
      '    }',
      '  }',
      '',
      generateBackendConfig(cloud, environment),
      '}',
    ].join('\n'),
  )

  // Resource group / project
  if (meta.resourceGroupBlock) {
    sections.push(meta.resourceGroupBlock)
  }

  // Networking resources when private connectivity is desired
  sections.push(generateNetworkingBlock(cloud))

  // Module calls
  for (const component of components) {
    const config: ComponentConfig = configs[component.id] ?? {}
    sections.push(generateModuleHCL(component, config, cloud))
  }

  return sections.join('\n\n') + '\n'
}

function buildVariablesTf(
  cloud: CloudProvider,
  components: CloudComponent[],
  environment: string,
  tags: TagsConfig,
  meta: ProviderMeta,
): string {
  const blocks: string[] = []

  // environment
  blocks.push(
    variableBlock('environment', 'string', 'Deployment environment', environment),
  )

  // location / region
  const locationDefault = cloud === 'azure' ? 'eastus2' : cloud === 'aws' ? 'us-east-1' : 'us-central1'
  blocks.push(
    variableBlock(meta.locationVar, 'string', `${cloud === 'azure' ? 'Azure region' : 'Cloud region'} for resources`, locationDefault),
  )

  // project_name
  blocks.push(
    variableBlock('project_name', 'string', 'Name of the data platform project', 'dataplatform'),
  )

  // tags
  blocks.push(
    [
      'variable "tags" {',
      '  description = "Resource tags applied to all components"',
      '  type        = map(string)',
      '  default = {',
      `    project     = "${tags.project}"`,
      `    environment = "${tags.environment}"`,
      `    owner       = "${tags.owner}"`,
      `    cost_center = "${tags.costCenter}"`,
      '  }',
      '}',
    ].join('\n'),
  )

  // GCP-specific org_id variable
  if (cloud === 'gcp') {
    blocks.push(
      variableBlock('org_id', 'string', 'GCP organization ID', ''),
    )
  }

  // Component-specific variables
  const emittedVars = new Set<string>()
  for (const component of components) {
    for (const tfVar of component.terraformVariables) {
      if (emittedVars.has(tfVar.name)) continue
      emittedVars.add(tfVar.name)

      const defaultStr =
        tfVar.default !== undefined ? String(tfVar.default) : undefined
      blocks.push(
        variableBlock(
          tfVar.name,
          tfVar.type,
          tfVar.description,
          defaultStr,
          tfVar.required,
        ),
      )
    }
  }

  return blocks.join('\n\n') + '\n'
}

function buildOutputsTf(components: CloudComponent[]): string {
  const blocks: string[] = []

  for (const component of components) {
    const moduleName = component.id.replace(/-/g, '_')

    blocks.push(
      [
        `output "${moduleName}_id" {`,
        `  description = "Resource ID of ${component.name}"`,
        `  value       = module.${moduleName}.id`,
        '}',
      ].join('\n'),
    )

    blocks.push(
      [
        `output "${moduleName}_endpoint" {`,
        `  description = "Endpoint URL of ${component.name}"`,
        `  value       = module.${moduleName}.endpoint`,
        '}',
      ].join('\n'),
    )
  }

  if (blocks.length === 0) {
    blocks.push(
      [
        'output "configuration_summary" {',
        '  description = "Summary of the deployed platform"',
        '  value       = "No components selected"',
        '}',
      ].join('\n'),
    )
  }

  return blocks.join('\n\n') + '\n'
}

function buildTfvars(
  cloud: CloudProvider,
  environment: string,
  tags: TagsConfig,
  networking: NetworkingConfig,
): string {
  const meta = PROVIDER_META[cloud]
  const locationDefault =
    cloud === 'azure' ? 'eastus2' : cloud === 'aws' ? 'us-east-1' : 'us-central1'

  const lines: string[] = [
    `environment  = "${environment}"`,
    `${meta.locationVar.padEnd(12)} = "${locationDefault}"`,
    `project_name = "dataplatform"`,
    '',
    'tags = {',
    `  project     = "${tags.project}"`,
    `  environment = "${tags.environment}"`,
    `  owner       = "${tags.owner}"`,
    `  cost_center = "${tags.costCenter}"`,
    '}',
  ]

  // Include networking-related information as comments
  lines.push('')
  lines.push('# Networking configuration')
  lines.push(`# private_networking = ${String(networking.private)}`)
  lines.push(`# vpn_gateway        = ${String(networking.vpnGateway)}`)
  lines.push(`# express_route      = ${String(networking.expressRoute)}`)

  return lines.join('\n') + '\n'
}

// ---------------------------------------------------------------------------
// Networking HCL block based on provider
// ---------------------------------------------------------------------------

function generateNetworkingBlock(cloud: CloudProvider): string {
  switch (cloud) {
    case 'azure':
      return [
        'resource "azurerm_virtual_network" "main" {',
        '  name                = "${var.project_name}-${var.environment}-vnet"',
        '  location            = azurerm_resource_group.main.location',
        '  resource_group_name = azurerm_resource_group.main.name',
        '  address_space       = ["10.0.0.0/16"]',
        '  tags                = var.tags',
        '}',
        '',
        'resource "azurerm_subnet" "default" {',
        '  name                 = "default"',
        '  resource_group_name  = azurerm_resource_group.main.name',
        '  virtual_network_name = azurerm_virtual_network.main.name',
        '  address_prefixes     = ["10.0.1.0/24"]',
        '}',
      ].join('\n')
    case 'aws':
      return [
        'resource "aws_vpc" "main" {',
        '  cidr_block           = "10.0.0.0/16"',
        '  enable_dns_support   = true',
        '  enable_dns_hostnames = true',
        '',
        '  tags = merge(var.tags, {',
        '    Name = "${var.project_name}-${var.environment}-vpc"',
        '  })',
        '}',
        '',
        'resource "aws_subnet" "private" {',
        '  vpc_id            = aws_vpc.main.id',
        '  cidr_block        = "10.0.1.0/24"',
        '  availability_zone = "${var.region}a"',
        '',
        '  tags = merge(var.tags, {',
        '    Name = "${var.project_name}-${var.environment}-private"',
        '  })',
        '}',
      ].join('\n')
    case 'gcp':
      return [
        'resource "google_compute_network" "main" {',
        '  name                    = "${var.project_name}-${var.environment}-vpc"',
        '  project                 = google_project.main.project_id',
        '  auto_create_subnetworks = false',
        '}',
        '',
        'resource "google_compute_subnetwork" "default" {',
        '  name          = "${var.project_name}-${var.environment}-subnet"',
        '  project       = google_project.main.project_id',
        '  network       = google_compute_network.main.id',
        '  ip_cidr_range = "10.0.1.0/24"',
        '  region        = var.region',
        '}',
      ].join('\n')
  }
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatHCLValue(
  value: string | number | boolean | string[],
  hclType: string,
): string {
  if (Array.isArray(value)) {
    const items = value.map((v) => `"${v}"`).join(', ')
    return `[${items}]`
  }
  if (typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'number') {
    return String(value)
  }
  // number-typed HCL variable with a string representation of a number
  if (hclType === 'number' && !isNaN(Number(value))) {
    return String(Number(value))
  }
  return `"${String(value)}"`
}

function variableBlock(
  name: string,
  type: string,
  description: string,
  defaultValue?: string,
  required?: boolean,
): string {
  const lines: string[] = [
    `variable "${name}" {`,
    `  description = "${description}"`,
    `  type        = ${type}`,
  ]

  if (required) {
    // No default – Terraform will require the variable
  } else if (defaultValue !== undefined && defaultValue !== '') {
    if (type === 'number') {
      lines.push(`  default     = ${defaultValue}`)
    } else if (type === 'bool') {
      lines.push(`  default     = ${defaultValue}`)
    } else {
      lines.push(`  default     = "${defaultValue}"`)
    }
  }

  lines.push('}')
  return lines.join('\n')
}
