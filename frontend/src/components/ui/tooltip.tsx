import * as React from 'react'
import { cn } from '@/lib/utils'

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}
TooltipProvider.displayName = 'TooltipProvider'

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}
Tooltip.displayName = 'Tooltip'

const TooltipTrigger = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('group relative inline-flex', className)}
    {...props}
  />
))
TooltipTrigger.displayName = 'TooltipTrigger'

interface TooltipContentProps extends React.HTMLAttributes<HTMLSpanElement> {
  side?: 'top' | 'bottom' | 'left' | 'right'
}

const TooltipContent = React.forwardRef<HTMLSpanElement, TooltipContentProps>(
  ({ className, side = 'top', ...props }, ref) => {
    const sideClasses = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    }

    return (
      <span
        ref={ref}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 w-max max-w-xs rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100',
          sideClasses[side],
          className
        )}
        {...props}
      />
    )
  }
)
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
export type { TooltipContentProps }
