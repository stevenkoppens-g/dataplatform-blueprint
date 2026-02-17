import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useConfigStore } from '@/store/configStore'
import { cloudComponents } from '@/data/components'
import { calculateTotalCost } from '@/engine/costCalculator'
import type { CostSummary } from '@/engine/costCalculator'
import { formatCurrency, cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ComponentCategory } from '@/types/config'

const CATEGORY_COLORS: Record<ComponentCategory, string> = {
  compute: '#3b82f6',
  warehouse: '#8b5cf6',
  orchestration: '#f59e0b',
  storage: '#22c55e',
  networking: '#f97316',
  governance: '#06b6d4',
  monitoring: '#64748b',
  security: '#ef4444',
}

interface BarChartDatum {
  name: string
  cost: number
  category: ComponentCategory
  fill: string
}

interface PieChartDatum {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: BarChartDatum; value: number }>
  label?: string
  currency: 'EUR' | 'USD'
}

function BarTooltipContent({ active, payload, currency }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0]
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium">{data.payload.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(data.value, currency)}/mo
      </p>
      <Badge variant="outline" className="mt-1 text-xs capitalize">
        {data.payload.category}
      </Badge>
    </div>
  )
}

interface PieTooltipProps {
  active?: boolean
  payload?: Array<{ payload: PieChartDatum; value: number }>
  currency: 'EUR' | 'USD'
}

function PieTooltipContent({ active, payload, currency }: PieTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0]
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-medium capitalize">{data.payload.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(data.value, currency)}/mo
      </p>
    </div>
  )
}

export function CostDashboard() {
  const selectedComponentIds = useConfigStore((s) => s.selectedComponentIds)
  const componentConfigs = useConfigStore((s) => s.componentConfigs)
  const networking = useConfigStore((s) => s.networking)
  const currency = useConfigStore((s) => s.currency)
  const costThreshold = useConfigStore((s) => s.costThreshold)

  const selectedComponents = useMemo(
    () =>
      cloudComponents.filter((c) => selectedComponentIds.includes(c.id)),
    [selectedComponentIds],
  )

  const costSummary: CostSummary = useMemo(
    () => calculateTotalCost(selectedComponents, componentConfigs, networking),
    [selectedComponents, componentConfigs, networking],
  )

  const barChartData: BarChartDatum[] = useMemo(
    () =>
      costSummary.breakdown
        .filter((b) => b.totalCost > 0)
        .sort((a, b) => b.totalCost - a.totalCost)
        .map((b) => ({
          name: b.componentName,
          cost: Math.round(b.totalCost),
          category: b.category as ComponentCategory,
          fill: CATEGORY_COLORS[b.category as ComponentCategory] ?? '#64748b',
        })),
    [costSummary.breakdown],
  )

  const pieChartData: PieChartDatum[] = useMemo(() => {
    const entries = Object.entries(costSummary.byCategory)
      .filter(([, value]) => value > 0)
      .map(([category, value]) => ({
        name: category,
        value: Math.round(value),
        color: CATEGORY_COLORS[category as ComponentCategory] ?? '#64748b',
      }))
    return entries
  }, [costSummary.byCategory])

  const exceedsThreshold = costSummary.totalMonthly > costThreshold

  const networkingPercentage =
    costSummary.totalMonthly > 0
      ? (costSummary.networkingTotal / costSummary.totalMonthly) * 100
      : 0

  if (selectedComponents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select components to see cost estimates.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Total cost summary */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Monthly</p>
              <p
                className={cn(
                  'text-3xl font-bold tracking-tight',
                  exceedsThreshold && 'text-destructive',
                )}
              >
                {formatCurrency(costSummary.totalMonthly, currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yearly</p>
              <p className="text-2xl font-semibold tracking-tight text-muted-foreground">
                {formatCurrency(costSummary.totalYearly, currency)}
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant="outline">
                {selectedComponents.length} component
                {selectedComponents.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost threshold warning */}
      {exceedsThreshold && (
        <Alert variant="warning">
          <AlertDescription>
            The estimated monthly cost of{' '}
            <span className="font-semibold">
              {formatCurrency(costSummary.totalMonthly, currency)}
            </span>{' '}
            exceeds your configured threshold of{' '}
            <span className="font-semibold">
              {formatCurrency(costThreshold, currency)}
            </span>
            . Consider reviewing your component selections and configurations.
          </AlertDescription>
        </Alert>
      )}

      {/* Top 3 most expensive components */}
      <Card>
        <CardHeader>
          <CardTitle>Top Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costSummary.topExpensive.map((item, index) => (
              <div
                key={item.componentId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white',
                      index === 0 && 'bg-yellow-500',
                      index === 1 && 'bg-gray-400',
                      index === 2 && 'bg-amber-700',
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.componentName}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <p className="font-semibold">
                  {formatCurrency(item.totalCost, currency)}/mo
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar chart: cost breakdown per component */}
      {barChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cost by Component</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(barChartData.length * 40, 200)}>
              <BarChart
                data={barChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v, currency)} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fontSize: 12 }}
                />
                <RechartsTooltip
                  content={
                    <BarTooltipContent currency={currency} />
                  }
                />
                <Legend />
                <Bar dataKey="cost" name="Monthly Cost" radius={[0, 4, 4, 0]}>
                  {barChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Pie chart: cost by category */}
      {pieChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cost by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={
                      <PieTooltipContent currency={currency} />
                    }
                  />
                  <Legend
                    formatter={(value: string) => (
                      <span className="capitalize">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Networking cost impact */}
      <Card>
        <CardHeader>
          <CardTitle>Networking Cost Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Networking total
              </p>
              <p className="font-medium">
                {formatCurrency(costSummary.networkingTotal, currency)}/mo
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Share of total cost
              </p>
              <p className="font-medium">
                {networkingPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Private connectivity
              </p>
              <Badge variant={networking.private ? 'default' : 'secondary'}>
                {networking.private ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            {networking.private && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Private connectivity surcharge
                </p>
                <p className="font-medium">
                  {formatCurrency(
                    costSummary.breakdown.reduce(
                      (sum, b) => sum + b.privateConnectivityCost,
                      0,
                    ),
                    currency,
                  )}
                  /mo
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
