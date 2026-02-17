import { useMemo } from 'react'
import {
  Cloud,
  Database,
  Server,
  HardDrive,
  Network,
  Shield,
  Activity,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { cloudComponents } from '@/data/components'
import { calculateTotalCost } from '@/engine/costCalculator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'

import StepCloudProvider from './StepCloudProvider'
import StepArchetype from './StepArchetype'
import StepCompute from './StepCompute'
import StepStorage from './StepStorage'
import StepNetworking from './StepNetworking'
import StepGovernance from './StepGovernance'
import StepMonitoring from './StepMonitoring'
import StepReview from './StepReview'

interface StepConfig {
  label: string
  icon: React.ReactNode
}

const steps: StepConfig[] = [
  { label: 'Cloud Provider', icon: <Cloud className="h-4 w-4" /> },
  { label: 'Platform Type', icon: <Database className="h-4 w-4" /> },
  { label: 'Compute', icon: <Server className="h-4 w-4" /> },
  { label: 'Storage', icon: <HardDrive className="h-4 w-4" /> },
  { label: 'Networking', icon: <Network className="h-4 w-4" /> },
  { label: 'Governance & Security', icon: <Shield className="h-4 w-4" /> },
  { label: 'Monitoring & Orchestration', icon: <Activity className="h-4 w-4" /> },
  { label: 'Review', icon: <Check className="h-4 w-4" /> },
]

const stepComponents = [
  StepCloudProvider,
  StepArchetype,
  StepCompute,
  StepStorage,
  StepNetworking,
  StepGovernance,
  StepMonitoring,
  StepReview,
]

export default function WizardLayout() {
  const currentStep = useConfigStore((s) => s.currentStep)
  const nextStep = useConfigStore((s) => s.nextStep)
  const prevStep = useConfigStore((s) => s.prevStep)
  const setStep = useConfigStore((s) => s.setStep)
  const selectedComponentIds = useConfigStore((s) => s.selectedComponentIds)
  const componentConfigs = useConfigStore((s) => s.componentConfigs)
  const networking = useConfigStore((s) => s.networking)

  const selectedComponents = useMemo(
    () => cloudComponents.filter((c) => selectedComponentIds.includes(c.id)),
    [selectedComponentIds]
  )

  const costSummary = useMemo(
    () => calculateTotalCost(selectedComponents, componentConfigs, networking),
    [selectedComponents, componentConfigs, networking]
  )

  const CurrentStepComponent = stepComponents[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar: Step Indicator */}
      <aside className="hidden lg:flex w-72 flex-col border-r bg-muted/30 p-6">
        <div className="mb-8">
          <h1 className="text-lg font-bold">Data Platform</h1>
          <p className="text-sm text-muted-foreground">Configurator</p>
        </div>

        <nav className="flex-1 space-y-1">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'text-foreground hover:bg-muted'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isActive
                      ? 'bg-primary-foreground text-primary'
                      : isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="truncate">{step.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-sm font-medium text-muted-foreground">
              Stap {currentStep + 1} van {steps.length}
            </span>
            <span className="text-sm font-semibold">{steps[currentStep].label}</span>
          </div>
          <div className="hidden lg:block">
            <span className="text-sm text-muted-foreground">
              Stap {currentStep + 1} van {steps.length}
            </span>
          </div>

          {/* Running Cost Badge */}
          <Badge variant="outline" className="text-sm px-3 py-1.5">
            <span className="text-muted-foreground mr-1.5">Geschatte kosten:</span>
            <span className="font-bold text-primary">
              {formatCurrency(costSummary.totalMonthly)}/maand
            </span>
          </Badge>
        </header>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {CurrentStepComponent && <CurrentStepComponent />}
        </div>

        {/* Bottom Navigation */}
        <footer className="border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4" />
              Vorige
            </Button>

            {/* Mobile Step Indicators */}
            <div className="flex gap-1.5 lg:hidden">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                        ? 'bg-primary/50'
                        : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              disabled={isLastStep}
            >
              Volgende
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      </main>
    </div>
  )
}
