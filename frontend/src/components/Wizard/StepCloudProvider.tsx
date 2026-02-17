import { Cloud, Check } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { cloudProviderInfo } from '@/data/dependencies'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CloudProvider } from '@/types/config'

const cloudProviderKeys: CloudProvider[] = ['azure', 'aws', 'gcp']

export default function StepCloudProvider() {
  const cloud = useConfigStore((s) => s.cloud)
  const selectCloud = useConfigStore((s) => s.selectCloud)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kies je Cloud Provider</h2>
        <p className="text-muted-foreground mt-1">
          Selecteer de cloud provider waarop je data platform wordt gehost.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cloudProviderKeys.map((key) => {
          const info = cloudProviderInfo[key]
          const isSelected = cloud === key

          return (
            <Card
              key={key}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-muted-foreground/30'
              )}
              onClick={() => selectCloud(key)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{info.name}</CardTitle>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sterke punten:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {info.strengths.map((strength) => (
                      <Badge key={strength} variant="secondary" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
