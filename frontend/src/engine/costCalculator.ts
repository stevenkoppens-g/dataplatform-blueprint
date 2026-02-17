import type { CloudComponent, ComponentConfig, NetworkingConfig } from '@/types/config'

export interface CostBreakdown {
  componentId: string
  componentName: string
  category: string
  baseCost: number
  variableCosts: number
  privateConnectivityCost: number
  totalCost: number
}

export interface CostSummary {
  breakdown: CostBreakdown[]
  totalMonthly: number
  totalYearly: number
  byCategory: Record<string, number>
  topExpensive: CostBreakdown[]
  networkingTotal: number
  computeTotal: number
  storageTotal: number
}

/**
 * Calculate the cost breakdown for a single cloud component given its
 * configuration and the current networking settings.
 *
 * Variable costs are derived from each cost factor: the unit cost is multiplied
 * by the quantity found in the component config (keyed by the factor name) or,
 * when no override is present, the factor's default quantity.
 *
 * Private connectivity cost is added when networking is set to private and the
 * component declares that it requires private connectivity.
 */
export function calculateComponentCost(
  component: CloudComponent,
  config: ComponentConfig,
  networking: NetworkingConfig,
): CostBreakdown {
  const baseCost = component.monthlyBaseCost

  const variableCosts = component.costFactors.reduce((sum, factor) => {
    const configValue = config[factor.name]
    const quantity =
      typeof configValue === 'number' ? configValue : factor.defaultQuantity
    return sum + factor.unitCost * quantity
  }, 0)

  const privateConnectivityCost =
    networking.private && component.requiresPrivateConnectivity
      ? component.privateConnectivityCost
      : 0

  const totalCost = baseCost + variableCosts + privateConnectivityCost

  return {
    componentId: component.id,
    componentName: component.name,
    category: component.category,
    baseCost,
    variableCosts,
    privateConnectivityCost,
    totalCost,
  }
}

/**
 * Calculate a full cost summary across all selected components.
 *
 * The summary includes:
 * - A per-component breakdown
 * - Monthly and yearly totals
 * - Totals grouped by component category
 * - The top 3 most expensive components
 * - Convenience totals for networking, compute, and storage categories
 */
export function calculateTotalCost(
  components: CloudComponent[],
  configs: Record<string, ComponentConfig>,
  networking: NetworkingConfig,
): CostSummary {
  const breakdown: CostBreakdown[] = components.map((component) => {
    const config: ComponentConfig = configs[component.id] ?? {}
    return calculateComponentCost(component, config, networking)
  })

  const totalMonthly = breakdown.reduce((sum, b) => sum + b.totalCost, 0)
  const totalYearly = totalMonthly * 12

  const byCategory: Record<string, number> = {}
  for (const entry of breakdown) {
    byCategory[entry.category] = (byCategory[entry.category] ?? 0) + entry.totalCost
  }

  const topExpensive = [...breakdown]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 3)

  const networkingTotal = byCategory['networking'] ?? 0
  const computeTotal = byCategory['compute'] ?? 0
  const storageTotal = byCategory['storage'] ?? 0

  return {
    breakdown,
    totalMonthly,
    totalYearly,
    byCategory,
    topExpensive,
    networkingTotal,
    computeTotal,
    storageTotal,
  }
}
