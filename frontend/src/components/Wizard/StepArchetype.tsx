import { Database, Check } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { archetypeDescriptions, archetypeComponents } from '@/data/dependencies'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Archetype } from '@/types/config'

const archetypeKeys: Archetype[] = ['lakehouse', 'modern-dw', 'hybrid', 'custom']

export default function StepArchetype() {
  const cloud = useConfigStore((s) => s.cloud)
  const archetype = useConfigStore((s) => s.archetype)
  const selectArchetype = useConfigStore((s) => s.selectArchetype)
  const addComponent = useConfigStore((s) => s.addComponent)

  const handleSelect = (key: Archetype) => {
    selectArchetype(key)

    if (cloud) {
      const componentIds = archetypeComponents[key][cloud]
      for (const id of componentIds) {
        addComponent(id)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kies je Platform Type</h2>
        <p className="text-muted-foreground mt-1">
          Selecteer een architectuur patroon als startpunt. Je kunt later componenten aanpassen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archetypeKeys.map((key) => {
          const info = archetypeDescriptions[key]
          const isSelected = archetype === key
          const componentCount = cloud ? archetypeComponents[key][cloud].length : 0

          return (
            <Card
              key={key}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-muted-foreground/30'
              )}
              onClick={() => handleSelect(key)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {info.recommended && (
                      <Badge variant="default" className="text-xs">
                        Aanbevolen
                      </Badge>
                    )}
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {componentCount > 0
                      ? `${componentCount} componenten voorgeselecteerd`
                      : 'Geen voorgeselecteerde componenten'}
                  </span>
                  {cloud && componentCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {componentCount} componenten
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
