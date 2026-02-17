import { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  type Node,
  type Edge,
  MarkerType,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useConfigStore } from '@/store/configStore'
import { cloudComponents } from '@/data/components'
import { calculateTotalCost } from '@/engine/costCalculator'
import { formatCurrency, getCostIndicator } from '@/lib/utils'
import type { CloudComponent, ComponentCategory } from '@/types/config'

const CATEGORY_ORDER: ComponentCategory[] = [
  'networking',
  'security',
  'compute',
  'warehouse',
  'orchestration',
  'storage',
  'governance',
  'monitoring',
]

const CATEGORY_BG_COLORS: Record<ComponentCategory, string> = {
  compute: '#dbeafe',
  warehouse: '#ede9fe',
  orchestration: '#fef3c7',
  storage: '#dcfce7',
  networking: '#ffedd5',
  governance: '#cffafe',
  monitoring: '#f1f5f9',
  security: '#fee2e2',
}

const CATEGORY_BORDER_COLORS: Record<ComponentCategory, string> = {
  compute: '#93c5fd',
  warehouse: '#c4b5fd',
  orchestration: '#fcd34d',
  storage: '#86efac',
  networking: '#fdba74',
  governance: '#67e8f9',
  monitoring: '#cbd5e1',
  security: '#fca5a5',
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 80
const HORIZONTAL_GAP = 40
const VERTICAL_GAP = 40
const CATEGORY_PADDING_TOP = 50
const CATEGORY_PADDING_BOTTOM = 20
const CATEGORY_PADDING_X = 20
const LEFT_OFFSET = 50

interface NodeData extends Record<string, unknown> {
  label: string
  category: ComponentCategory
  cost: string
  tier: string
  backgroundColor: string
}

function buildNodes(
  selectedComponents: CloudComponent[],
): Node<NodeData>[] {
  const grouped = new Map<ComponentCategory, CloudComponent[]>()
  for (const comp of selectedComponents) {
    const list = grouped.get(comp.category) ?? []
    list.push(comp)
    grouped.set(comp.category, list)
  }

  const nodes: Node<NodeData>[] = []
  let currentY = 0

  for (const category of CATEGORY_ORDER) {
    const components = grouped.get(category)
    if (!components || components.length === 0) continue

    const groupWidth =
      components.length * NODE_WIDTH +
      (components.length - 1) * HORIZONTAL_GAP +
      CATEGORY_PADDING_X * 2
    const groupHeight =
      NODE_HEIGHT + CATEGORY_PADDING_TOP + CATEGORY_PADDING_BOTTOM

    // Category group node
    nodes.push({
      id: `group-${category}`,
      type: 'group',
      position: { x: LEFT_OFFSET, y: currentY },
      data: {
        label: category,
        category,
        cost: '',
        tier: '',
        backgroundColor: CATEGORY_BG_COLORS[category],
      },
      style: {
        width: groupWidth,
        height: groupHeight,
        backgroundColor: CATEGORY_BG_COLORS[category],
        border: `1px solid ${CATEGORY_BORDER_COLORS[category]}`,
        borderRadius: 12,
        padding: 0,
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'capitalize' as const,
      },
    })

    // Component nodes within the group
    components.forEach((comp, index) => {
      const costIndicator = getCostIndicator(comp.monthlyBaseCost)
      nodes.push({
        id: comp.id,
        position: {
          x: CATEGORY_PADDING_X + index * (NODE_WIDTH + HORIZONTAL_GAP),
          y: CATEGORY_PADDING_TOP,
        },
        parentId: `group-${category}`,
        extent: 'parent' as const,
        data: {
          label: comp.name,
          category: comp.category,
          cost: costIndicator,
          tier: comp.tier,
          backgroundColor: CATEGORY_BG_COLORS[comp.category],
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          backgroundColor: '#ffffff',
          border: `2px solid ${CATEGORY_BORDER_COLORS[comp.category]}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 500,
          padding: '4px 8px',
          textAlign: 'center' as const,
        },
      })
    })

    currentY += groupHeight + VERTICAL_GAP
  }

  return nodes
}

function buildEdges(
  selectedComponents: CloudComponent[],
  selectedIds: Set<string>,
): Edge[] {
  const edges: Edge[] = []
  const edgeSet = new Set<string>()

  for (const comp of selectedComponents) {
    for (const depId of comp.dependencies) {
      if (!selectedIds.has(depId)) continue

      const edgeKey = `${comp.id}->${depId}`
      if (edgeSet.has(edgeKey)) continue
      edgeSet.add(edgeKey)

      edges.push({
        id: edgeKey,
        source: depId,
        target: comp.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      })
    }
  }

  return edges
}

export function ArchitectureVisualizer() {
  const selectedComponentIds = useConfigStore((s) => s.selectedComponentIds)
  const componentConfigs = useConfigStore((s) => s.componentConfigs)
  const networking = useConfigStore((s) => s.networking)
  const currency = useConfigStore((s) => s.currency)

  const selectedComponents = useMemo(
    () => cloudComponents.filter((c) => selectedComponentIds.includes(c.id)),
    [selectedComponentIds],
  )

  const selectedIdSet = useMemo(
    () => new Set(selectedComponentIds),
    [selectedComponentIds],
  )

  const costSummary = useMemo(
    () => calculateTotalCost(selectedComponents, componentConfigs, networking),
    [selectedComponents, componentConfigs, networking],
  )

  const initialNodes = useMemo(
    () => buildNodes(selectedComponents),
    [selectedComponents],
  )

  const initialEdges = useMemo(
    () => buildEdges(selectedComponents, selectedIdSet),
    [selectedComponents, selectedIdSet],
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const minimapNodeColor = useCallback(
    (node: Node) => {
      const data = node.data as NodeData | undefined
      if (data?.category) {
        return CATEGORY_BORDER_COLORS[data.category] ?? '#94a3b8'
      }
      return '#94a3b8'
    },
    [],
  )

  if (selectedComponents.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border bg-muted/30">
        <p className="text-muted-foreground">
          Select components to visualize the architecture.
        </p>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full rounded-xl border bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(0, 0, 0, 0.1)"
          pannable
          zoomable
        />
        <Panel position="top-right">
          <div className="rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur-sm">
            <p className="text-xs text-muted-foreground">Components</p>
            <p className="text-lg font-bold">{selectedComponents.length}</p>
            <div className="my-1 h-px bg-border" />
            <p className="text-xs text-muted-foreground">Est. Monthly Cost</p>
            <p className="text-lg font-bold">
              {formatCurrency(costSummary.totalMonthly, currency)}
            </p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
