import { useMemo } from 'react'
import { Check, AlertTriangle, ChevronRight } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { cloudComponents } from '@/data/components'
import { calculateTotalCost } from '@/engine/costCalculator'
import { validateConfiguration } from '@/engine/validator'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn, formatCurrency } from '@/lib/utils'
import type { ComponentCategory } from '@/types/config'

const categoryLabels: Record<ComponentCategory, string> = {
  compute: 'Compute',
  warehouse: 'Data Warehouse',
  orchestration: 'Orchestration',
  storage: 'Storage',
  networking: 'Networking',
  governance: 'Governance',
  monitoring: 'Monitoring',
  security: 'Security',
}

const environments = ['dev', 'staging', 'prod'] as const

export default function StepReview() {
  const cloud = useConfigStore((s) => s.cloud)
  const selectedComponentIds = useConfigStore((s) => s.selectedComponentIds)
  const componentConfigs = useConfigStore((s) => s.componentConfigs)
  const networking = useConfigStore((s) => s.networking)
  const environment = useConfigStore((s) => s.environment)
  const setEnvironment = useConfigStore((s) => s.setEnvironment)
  const tags = useConfigStore((s) => s.tags)
  const setTags = useConfigStore((s) => s.setTags)

  const selectedComponents = useMemo(
    () => cloudComponents.filter((c) => selectedComponentIds.includes(c.id)),
    [selectedComponentIds]
  )

  const costSummary = useMemo(
    () => calculateTotalCost(selectedComponents, componentConfigs, networking),
    [selectedComponents, componentConfigs, networking]
  )

  const validationErrors = useMemo(
    () => validateConfiguration(selectedComponents, cloud),
    [selectedComponents, cloud]
  )

  const errors = validationErrors.filter((e) => e.severity === 'error')
  const warnings = validationErrors.filter((e) => e.severity === 'warning')

  // Group selected components by category
  const groupedComponents = useMemo(() => {
    const grouped: Partial<Record<ComponentCategory, typeof selectedComponents>> = {}
    for (const component of selectedComponents) {
      if (!grouped[component.category]) {
        grouped[component.category] = []
      }
      grouped[component.category]!.push(component)
    }
    return grouped
  }, [selectedComponents])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review & Configuratie</h2>
        <p className="text-muted-foreground mt-1">
          Controleer je configuratie en genereer de output.
        </p>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <Alert key={`error-${index}`} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <Alert key={`warning-${index}`} variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{warning.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Selected Components by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Geselecteerde Componenten</CardTitle>
          <CardDescription>
            {selectedComponents.length} componenten geselecteerd
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedComponents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Geen componenten geselecteerd.
            </p>
          ) : (
            <div className="space-y-4">
              {(Object.entries(groupedComponents) as [ComponentCategory, typeof selectedComponents][]).map(
                ([category, components]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold mb-2">
                      {categoryLabels[category] ?? category}
                    </h4>
                    <div className="space-y-1">
                      {components.map((component) => {
                        const breakdown = costSummary.breakdown.find(
                          (b) => b.componentId === component.id
                        )
                        return (
                          <div
                            key={component.id}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{component.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(breakdown?.totalCost ?? component.monthlyBaseCost)}/maand
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kostenoverzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(costSummary.byCategory).map(([category, cost]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{category}</span>
                <span className="text-sm font-medium">{formatCurrency(cost)}</span>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Totaal per maand</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(costSummary.totalMonthly)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-muted-foreground">Geschat per jaar</span>
                <span className="text-sm font-medium">
                  {formatCurrency(costSummary.totalYearly)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment</CardTitle>
          <CardDescription>Selecteer de doelomgeving voor deployment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {environments.map((env) => (
              <Button
                key={env}
                variant={environment === env ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEnvironment(env)}
                className="capitalize"
              >
                {env}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
          <CardDescription>Configureer tags voor resource management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="tag-project" className="text-sm font-medium">
                Project
              </label>
              <input
                id="tag-project"
                type="text"
                value={tags.project}
                onChange={(e) => setTags({ project: e.target.value })}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tag-environment" className="text-sm font-medium">
                Environment
              </label>
              <input
                id="tag-environment"
                type="text"
                value={tags.environment}
                onChange={(e) => setTags({ environment: e.target.value })}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tag-owner" className="text-sm font-medium">
                Owner
              </label>
              <input
                id="tag-owner"
                type="text"
                value={tags.owner}
                onChange={(e) => setTags({ owner: e.target.value })}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tag-costcenter" className="text-sm font-medium">
                Cost Center
              </label>
              <input
                id="tag-costcenter"
                type="text"
                value={tags.costCenter}
                onChange={(e) => setTags({ costCenter: e.target.value })}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" className="flex-1" disabled={errors.length > 0}>
          <ChevronRight className="h-4 w-4" />
          Genereer Terraform
        </Button>
        <Button variant="outline" size="lg" className="flex-1">
          Exporteer Configuratie
        </Button>
      </div>

      {errors.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Los de bovenstaande fouten op voordat je Terraform kunt genereren.
        </p>
      )}
    </div>
  )
}
