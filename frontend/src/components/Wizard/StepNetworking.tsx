import { Network, AlertTriangle, Info } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { networkingPricing } from '@/data/pricing'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn, formatCurrency } from '@/lib/utils'
import type { CloudProvider } from '@/types/config'

function getCostColor(cost: number): string {
  if (cost < 50) return 'text-green-600'
  if (cost < 200) return 'text-yellow-600'
  return 'text-red-600'
}

function getCostBadgeVariant(cost: number): 'secondary' | 'destructive' | 'outline' {
  if (cost < 50) return 'secondary'
  if (cost < 200) return 'outline'
  return 'destructive'
}

export default function StepNetworking() {
  const cloud = useConfigStore((s) => s.cloud)
  const networking = useConfigStore((s) => s.networking)
  const setNetworking = useConfigStore((s) => s.setNetworking)

  const pricing = cloud ? networkingPricing[cloud as CloudProvider] : []

  const totalNetworkingCost = pricing.reduce((sum, item) => {
    if (item.name.toLowerCase().includes('private') && networking.private) {
      return sum + item.monthlyCost
    }
    if (item.name.toLowerCase().includes('vpn') && networking.vpnGateway) {
      return sum + item.monthlyCost
    }
    if (
      (item.name.toLowerCase().includes('expressroute') ||
        item.name.toLowerCase().includes('direct connect') ||
        item.name.toLowerCase().includes('interconnect')) &&
      networking.expressRoute
    ) {
      return sum + item.monthlyCost
    }
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Networking</h2>
        <p className="text-muted-foreground mt-1">
          Configureer de netwerkopties voor je data platform.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Private Connectivity */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Private Connectivity</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Schakel private endpoints in voor alle services
                  </p>
                </div>
                <Switch
                  checked={networking.private}
                  onCheckedChange={(checked) => setNetworking({ private: checked })}
                />
              </div>

              {networking.private && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Private connectivity voegt extra kosten toe per service endpoint.
                    Elke service met private connectivity kost extra per maand.
                  </AlertDescription>
                </Alert>
              )}

              {/* VPN Gateway */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">VPN Gateway</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verbind on-premises netwerken via VPN tunnel
                  </p>
                </div>
                <Switch
                  checked={networking.vpnGateway}
                  onCheckedChange={(checked) => setNetworking({ vpnGateway: checked })}
                />
              </div>

              {/* ExpressRoute / Direct Connect / Interconnect */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {cloud === 'azure'
                        ? 'ExpressRoute'
                        : cloud === 'aws'
                          ? 'Direct Connect'
                          : 'Cloud Interconnect'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dedicated verbinding met hogere bandbreedte en lagere latency
                  </p>
                </div>
                <Switch
                  checked={networking.expressRoute}
                  onCheckedChange={(checked) => setNetworking({ expressRoute: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Netwerk Kosten Overzicht</CardTitle>
            </div>
            <CardDescription>
              Prijsindicatie voor netwerk componenten bij {cloud ? cloudProviderLabel(cloud) : 'je cloud provider'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pricing.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Selecteer eerst een cloud provider.
              </p>
            ) : (
              <div className="space-y-3">
                {pricing.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCostBadgeVariant(item.monthlyCost)}>
                        <span className={cn('text-xs font-semibold', getCostColor(item.monthlyCost))}>
                          {formatCurrency(item.monthlyCost)}
                        </span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.perUnit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Cost Impact */}
        {totalNetworkingCost > 0 && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Geschatte netwerk kosten impact</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(totalNetworkingCost)}/maand
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function cloudProviderLabel(cloud: CloudProvider): string {
  switch (cloud) {
    case 'azure':
      return 'Microsoft Azure'
    case 'aws':
      return 'Amazon Web Services'
    case 'gcp':
      return 'Google Cloud Platform'
  }
}
