'use client';

import { useCallback, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnConnect,
  type NodeTypes,
  type EdgeTypes,
  ReactFlowProvider,
  BackgroundVariant,
  useReactFlow,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StartNode } from './nodes/StartNode';
import { ApprovalNode } from './nodes/ApprovalNode';
import { ConditionNode } from './nodes/ConditionNode';
import { ActionNode } from './nodes/ActionNode';
import { AiReviewNode } from './nodes/AiReviewNode';
import { WaitNode } from './nodes/WaitNode';
import { EndNode } from './nodes/EndNode';
import { ParallelNode } from './nodes/ParallelNode';
import { ConditionalEdge } from './edges/ConditionalEdge';

const nodeTypes: NodeTypes = {
  start: StartNode,
  approval: ApprovalNode,
  condition: ConditionNode,
  action: ActionNode,
  ai_review: AiReviewNode,
  wait: WaitNode,
  end: EndNode,
  parallel: ParallelNode,
};

const edgeTypes: EdgeTypes = {
  conditional: ConditionalEdge,
};

interface WorkflowCanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onGraphChange: (nodes: Node[], edges: Edge[]) => void;
  onNodeSelect: (node: Node | null) => void;
}

let nodeIdCounter = 0;
function getNextNodeId() {
  nodeIdCounter += 1;
  return `node_${Date.now()}_${nodeIdCounter}`;
}

function WorkflowCanvasInner({
  initialNodes,
  initialEdges,
  onGraphChange,
  onNodeSelect,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Notify parent on every change
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // We use a microtask so the state is updated before we read it
      queueMicrotask(() => {
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            onGraphChange(currentNodes, currentEdges);
            return currentEdges;
          });
          return currentNodes;
        });
      });
    },
    [onNodesChange, onGraphChange, setNodes, setEdges],
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      queueMicrotask(() => {
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            onGraphChange(currentNodes, currentEdges);
            return currentEdges;
          });
          return currentNodes;
        });
      });
    },
    [onEdgesChange, onGraphChange, setNodes, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      // Determine if this edge should be a conditional type
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const sourceHandle = connection.sourceHandle;
      const isConditional =
        sourceNode &&
        (sourceNode.type === 'approval' ||
          sourceNode.type === 'condition' ||
          sourceNode.type === 'ai_review') &&
        sourceHandle;

      const newEdge: Edge = {
        ...connection,
        id: `edge_${Date.now()}`,
        type: isConditional ? 'conditional' : 'default',
        data: sourceHandle ? { label: sourceHandle } : undefined,
      } as Edge;

      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        setNodes((currentNodes) => {
          onGraphChange(currentNodes, updated);
          return currentNodes;
        });
        return updated;
      });
    },
    [nodes, setEdges, setNodes, onGraphChange],
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect(node);
    },
    [onNodeSelect],
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Drop handler for palette drag
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      try {
        const { type, data } = JSON.parse(rawData);

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node = {
          id: getNextNodeId(),
          type,
          position,
          data,
        };

        setNodes((nds) => {
          const updated = [...nds, newNode];
          setEdges((currentEdges) => {
            onGraphChange(updated, currentEdges);
            return currentEdges;
          });
          return updated;
        });
      } catch {
        // Invalid drag data
      }
    },
    [screenToFlowPosition, setNodes, setEdges, onGraphChange],
  );

  // External method to update a specific node's data
  const updateNodeData = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === nodeId ? { ...n, data: newData } : n,
        );
        setEdges((currentEdges) => {
          onGraphChange(updated, currentEdges);
          return currentEdges;
        });
        return updated;
      });
    },
    [setNodes, setEdges, onGraphChange],
  );

  // External method to delete a node
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const updated = nds.filter((n) => n.id !== nodeId);
        setEdges((eds) => {
          const updatedEdges = eds.filter(
            (e) => e.source !== nodeId && e.target !== nodeId,
          );
          onGraphChange(updated, updatedEdges);
          return updatedEdges;
        });
        return updated;
      });
      onNodeSelect(null);
    },
    [setNodes, setEdges, onGraphChange, onNodeSelect],
  );

  // Expose these methods via a ref-like pattern using a custom attribute
  // The parent reads these from the component via a callback
  // Instead, we use a simpler approach: expose via window for now
  // Better approach: use imperative handle pattern

  // We store updateNodeData and deleteNode on the wrapper div as data attributes
  // Actually, let's just pass them through a ref callback
  if (reactFlowWrapper.current) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (reactFlowWrapper.current as any).__updateNodeData = updateNodeData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (reactFlowWrapper.current as any).__deleteNode = deleteNode;
  }

  return (
    <div ref={reactFlowWrapper} className="h-full w-full" data-workflow-canvas>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={true}
        snapGrid={[20, 20]}
        fitView
        defaultEdgeOptions={{
          type: 'default',
          style: { strokeWidth: 1.5, stroke: '#94a3b8' },
        }}
        connectionLineStyle={{ strokeWidth: 1.5, stroke: '#6366f1' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls
          position="bottom-left"
          className="!bg-white !border-slate-200 !shadow-sm !rounded-lg"
        />
        <MiniMap
          position="bottom-right"
          className="!bg-white !border-slate-200 !shadow-sm !rounded-lg"
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              start: '#10b981',
              approval: '#f59e0b',
              condition: '#3b82f6',
              action: '#6366f1',
              ai_review: '#a855f7',
              wait: '#64748b',
              end: '#ef4444',
              parallel: '#06b6d4',
            };
            return colors[n.type || ''] || '#94a3b8';
          }}
          maskColor="rgba(248, 250, 252, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}

// Wrap in Provider for external usage
export interface WorkflowCanvasRef {
  updateNodeData: (nodeId: string, newData: Record<string, unknown>) => void;
  deleteNode: (nodeId: string) => void;
}

interface WorkflowCanvasWrapperProps extends WorkflowCanvasProps {
  canvasRef?: React.MutableRefObject<WorkflowCanvasRef | null>;
}

export function WorkflowCanvas(props: WorkflowCanvasWrapperProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
