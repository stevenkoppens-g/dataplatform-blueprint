import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('Select compound components must be used within a <Select> component')
  }
  return context
}

interface SelectProps {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Select = ({ children, value, defaultValue = '', onValueChange }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)

  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [value, onValueChange]
  )

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      {children}
    </SelectContext.Provider>
  )
}
Select.displayName = 'Select'

interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-9 w-full items-center justify-between',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    const { value } = useSelectContext()

    return (
      <span
        ref={ref}
        className={cn(
          'pointer-events-none truncate text-sm',
          !value && 'text-muted-foreground',
          className
        )}
        {...props}
      >
        {value || placeholder}
      </span>
    )
  }
)
SelectValue.displayName = 'SelectValue'

interface SelectContentProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode
}

const SelectContent = React.forwardRef<HTMLSelectElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { value, onValueChange } = useSelectContext()

    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          'absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        ref={ref}
        className={cn('text-sm', className)}
        {...props}
      >
        {children}
      </option>
    )
  }
)
SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
export type { SelectProps, SelectTriggerProps, SelectValueProps, SelectContentProps, SelectItemProps }
