import type { CloudComponent, ValidationError, CloudProvider } from '@/types/config'
import { cloudComponents } from '@/data/components'

/**
 * Return the IDs of dependencies that the given component requires but that
 * are not present in the current selection.
 */
export function getUnmetDependencies(
  componentId: string,
  selectedIds: string[],
  allComponents: CloudComponent[],
): string[] {
  const component = allComponents.find((c) => c.id === componentId)
  if (!component) return []

  return component.dependencies.filter((depId) => !selectedIds.includes(depId))
}

/**
 * Return the IDs of currently selected components that conflict with the
 * given component.
 */
export function getConflicts(
  componentId: string,
  selectedIds: string[],
  allComponents: CloudComponent[],
): string[] {
  const component = allComponents.find((c) => c.id === componentId)
  if (!component) return []

  return component.conflictsWith.filter((conflictId) =>
    selectedIds.includes(conflictId),
  )
}

/**
 * Validate the current configurator state and return an array of errors and
 * warnings.
 *
 * Checks performed:
 * 1. At least one component must be selected.
 * 2. A cloud provider must be set.
 * 3. Every selected component's dependencies must also be selected.
 * 4. No two selected components may conflict with each other.
 * 5. At least one storage component should be selected (warning).
 * 6. A networking component (VNet / VPC) should be selected (warning).
 */
export function validateConfiguration(
  selectedComponents: CloudComponent[],
  cloud: CloudProvider | null,
): ValidationError[] {
  const errors: ValidationError[] = []
  const selectedIds = selectedComponents.map((c) => c.id)

  // 1. At least one component selected
  if (selectedComponents.length === 0) {
    errors.push({
      componentId: '',
      message: 'At least one component must be selected.',
      severity: 'error',
    })
  }

  // 2. Cloud provider is set
  if (cloud === null) {
    errors.push({
      componentId: '',
      message: 'A cloud provider must be selected.',
      severity: 'error',
    })
  }

  // 3. Dependencies are met
  for (const component of selectedComponents) {
    const unmet = getUnmetDependencies(component.id, selectedIds, cloudComponents)
    for (const depId of unmet) {
      const depComponent = cloudComponents.find((c) => c.id === depId)
      const depName = depComponent ? depComponent.name : depId
      errors.push({
        componentId: component.id,
        message: `${component.name} requires ${depName}, which is not selected.`,
        severity: 'error',
      })
    }
  }

  // 4. No conflicts
  const reportedConflictPairs = new Set<string>()
  for (const component of selectedComponents) {
    const conflicts = getConflicts(component.id, selectedIds, cloudComponents)
    for (const conflictId of conflicts) {
      // Avoid reporting the same pair twice (A->B and B->A)
      const pairKey = [component.id, conflictId].sort().join('::')
      if (reportedConflictPairs.has(pairKey)) continue
      reportedConflictPairs.add(pairKey)

      const conflictComponent = cloudComponents.find((c) => c.id === conflictId)
      const conflictName = conflictComponent ? conflictComponent.name : conflictId
      errors.push({
        componentId: component.id,
        message: `${component.name} conflicts with ${conflictName}. Both cannot be selected at the same time.`,
        severity: 'error',
      })
    }
  }

  // 5. Storage component required (warn if none selected)
  const hasStorage = selectedComponents.some((c) => c.category === 'storage')
  if (selectedComponents.length > 0 && !hasStorage) {
    errors.push({
      componentId: '',
      message: 'No storage component is selected. Most architectures require a storage layer.',
      severity: 'warning',
    })
  }

  // 6. Networking component recommended (warn if no VNet/VPC selected)
  const hasNetworking = selectedComponents.some((c) => c.category === 'networking')
  if (selectedComponents.length > 0 && !hasNetworking) {
    errors.push({
      componentId: '',
      message: 'No networking component (VNet/VPC) is selected. Private connectivity requires a virtual network.',
      severity: 'warning',
    })
  }

  return errors
}
