import { Shield, Lock, Check } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { cloudComponents } from '@/data/components'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, getCostIndicator } from '@/lib/utils'
import type { ComponentCategory } from '@/types/config'

const governanceCategories: ComponentCategory[] = ['governance', 'security']

function getCategoryIcon(category: ComponentCategory) {
  if (category === 'security') {
    return <Lock className="h-5 w-5 text-primary" />
  }
  return <Shield className="h-5 w-5 text-primary" />
}

export default function StepGovernance() {
  const cloud = useConfigStore((s) => s.cloud)
  const selectedComponentIds = useConfigStore((s) => s.selectedComponentIds)
  const toggleComponent = useConfigStore((s) => s.toggleComponent)

  const governanceComponents = cloudComponents.filter(
    (c) => c.cloud === cloud && governanceCategories.includes(c.category)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Governance & Security</h2>
        <p className="text-muted-foreground mt-1">
          Selecteer governance en security componenten voor je data platform.
        </p>
      </div>

      {governanceComponents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Selecteer eerst een cloud provider om beschikbare componenten te zien.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {governanceComponents.map((component) => {
            const isSelected = selectedComponentIds.includes(component.id)
            const costIndicator = getCostIndicator(component.monthlyBaseCost)

            return (
              <Card
                key={component.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'hover:border-muted-foreground/30'
                )}
                onClick={() => toggleComponent(component.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(component.category)}
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {component.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {costIndicator}
                      </Badge>
                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription>{component.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Basiskosten vanaf
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(component.monthlyBaseCost)}/maand
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
