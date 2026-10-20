'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
  ReactFlowInstance,
} from '@xyflow/react';
import { toPng } from 'html-to-image';

import { nodeTypes } from '@/components/nodes';
import { DeletableEdge } from './DeletableEdge';
import { ContextMenu, ContextMenuState } from './ContextMenu';
import { NodeToolbar } from '@/components/toolbar/NodeToolbar';
import { Header } from '@/components/toolbar/Header';
import { TemplatesModal } from '@/components/modals/TemplatesModal';
import { AddKeyModal } from '@/components/modals/AddKeyModal';
import { getStoredApiKeys } from '@/utils/apiKeys';

import {
  BrandVoiceModal,
  getStoredBrandVoice,
} from '@/components/toolbar/BrandVoiceModal';
import { WorkspacesModal } from '@/components/toolbar/WorkspacesModal';
import { CommandPalette } from '@/components/toolbar/CommandPalette';
import { ShortcutsModal } from '@/components/toolbar/ShortcutsModal';
import { SettingsModal } from '@/components/toolbar/SettingsModal';
import { ABTesterModal } from '@/components/toolbar/ABTesterModal';
import { ModelsHubModal } from '@/components/toolbar/ModelsHubModal';
import { NodeInspector } from './NodeInspector';
import { FloatingBottomDock } from './FloatingBottomDock';
import { AppModeView } from './AppModeView';
import { BottomExecutionPanel } from './BottomExecutionPanel';
import { TestingLabModal } from '@/components/toolbar/TestingLabModal';
import { QuickAddNodeMenu } from './QuickAddNodeMenu';
import { validateWorkflow } from '@/engine/workflowValidator';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { sampleTemplates } from '@/data/sampleWorkflows';
import { saveLocalWorkflow, exportWorkflowToFile, importWorkflowFromFile } from '@/utils/localWorkflowStorage';
import { buildWorkflowFromPrompt } from '@/engine/smartArchitect';
import {
  runWorkflowEngine,
  runSingleNode,
  runWorkflowFromNode,
  ExecutionLog,
} from '@/engine/executionEngine';
import { triggerNodeDataUpdate } from '@/utils/nodeReactivity';
import { getLayoutedElements } from '@/engine/autoLayout';
import {
  WorkflowTemplate,
  ExecutionMetrics,
  StudioSettings,
} from '@/types/workflow';
import {
  getStudioSettings,
  saveStudioSettings,
  DEFAULT_STUDIO_SETTINGS,
} from '@/utils/studioSettings';
import {
  Terminal,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Coins,
  Trash2,
  ArrowUpRight,
  X,
} from 'lucide-react';

const CANVAS_STORAGE_KEY = 'promptflow_canvas_state';

export const generateUniqueEdgeId = (source: string = 'src', target: string = 'tgt'): string => {
  return `edge_${source}_${target}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

export const sanitizeAndDeduplicateEdges = (edges: Edge[]): Edge[] => {
  if (!Array.isArray(edges)) return [];
  const seenIds = new Set<string>();
  const seenConnections = new Set<string>();
  const sanitized: Edge[] = [];

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (!edge || !edge.source || !edge.target) continue;

    // Deduplicate identical parallel connections between same handles
    const connKey = `${edge.source}:${edge.sourceHandle || ''}->${edge.target}:${edge.targetHandle || ''}`;
    if (seenConnections.has(connKey)) {
      continue;
    }
    seenConnections.add(connKey);

    // Ensure deterministic unique ID without Math.random() / Date.now() during render!
    let finalId = edge.id;
    if (!finalId || seenIds.has(finalId)) {
      finalId = `edge_${edge.source}_${edge.sourceHandle || 'out'}_${edge.target}_${edge.targetHandle || 'in'}`;
      if (seenIds.has(finalId)) {
        finalId = `${finalId}_${i}`;
      }
    }
    seenIds.add(finalId);

    sanitized.push(finalId === edge.id ? edge : { ...edge, id: finalId });
  }

  return sanitized;
};

const edgeTypes = {
  deletable: DeletableEdge,
  default: DeletableEdge,
};

const WorkflowCanvasInner: React.FC = () => {
  const { showToast, dismissToast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Initialize with the 1st pre-built template
  const initialTemplate = sampleTemplates[0];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialTemplate.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    sanitizeAndDeduplicateEdges(initialTemplate.edges)
  );

  const [isRunning, setIsRunning] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    'appearance' | 'ai' | 'keys' | 'execution' | 'storage'
  >('appearance');
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [isBrandVoiceOpen, setIsBrandVoiceOpen] = useState(false);
  const [isBrandVoiceActive, setIsBrandVoiceActive] = useState(false);
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isABTesterOpen, setIsABTesterOpen] = useState(false);
  const [isModelsHubOpen, setIsModelsHubOpen] = useState(false);
  const [isTestingLabOpen, setIsTestingLabOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [addKeyInitialProvider, setAddKeyInitialProvider] = useState<string | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync and track active API keys status
  const refreshApiKeysStatus = useCallback(() => {
    const keys = getStoredApiKeys();
    const studio = getStudioSettings();
    const hasAny = Boolean(
      keys.geminiKey ||
      keys.openaiKey ||
      keys.groqKey ||
      keys.anthropicKey ||
      studio.geminiKey ||
      studio.openaiKey ||
      studio.groqKey ||
      studio.anthropicKey
    );
    setHasApiKeys(hasAny);
  }, []);

  useEffect(() => {
    refreshApiKeysStatus();
    const handleKeysChange = () => refreshApiKeysStatus();
    window.addEventListener('promptflow_api_keys_changed', handleKeysChange);
    return () => window.removeEventListener('promptflow_api_keys_changed', handleKeysChange);
  }, [refreshApiKeysStatus]);

  // Listen to open-add-key event from nodes or anywhere across the canvas
  useEffect(() => {
    const handleOpenAddKey = (e: any) => {
      setAddKeyInitialProvider(e.detail?.provider);
      setIsAddKeyModalOpen(true);
    };
    window.addEventListener('promptflow:open-add-key', handleOpenAddKey);
    return () => window.removeEventListener('promptflow:open-add-key', handleOpenAddKey);
  }, []);

  // Listen to global promptflow:toast events from the execution engine
  useEffect(() => {
    const handleEngineToast = (e: any) => {
      if (e.detail) {
        showToast(e.detail.title, e.detail.message, e.detail.type || 'error');
      }
    };
    window.addEventListener('promptflow:toast', handleEngineToast);
    return () => window.removeEventListener('promptflow:toast', handleEngineToast);
  }, [showToast]);

  // Workflow Graph Integrity & Cycle Validation
  const validationResult = useMemo(() => {
    return validateWorkflow(nodes, edges);
  }, [nodes, edges]);

  // Clean, unique deduplicated edges list guaranteed to never produce duplicate keys in React Flow
  const uniqueEdges = useMemo(() => {
    return sanitizeAndDeduplicateEdges(edges);
  }, [edges]);

  // Studio Settings state
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);

  // Node Inspector drawer
  const [inspectorNodeId, setInspectorNodeId] = useState<string | null>(null);

  // App Mode View state
  const [isAppModeOpen, setIsAppModeOpen] = useState(false);

  // Interactive Canvas Background Cursor Tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Clipboard for Copy / Paste
  const [clipboardNode, setClipboardNode] = useState<Node | null>(null);

  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [currentWorkflowTitle, setCurrentWorkflowTitle] = useState<string>('المسار الرئيسي');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [isHydrated, setIsHydrated] = useState(false);

  // 3-Tier Context Menu state
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState | null>(null);

  // Quick Add Node on Wire Drop state
  const [quickConnectState, setQuickConnectState] = useState<{
    isOpen: boolean;
    screenX: number;
    screenY: number;
    flowPosition: { x: number; y: number };
    sourceNodeId: string;
    sourceHandleId: string | null;
    sourceHandleType: 'source' | 'target';
  } | null>(null);

  const connectingNodeRef = useRef<{
    nodeId: string;
    handleId: string | null;
    handleType: 'source' | 'target' | null;
  } | null>(null);

  // AI Copilot Workflow Builder state
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isUndoRedoAction = useRef(false);

  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [metrics, setMetrics] = useState<ExecutionMetrics>({
    totalTokens: 0,
    totalCostUsd: 0,
    completedNodesCount: 0,
  });

  // Push snapshot to history stack
  const takeSnapshot = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [
          ...next,
          {
            nodes: JSON.parse(JSON.stringify(currentNodes)),
            edges: JSON.parse(JSON.stringify(currentEdges)),
          },
        ].slice(-30);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const target = history[historyIndex - 1];
      setNodes(target.nodes);
      setEdges(target.edges);
      setHistoryIndex(historyIndex - 1);
      showToast('تراجع (Undo) ↩️', undefined, 'info');
    }
  }, [history, historyIndex, setNodes, setEdges, showToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const target = history[historyIndex + 1];
      setNodes(target.nodes);
      setEdges(target.edges);
      setHistoryIndex(historyIndex + 1);
      showToast('إعادة (Redo) ↪️', undefined, 'info');
    }
  }, [history, historyIndex, setNodes, setEdges, showToast]);

  // Update specific node's data in the canvas state & React Flow store
  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<any>) => {
      // 1. Immediately update React Flow internal store for instant node re-render
      if (reactFlowInstance) {
        try {
          reactFlowInstance.updateNodeData(nodeId, updates);
        } catch (e) {
          console.warn('reactFlowInstance.updateNodeData error:', e);
        }
      }

      // 2. Update React nodes state for persistence & Inspector sync
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            };
          }
          return node;
        })
      );

      if (updates.output !== undefined || updates.text !== undefined || updates.fileContent !== undefined) {
        triggerNodeDataUpdate(
          nodeId,
          String(updates.output ?? updates.text ?? updates.fileContent ?? '')
        );
      }
    },
    [setNodes, reactFlowInstance]
  );

  // Copy node
  const handleCopyNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setClipboardNode(JSON.parse(JSON.stringify(node)));
        const nodeLabel = String((node.data as any)?.label || node.id);
        showToast('تم نسخ العقدة إلى الحافظة 📋', nodeLabel, 'info');
      }
    },
    [nodes, showToast]
  );

  // Duplicate node
  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const newNode: Node = {
          ...JSON.parse(JSON.stringify(node)),
          id: `node_${Date.now()}`,
          position: {
            x: node.position.x + 40,
            y: node.position.y + 40,
          },
          selected: true,
          data: {
            ...node.data,
            label: `${(node.data as any)?.label || 'عقدة'} (نسخة)`,
            status: 'idle',
            output: '',
          },
        };
        setNodes((nds) => {
          const next = [...nds.map((n) => ({ ...n, selected: false })), newNode];
          takeSnapshot(next, edges);
          return next;
        });
        showToast('تم مضاعفة العقدة بنجاح 👯', (newNode.data as any)?.label, 'success');
      }
    },
    [nodes, edges, setNodes, takeSnapshot, showToast]
  );

  // Paste node
  const handlePasteNode = useCallback(
    (position?: { x: number; y: number }) => {
      if (!clipboardNode) return;
      const pos = position || {
        x: clipboardNode.position.x + 50,
        y: clipboardNode.position.y + 50,
      };
      const newNode: Node = {
        ...JSON.parse(JSON.stringify(clipboardNode)),
        id: `node_${Date.now()}`,
        position: pos,
        selected: true,
        data: {
          ...clipboardNode.data,
          label: `${(clipboardNode.data as any)?.label || 'عقدة'} (ملصوقة)`,
          status: 'idle',
          output: '',
        },
      };
      setNodes((nds) => {
        const next = [...nds.map((n) => ({ ...n, selected: false })), newNode];
        takeSnapshot(next, edges);
        return next;
      });
      showToast('تم لصق العقدة بنجاح 📋', (newNode.data as any)?.label, 'success');
    },
    [clipboardNode, edges, setNodes, takeSnapshot, showToast]
  );

  // Reset node output
  const handleResetNodeOutput = useCallback(
    (nodeId: string) => {
      handleUpdateNode(nodeId, {
        output: '',
        status: 'idle',
        executionDuration: undefined,
        tokensUsed: undefined,
      });
      showToast('تمت إعادة تعيين مخرجات العقدة 🔄', undefined, 'info');
    },
    [handleUpdateNode, showToast]
  );

  // Toggle node collapse
  const handleToggleCollapseNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        handleUpdateNode(nodeId, { isCollapsed: !node.data?.isCollapsed });
      }
    },
    [nodes, handleUpdateNode]
  );

  // Disconnect all edges for node
  const handleDisconnectNodeEdges = useCallback(
    (nodeId: string) => {
      setEdges((eds) => {
        const next = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
        takeSnapshot(nodes, next);
        return next;
      });
      showToast('تم فصل جميع الأسلاك المرتبطة بالعقدة 🔌', undefined, 'info');
    },
    [nodes, setEdges, takeSnapshot, showToast]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const nextNodes = nds.filter((n) => n.id !== nodeId);
        setEdges((eds) => {
          const nextEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
          takeSnapshot(nextNodes, nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });
      if (inspectorNodeId === nodeId) {
        setInspectorNodeId(null);
      }
      showToast('تم حذف العقدة 🗑️', undefined, 'info');
    },
    [setNodes, setEdges, takeSnapshot, showToast, inspectorNodeId]
  );

  // Delete edge
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => {
        const next = eds.filter((e) => e.id !== edgeId);
        takeSnapshot(nodes, next);
        return next;
      });
      showToast('تم حذف المسار ✂️', undefined, 'info');
    },
    [nodes, setEdges, takeSnapshot, showToast]
  );

  // Insert node between edge endpoints
  const handleInsertNodeOnEdge = useCallback(
    (edgeId: string, nodeType: string) => {
      const targetEdge = edges.find((e) => e.id === edgeId);
      if (!targetEdge) return;

      const sourceNode = nodes.find((n) => n.id === targetEdge.source);
      const targetNode = nodes.find((n) => n.id === targetEdge.target);

      const midX =
        sourceNode && targetNode
          ? (sourceNode.position.x + targetNode.position.x) / 2
          : 350;
      const midY =
        sourceNode && targetNode
          ? (sourceNode.position.y + targetNode.position.y) / 2
          : 300;

      const newNodeId = `node_${Date.now()}`;
      const newNode: Node = {
        id: newNodeId,
        type: nodeType,
        position: { x: midX, y: midY },
        data: getDefaultNodeData(nodeType),
      };

      const edge1: Edge = {
        id: generateUniqueEdgeId(targetEdge.source, newNodeId),
        source: targetEdge.source,
        sourceHandle: targetEdge.sourceHandle,
        target: newNodeId,
        targetHandle: nodeType === 'templateMerge' ? 'input_1' : 'context',
        type: 'deletable',
        animated: studioSettings.animatedEdges,
        style: { stroke: '#818cf8', strokeWidth: 2 },
      };

      const edge2: Edge = {
        id: generateUniqueEdgeId(newNodeId, targetEdge.target),
        source: newNodeId,
        sourceHandle: 'output',
        target: targetEdge.target,
        targetHandle: targetEdge.targetHandle,
        type: 'deletable',
        animated: studioSettings.animatedEdges,
        style: { stroke: '#818cf8', strokeWidth: 2 },
      };

      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) => {
        const filtered = eds.filter((e) => e.id !== edgeId);
        const nextEdges = sanitizeAndDeduplicateEdges([...filtered, edge1, edge2]);
        takeSnapshot([...nodes, newNode], nextEdges);
        return nextEdges;
      });

      showToast('تم إدراج العقدة بنجاح بين المسارين ➕', undefined, 'success');
    },
    [edges, nodes, setNodes, setEdges, takeSnapshot, showToast, studioSettings.animatedEdges]
  );

  // Clear all previous outputs
  const handleClearAllOutputs = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          output: '',
          status: 'idle',
          executionDuration: undefined,
          tokensUsed: undefined,
        },
      }))
    );
    setLogs([]);
    showToast('تم مسح كافة المخرجات السابقة 🧹', undefined, 'info');
  }, [setNodes, showToast]);

  // Fit View
  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.25, duration: 600 });
  }, [reactFlowInstance]);

  // Stop workflow execution
  const handleStopWorkflow = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    // Reset any node that is currently 'running' back to 'idle'
    setNodes((nds) =>
      nds.map((n) =>
        n.data?.status === 'running'
          ? { ...n, data: { ...n.data, status: 'idle' } }
          : n
      )
    );
    showToast('تم إلغاء التنفيذ فوراً وحفظ الرصيد ⏹️', undefined, 'info');
  }, [setNodes, showToast]);

  // Run full workflow
  const handleRunWorkflow = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setIsLogsOpen(true);
    setLogs([]);

    // Immediately clear old outputs of all processing/AI nodes
    nodes.forEach((n) => {
      if (n.type !== 'textInput' && n.type !== 'fileUpload' && n.type !== 'note') {
        handleUpdateNode(n.id, {
          status: 'idle',
          output: '',
          errorMessage: undefined,
          executionDuration: undefined,
          tokensUsed: undefined,
        });
      }
    });

    showToast('بدء تشغيل مسار العمل ⚡', undefined, 'ai');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await runWorkflowEngine(
        nodes,
        edges,
        handleUpdateNode,
        (log) => setLogs((prev) => [...prev, log]),
        {},
        controller.signal
      );
      if (result.metrics) {
        setMetrics(result.metrics);
      }
      if (result.cancelled) {
        showToast('تم إيقاف المسار بنجاح ⏹️', undefined, 'info');
      } else if (!result.success) {
        showToast('فشل في تشغيل السلسلة', result.error || 'يرجى مراجعة إعدادات العقد أو مفاتيح الـ API', 'error');
      } else {
        showToast('اكتمل تشغيل السلسلة بنجاح ✨', undefined, 'success');
      }
    } catch (err: unknown) {
      const errMessage = (err as Error)?.message || 'حدث خطأ في تشغيل السلسلة';
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Workflow error:', err);
        showToast('فشل في تشغيل السلسلة', errMessage, 'error');
      }
    } finally {
      abortControllerRef.current = null;
      setIsRunning(false);
    }
  }, [isRunning, nodes, edges, handleUpdateNode, showToast]);

  // Run Single Node with live input pulling and reactive propagation
  const handleRunSingleNode = useCallback(
    async (nodeId: string) => {
      if (isRunning) return;

      setIsRunning(true);
      setIsLogsOpen(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const currentNodes = reactFlowInstance ? reactFlowInstance.getNodes() : nodes;
      const currentEdges = reactFlowInstance ? reactFlowInstance.getEdges() : edges;
      const targetNode = currentNodes.find((n) => n.id === nodeId);
      const targetLabel = (targetNode?.data as any)?.label || nodeId;

      // Clear previous outputs immediately and show running state
      handleUpdateNode(nodeId, {
        status: 'running',
        output: '',
        errorMessage: undefined,
        executionDuration: undefined,
        tokensUsed: undefined,
      });

      showToast(`تشغيل فردي: ${targetLabel} ▶️`, undefined, 'ai');
      try {
        const output = await runSingleNode(
          nodeId,
          currentNodes,
          currentEdges,
          handleUpdateNode,
          (log) => setLogs((prev) => [...prev, log]),
          controller.signal
        );

        handleUpdateNode(nodeId, {
          status: 'completed',
          output,
        });
        triggerNodeDataUpdate(nodeId, output, { status: 'completed' });
        showToast('اكتمل تشغيل العقدة بنجاح ✅', targetLabel, 'success');
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) {
          handleUpdateNode(nodeId, { status: 'idle' });
          showToast('تم إيقاف تشغيل العقدة ⏹️', undefined, 'info');
          return;
        }
        console.error('Single run error:', err);
        const isMissingKey = Boolean(err?.missingKey || err?.message?.includes('مفتاح'));
        handleUpdateNode(nodeId, {
          status: 'error',
          errorMessage: err.message,
          missingKey: isMissingKey,
          requiredProvider: err?.requiredProvider || 'gemini',
          requiredKeyName: err?.requiredKeyName || 'Google Gemini API Key',
          output: '',
        });
        showToast(
          isMissingKey ? 'مطلوب إدخال مفتاح الـ API 🔑' : 'تنبيه خطأ في التشغيل ⚠️',
          err.message,
          'error'
        );
      } finally {
        abortControllerRef.current = null;
        setIsRunning(false);
      }
    },
    [isRunning, reactFlowInstance, nodes, edges, handleUpdateNode, showToast, triggerNodeDataUpdate]
  );

  // Run from node to end of DAG
  const handleRunFromNode = useCallback(
    async (nodeId: string) => {
      if (isRunning) return;
      setIsRunning(true);
      setIsLogsOpen(true);
      showToast('جاري التشغيل من هذه العقدة حتى النهاية ⏭️', undefined, 'ai');
      try {
        const result = await runWorkflowFromNode(
          nodeId,
          nodes,
          edges,
          handleUpdateNode,
          (log) => setLogs((prev) => [...prev, log])
        );
        if (result.metrics) setMetrics(result.metrics);
        showToast('اكتمل المسار بنجاح ✨', undefined, 'success');
      } catch (err: any) {
        console.error('Run from node error:', err);
        const isMissingKey = Boolean(err?.missingKey || err?.message?.includes('مفتاح'));
        showToast(
          isMissingKey ? 'مطلوب إدخال مفتاح الـ API 🔑' : 'فشل في متابعة التشغيل',
          err.message,
          'error'
        );
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, nodes, edges, handleUpdateNode, showToast]
  );

  // Auto-Layout with Dagre supporting 'TB', 'LR', and 'RL' (Arabic default)
  const handleAutoLayout = useCallback(
    (direction: 'TB' | 'LR' | 'RL' = 'RL') => {
      saveStudioSettings({ layoutDirection: direction });
      window.dispatchEvent(
        new CustomEvent('promptflow:layout-changed', {
          detail: { layoutDirection: direction },
        })
      );
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      takeSnapshot(layoutedNodes, layoutedEdges);
      const dirText =
        direction === 'RL'
          ? 'أفقي عربي (RTL)'
          : direction === 'LR'
          ? 'أفقي (LR)'
          : 'عمودي (TB)';
      showToast(`تم الترتيب التلقائي للعقد: ${dirText} ✨`, undefined, 'info');
      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2, duration: 500 });
      }, 100);
    },
    [nodes, edges, reactFlowInstance, setNodes, setEdges, takeSnapshot, showToast]
  );

  // AI Copilot Smart Workflow Builder
  const handleGenerateWorkflow = useCallback(
    async (promptText: string) => {
      if (isGeneratingWorkflow) return;
      setIsGeneratingWorkflow(true);

      // Interactive Loading UX with rotating spinner
      const loadingToastId = showToast(
        'جاري تحليل طلبك عبر الذكاء الاصطناعي وتصميم المخطط...',
        'يرجى الانتظار ريثما يتم تجهيز العقد وتنسيق التدفق الهندسي 🧠',
        'loading',
        0
      );

      try {
        const storedKeys = getStoredApiKeys();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (storedKeys.openaiKey) headers['x-openai-key'] = storedKeys.openaiKey;
        if (storedKeys.geminiKey) headers['x-gemini-key'] = storedKeys.geminiKey;

        let workflowResult: { nodes: Node[]; edges: Edge[]; message: string } | null = null;

        // Try calling the AI Copilot API
        try {
          const res = await fetch('/api/ai-copilot', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              prompt: promptText,
              model: studioSettings.defaultModel || 'gemini-1.5-flash',
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.nodes) && data.nodes.length > 0) {
              const generatedNodes: Node[] = data.nodes.map((n: any, idx: number) => ({
                id: String(n.id || `node_${Date.now()}_${idx}`),
                type: n.type || 'textAI',
                position: n.position || { x: 50 + idx * 420, y: 240 },
                data: {
                  ...n.data,
                  label: n.data?.label || n.title || 'عقدة مولدة',
                  status: 'idle',
                  output: '',
                },
              }));

              const generatedEdges: Edge[] = (data.edges || []).map((e: any, idx: number) => ({
                id: e.id || `e_${e.source}_${e.target}_${idx}`,
                source: String(e.source),
                target: String(e.target),
                type: 'deletable',
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
              }));

              const layouted = getLayoutedElements(generatedNodes, generatedEdges, 'LR');
              workflowResult = {
                nodes: layouted.nodes,
                edges: layouted.edges,
                message: data.summary || 'تم بناء مسار العمل بنجاح عبر الذكاء الاصطناعي ✨',
              };
            }
          }
        } catch (apiErr) {
          console.warn('AI copilot API call failed, falling back to smart local matcher:', apiErr);
        }

        // If API returned fallback or failed, run the Smart Semantic Fallback Matcher
        if (!workflowResult) {
          const fallback = buildWorkflowFromPrompt(
            promptText,
            nodes,
            edges,
            studioSettings
          );
          workflowResult = {
            nodes: fallback.nodes,
            edges: fallback.edges,
            message: fallback.message || 'تم بناء مسار العمل بنجاح ✨',
          };
        }

        setNodes(workflowResult.nodes);
        setEdges(workflowResult.edges);
        takeSnapshot(workflowResult.nodes, workflowResult.edges);

        dismissToast(loadingToastId);
        showToast('تم بناء مسار العمل بنجاح ✨', workflowResult.message, 'success');

        setTimeout(() => {
          reactFlowInstance?.fitView({ padding: 0.25, duration: 600 });
        }, 150);
      } catch (err: any) {
        console.error('Error generating workflow:', err);
        dismissToast(loadingToastId);
        showToast('تعذر بناء مسار العمل', err?.message || 'حدث خطأ غير متوقع', 'error');
      } finally {
        setIsGeneratingWorkflow(false);
      }
    },
    [
      isGeneratingWorkflow,
      nodes,
      edges,
      studioSettings,
      setNodes,
      setEdges,
      takeSnapshot,
      reactFlowInstance,
      showToast,
      dismissToast,
    ]
  );

  // Export Canvas as PNG
  const handleExportPng = useCallback(async () => {
    try {
      const viewportEl = document.querySelector(
        '.react-flow__viewport'
      ) as HTMLElement;
      if (!viewportEl) {
        showToast('تعذر العثور على الكانفاس', undefined, 'error');
        return;
      }
      showToast('جاري تجهيز لقطة الكانفاس بدقة عالية...', undefined, 'info');
      const bgColor =
        studioSettings.theme === 'light'
          ? '#F8FAFC'
          : studioSettings.theme === 'blueprint'
          ? '#0A1128'
          : studioSettings.theme === 'oled'
          ? '#000000'
          : '#090A0D';
      const dataUrl = await toPng(viewportEl, {
        backgroundColor: bgColor,
        quality: 0.95,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `pf-studio-canvas-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      showToast('تم تصدير لقطة الكانفاس بنجاح 📸', undefined, 'success');
    } catch (err) {
      console.error('Export PNG error:', err);
      showToast('تعذر تصدير الصورة', undefined, 'error');
    }
  }, [showToast, studioSettings.theme]);

  // Keyboard shortcut listener (including Ctrl + , for Settings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      // Settings Modal (Ctrl + , or Cmd + ,)
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      // Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Run All (Ctrl+Enter)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunWorkflow();
        return;
      }

      // Duplicate Selected Node (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const selected = nodes.find((n) => n.selected);
        if (selected) handleDuplicateNode(selected.id);
        return;
      }

      // Copy Selected Node (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const selected = nodes.find((n) => n.selected);
        if (selected) {
          e.preventDefault();
          handleCopyNode(selected.id);
        }
        return;
      }

      // Paste Node (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (clipboardNode) {
          e.preventDefault();
          handlePasteNode();
        }
        return;
      }

      // Undo (Ctrl+Z) / Redo (Ctrl+Y or Ctrl+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Shortcuts help dialog (?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleRunWorkflow,
    nodes,
    clipboardNode,
    handleDuplicateNode,
    handleCopyNode,
    handlePasteNode,
  ]);

  // Hydrate from localStorage on client-side mount & sync settings
  useEffect(() => {
    const keys = getStoredApiKeys();
    setHasApiKeys(Boolean(keys.openaiKey || keys.geminiKey || keys.anthropicKey));

    const bv = getStoredBrandVoice();
    setIsBrandVoiceActive(Boolean(bv.enabled));

    const currentSettings = getStudioSettings();
    setStudioSettings(currentSettings);

    try {
      const saved = localStorage.getItem(CANVAS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed.nodes) &&
          Array.isArray(parsed.edges) &&
          parsed.nodes.length > 0
        ) {
          const sanitizedEdges = sanitizeAndDeduplicateEdges(parsed.edges);
          setNodes(parsed.nodes);
          setEdges(sanitizedEdges);
          try {
            localStorage.setItem(
              CANVAS_STORAGE_KEY,
              JSON.stringify({ ...parsed, edges: sanitizedEdges })
            );
          } catch {}
          setHistory([
            {
              nodes: JSON.parse(JSON.stringify(parsed.nodes)),
              edges: JSON.parse(JSON.stringify(sanitizedEdges)),
            },
          ]);
          setHistoryIndex(0);
          setIsHydrated(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load canvas state from localStorage:', e);
    }

    const sanitizedInitEdges = sanitizeAndDeduplicateEdges(initialTemplate.edges);
    setHistory([
      {
        nodes: JSON.parse(JSON.stringify(initialTemplate.nodes)),
        edges: JSON.parse(JSON.stringify(sanitizedInitEdges)),
      },
    ]);
    setHistoryIndex(0);
    setIsHydrated(true);
  }, [setNodes, setEdges, initialTemplate]);

  // Listen to global settings changed event
  useEffect(() => {
    setStudioSettings(getStudioSettings());
    refreshApiKeysStatus();

    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<StudioSettings>;
      if (customEvent.detail) {
        setStudioSettings(customEvent.detail);
        refreshApiKeysStatus();
      }
    };

    const handleOpenInspectorEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string }>;
      if (customEvent.detail?.nodeId) {
        setInspectorNodeId(customEvent.detail.nodeId);
      }
    };

    const handleOpenSettingsEvent = () => {
      setIsSettingsOpen(true);
    };

    window.addEventListener('promptflow:settings-changed', handleSettingsChanged);
    window.addEventListener('promptflow:open-inspector', handleOpenInspectorEvent);
    window.addEventListener('promptflow:open-settings', handleOpenSettingsEvent);
    return () => {
      window.removeEventListener('promptflow:settings-changed', handleSettingsChanged);
      window.removeEventListener('promptflow:open-inspector', handleOpenInspectorEvent);
      window.removeEventListener('promptflow:open-settings', handleOpenSettingsEvent);
    };
  }, []);

  // Synchronize data-theme on document root whenever theme setting changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', studioSettings.theme || 'midnight');
    }
  }, [studioSettings.theme]);

  // Manual save trigger: Saves locally in browser localStorage
  const handleManualSave = useCallback(() => {
    setSaveStatus('saving');
    try {
      const payload = {
        nodes,
        edges,
        updatedAt: Date.now(),
        cloudId: currentWorkflowId,
        title: currentWorkflowTitle,
      };
      localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(payload));

      saveLocalWorkflow({
        id: currentWorkflowId || undefined,
        name: currentWorkflowTitle || 'المسار الرئيسي',
        nodes,
        edges,
      });

      setSaveStatus('saved');
      showToast('تم حفظ المخطط محلياً في متصفحك بنجاح 💾', undefined, 'success');
    } catch (err) {
      console.warn('Manual save error:', err);
      setSaveStatus('idle');
    }
  }, [nodes, edges, currentWorkflowId, currentWorkflowTitle, showToast]);

  // Auto-save nodes & edges to localStorage (debounced)
  useEffect(() => {
    if (!isHydrated) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        const payload = {
          nodes,
          edges,
          updatedAt: Date.now(),
          cloudId: currentWorkflowId,
          title: currentWorkflowTitle,
        };
        localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('Auto-save local cache error:', err);
      }
      setSaveStatus('saved');
    }, 700);

    return () => clearTimeout(timer);
  }, [nodes, edges, isHydrated, currentWorkflowId, currentWorkflowTitle]);

  // Listen for single node run events dispatched by NodeContainer
  useEffect(() => {
    const handleSingleRunEvent = async (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string }>;
      const targetId = customEvent.detail?.nodeId;
      if (!targetId || isRunning) return;
      handleRunSingleNode(targetId);
    };

    window.addEventListener('promptflow:run-single-node', handleSingleRunEvent);
    return () => {
      window.removeEventListener(
        'promptflow:run-single-node',
        handleSingleRunEvent
      );
    };
  }, [isRunning, handleRunSingleNode]);

  // Connect on Drop: Record source node & handle on connection start
  const onConnectStart = useCallback(
    (
      _event: any,
      params: { nodeId: string | null; handleId: string | null; handleType: 'source' | 'target' | null }
    ) => {
      if (params.nodeId) {
        connectingNodeRef.current = {
          nodeId: params.nodeId,
          handleId: params.handleId,
          handleType: params.handleType || 'source',
        };
      }
    },
    []
  );

  // Handle new connection between handles
  const onConnect = useCallback(
    (params: Connection) => {
      connectingNodeRef.current = null;
      setEdges((eds) => {
        const edgeId = generateUniqueEdgeId(params.source || 's', params.target || 't');
        const nextEdges = addEdge(
          {
            ...params,
            id: edgeId,
            type: 'deletable',
            animated: studioSettings.animatedEdges,
            style: { stroke: '#818cf8', strokeWidth: 2 },
          },
          eds
        );
        const uniqueEdges = sanitizeAndDeduplicateEdges(nextEdges);
        takeSnapshot(nodes, uniqueEdges);
        return uniqueEdges;
      });
    },
    [setEdges, nodes, takeSnapshot, studioSettings.animatedEdges]
  );

  // Connect on Drop: When mouse is released in an empty space
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!connectingNodeRef.current) return;
      const { nodeId, handleId, handleType } = connectingNodeRef.current;
      connectingNodeRef.current = null;

      const target = event.target as HTMLElement | null;
      if (target?.classList?.contains('react-flow__handle')) {
        return;
      }

      if (!reactFlowInstance) return;

      const clientX = 'clientX' in event ? event.clientX : (event as TouchEvent).changedTouches?.[0]?.clientX;
      const clientY = 'clientY' in event ? event.clientY : (event as TouchEvent).changedTouches?.[0]?.clientY;

      if (clientX === undefined || clientY === undefined) return;

      const flowPosition = reactFlowInstance.screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      setQuickConnectState({
        isOpen: true,
        screenX: clientX,
        screenY: clientY,
        flowPosition,
        sourceNodeId: nodeId,
        sourceHandleId: handleId,
        sourceHandleType: (handleType as 'source' | 'target') || 'source',
      });
    },
    [reactFlowInstance]
  );

  // Quick connect node creation callback
  const handleQuickConnectSelect = useCallback(
    (nodeType: string) => {
      if (!quickConnectState) return;
      const { flowPosition, sourceNodeId, sourceHandleId, sourceHandleType } = quickConnectState;
      setQuickConnectState(null);

      const newNodeId = `node_${Date.now()}`;
      const newNode: Node = {
        id: newNodeId,
        type: nodeType,
        position: flowPosition,
        data: getDefaultNodeData(nodeType, studioSettings),
      };

      const targetHandle =
        nodeType === 'templateMerge'
          ? 'input_1'
          : nodeType === 'batchLoop'
          ? 'input'
          : 'context';

      let newEdge: Edge;
      if (sourceHandleType === 'source') {
        newEdge = {
          id: generateUniqueEdgeId(sourceNodeId, newNodeId),
          source: sourceNodeId,
          sourceHandle: sourceHandleId || 'output',
          target: newNodeId,
          targetHandle,
          type: 'deletable',
          animated: studioSettings.animatedEdges,
          style: { stroke: '#818cf8', strokeWidth: 2 },
        };
      } else {
        newEdge = {
          id: generateUniqueEdgeId(newNodeId, sourceNodeId),
          source: newNodeId,
          sourceHandle: 'output',
          target: sourceNodeId,
          targetHandle: sourceHandleId || targetHandle,
          type: 'deletable',
          animated: studioSettings.animatedEdges,
          style: { stroke: '#818cf8', strokeWidth: 2 },
        };
      }

      setNodes((nds) => {
        const nextNodes = nds.concat(newNode);
        setEdges((eds) => {
          const nextEdges = sanitizeAndDeduplicateEdges(eds.concat(newEdge));
          takeSnapshot(nextNodes, nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });

      const nodeLabel = (newNode.data as any)?.label || nodeType;
      showToast('تم إنشاء العقدة وربطها تلقائياً ⚡', nodeLabel, 'success');
    },
    [quickConnectState, studioSettings, setNodes, setEdges, takeSnapshot, showToast]
  );

  // Drag over handler for canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop handler to place node at drop coordinates
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type, studioSettings),
      };

      setNodes((nds) => {
        const nextNodes = [...nds, newNode];
        takeSnapshot(nextNodes, edges);
        return nextNodes;
      });
      showToast('تمت إضافة العقدة إلى الكانفاس ✨', (newNode.data as any)?.label, 'success');
    },
    [reactFlowInstance, setNodes, edges, takeSnapshot, showToast, studioSettings]
  );

  // Helper for clicking "Add" button in toolbar
  const handleAddNode = useCallback(
    (type: string) => {
      const id = `node_${Date.now()}`;
      const center = reactFlowInstance?.getViewport();
      const position = center
        ? {
            x: -center.x / center.zoom + 280 + Math.random() * 50,
            y: -center.y / center.zoom + 180 + Math.random() * 50,
          }
        : {
            x: 350 + Math.random() * 80,
            y: 200 + Math.random() * 80,
          };

      const newNode: Node = {
        id,
        type,
        position,
        data: getDefaultNodeData(type, studioSettings),
      };

      setNodes((nds) => {
        const nextNodes = [...nds, newNode];
        takeSnapshot(nextNodes, edges);
        return nextNodes;
      });
      showToast('تمت إضافة العقدة بنجاح ✨', (newNode.data as any)?.label, 'success');
    },
    [reactFlowInstance, setNodes, edges, takeSnapshot, showToast, studioSettings]
  );

  // Node selection for Inspector
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setInspectorNodeId(node.id);
  }, []);

  // 3-Tier Context Menu Openers
  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      if (!reactFlowInstance) return;
      const flowPos = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setContextMenuState({
        type: 'pane',
        x: event.clientX,
        y: event.clientY,
        flowPosition: flowPos,
      });
    },
    [reactFlowInstance]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenuState({
        type: 'node',
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
        nodeData: node.data,
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenuState({
        type: 'edge',
        x: event.clientX,
        y: event.clientY,
        edgeId: edge.id,
        edge,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setContextMenuState(null);
    setQuickConnectState(null);
  }, []);

  // Load a template
  const handleSelectTemplate = (template: WorkflowTemplate) => {
    const sanitizedEdges = sanitizeAndDeduplicateEdges(template.edges);
    setNodes(template.nodes);
    setEdges(sanitizedEdges);
    setLogs([]);
    takeSnapshot(template.nodes, sanitizedEdges);
    showToast('تم تحميل القالب بنجاح 📋', template.title, 'success');
    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.2, duration: 600 });
    }, 100);
  };

  // Reset to default template
  const handleResetDefault = () => {
    if (
      window.confirm(
        'هل تريد استعادة مسار العمل الافتراضي؟ سيتم استبدال أي تعديلات غير محفوظة أو مصدرة.'
      )
    ) {
      const defaultTpl = sampleTemplates[0];
      const sanitizedEdges = sanitizeAndDeduplicateEdges(defaultTpl.edges);
      setNodes(defaultTpl.nodes);
      setEdges(sanitizedEdges);
      setLogs([]);
      takeSnapshot(defaultTpl.nodes, sanitizedEdges);
      localStorage.removeItem(CANVAS_STORAGE_KEY);
      setSaveStatus('saved');
      showToast('تمت استعادة المسار الافتراضي', undefined, 'info');
      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2, duration: 600 });
      }, 100);
    }
  };

  // Export current workflow as JSON file
  const handleExport = () => {
    exportWorkflowToFile({
      name: currentWorkflowTitle,
      nodes,
      edges,
    });
    showToast('تم تصدير المخطط بنجاح كملف JSON 📥', undefined, 'success');
  };

  // Import workflow from JSON file
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importWorkflowFromFile(file);
      const sanitizedEdges = sanitizeAndDeduplicateEdges(imported.edges);
      setNodes(imported.nodes);
      setEdges(sanitizedEdges);
      setCurrentWorkflowTitle(imported.name);
      takeSnapshot(imported.nodes, sanitizedEdges);
      showToast(`تم استيراد مسار العمل: ${imported.name} 📂`, undefined, 'success');
      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2 });
      }, 100);
    } catch (err: any) {
      showToast(err.message || 'ملف الـ JSON غير صالح', undefined, 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleClear = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح كافة العقد الحالية؟')) {
      setNodes([]);
      setEdges([]);
      setLogs([]);
      takeSnapshot([], []);
      localStorage.removeItem(CANVAS_STORAGE_KEY);
      showToast('تم تفريغ الكانفاس بالكامل', undefined, 'info');
    }
  };

  // Find currently selected node for the inspector drawer
  const inspectorNode = nodes.find((n) => n.id === inspectorNodeId) || null;

  // Background Theme colors
  const getCanvasBgClass = () => {
    switch (studioSettings.theme) {
      case 'light':
        return 'bg-[#F1F5F9] text-[#0F172A]';
      case 'blueprint':
        return 'bg-[#0A192F] text-sky-100';
      case 'oled':
        return 'bg-[#000000] text-zinc-100';
      default:
        return 'bg-[#0B0D13] text-zinc-100';
    }
  };

  const getBackgroundDotColor = () => {
    switch (studioSettings.theme) {
      case 'light':
        return '#94A3B8';
      case 'blueprint':
        return '#1E3A8A';
      case 'oled':
        return '#3F3F46';
      default:
        return '#334155';
    }
  };

  const isAnyRunning = isRunning || nodes.some((n) => (n.data as any)?.status === 'running');

  return (
    <div
      className={`flex flex-col h-screen w-screen ${getCanvasBgClass()} overflow-hidden font-sans`}
      data-theme={studioSettings.theme}
    >
      {/* Top Header */}
      <Header
        onRun={handleRunWorkflow}
        isRunning={isAnyRunning}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenApiKeys={() => {
          setAddKeyInitialProvider(undefined);
          setIsAddKeyModalOpen(true);
        }}
        hasApiKeys={hasApiKeys}
        onAutoLayout={handleAutoLayout}
        onResetDefault={handleResetDefault}
        onClear={handleClear}
        onExport={handleExport}
        onImport={handleImport}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        saveStatus={saveStatus}
        isCloudSync={false}
        onManualSave={handleManualSave}
        metrics={metrics}
        onUndo={handleUndo}
        canUndo={historyIndex > 0}
        onRedo={handleRedo}
        canRedo={historyIndex < history.length - 1}
        onOpenBrandVoice={() => setIsBrandVoiceOpen(true)}
        isBrandVoiceActive={isBrandVoiceActive}
        onOpenWorkspaces={() => setIsWorkspacesOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onExportPng={handleExportPng}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => {
          setSettingsTab('appearance');
          setIsSettingsOpen(true);
        }}
        onOpenABTester={() => setIsABTesterOpen(true)}
        onOpenAppMode={() => setIsAppModeOpen(true)}
        onOpenModelsHub={() => setIsModelsHubOpen(true)}
        onStop={handleStopWorkflow}
        validationResult={validationResult}
        onOpenDiagnostics={() => setIsLogsOpen(true)}
        onOpenTestingLab={() => setIsTestingLabOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* React Flow Canvas */}
        <div
          className="flex-1 h-full relative"
          ref={reactFlowWrapper}
          onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
        >
          {/* Radial Ambient Glow */}
          {studioSettings.ambientGlow && (
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              <div
                className={`absolute top-1/4 left-1/3 w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none ${
                  studioSettings.theme === 'blueprint'
                    ? 'bg-blue-600/10'
                    : studioSettings.theme === 'light'
                    ? 'bg-indigo-300/20'
                    : 'bg-indigo-950/20'
                }`}
              />
              <div
                className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${
                  studioSettings.theme === 'blueprint'
                    ? 'bg-cyan-500/10'
                    : studioSettings.theme === 'light'
                    ? 'bg-violet-300/15'
                    : 'bg-violet-950/15'
                }`}
              />
            </div>
          )}

          {/* Subtle Spotlight Cursor */}
          {studioSettings.spotlightCursor && (
            <div
              className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-150"
              style={{
                background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, ${
                  studioSettings.theme === 'blueprint'
                    ? 'rgba(56, 189, 248, 0.08)'
                    : studioSettings.theme === 'light'
                    ? 'rgba(99, 102, 241, 0.08)'
                    : 'rgba(99, 102, 241, 0.06)'
                }, transparent 80%)`,
              }}
            />
          )}

          {/* Dedicated React Flow Canvas Layer */}
          <ReactFlow
            nodes={nodes}
            edges={uniqueEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onInit={(instance) => {
              setReactFlowInstance(instance);
              setZoomLevel(instance.getZoom());
            }}
            onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneContextMenu={onPaneContextMenu}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneClick={onPaneClick}
            onNodeDragStop={() => takeSnapshot(nodes, edges)}
            nodesDraggable={!studioSettings.isLocked}
            nodesConnectable={!studioSettings.isLocked}
            elementsSelectable={!studioSettings.isLocked}
            snapToGrid={studioSettings.snapToGrid ?? false}
            snapGrid={[studioSettings.backgroundGap || 24, studioSettings.backgroundGap || 24]}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{
              type: 'deletable',
              animated: studioSettings.animatedEdges,
            }}
            fitView
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            className={getCanvasBgClass()}
          >
            {/* Configurable Canvas Background */}
            {studioSettings.backgroundVariant !== 'none' && (
              <Background
                variant={
                  studioSettings.theme === 'blueprint' ||
                  studioSettings.backgroundVariant === 'blueprint'
                    ? BackgroundVariant.Lines
                    : studioSettings.backgroundVariant === 'cross'
                    ? BackgroundVariant.Cross
                    : BackgroundVariant.Dots
                }
                gap={studioSettings.backgroundGap || 24}
                size={
                  studioSettings.theme === 'blueprint' ||
                  studioSettings.backgroundVariant === 'blueprint'
                    ? 1.2
                    : 1.5
                }
                color={getBackgroundDotColor()}
                style={{ opacity: Math.max(0.65, studioSettings.backgroundOpacity ?? 0.65) }}
              />
            )}

            <Controls position="bottom-right" style={{ marginBottom: 65, marginRight: 220 }} showInteractive={false} />

            {/* Configurable MiniMap (Positioned safely away from the Node Toolbar) */}
            {studioSettings.showMiniMap && (
              <MiniMap
                position="bottom-right"
                className="!bg-[#0B0F19]/90 !border !border-white/10 !rounded-xl !backdrop-blur-md shadow-2xl overflow-hidden"
                style={{ marginBottom: 65, marginRight: 16 }}
                nodeStrokeWidth={0}
                nodeBorderRadius={4}
                nodeColor={(n) => {
                  switch (n.type) {
                    case 'textInput':
                    case 'urlScraper':
                      return '#38bdf8';
                    case 'webSearch':
                      return '#06b6d4';
                    case 'fileUpload':
                      return '#10b981';
                    case 'textAI':
                      return '#818cf8';
                    case 'toneRewriter':
                      return '#a78bfa';
                    case 'jsonExtractor':
                      return '#22d3ee';
                    case 'splitter':
                      return '#f59e0b';
                    case 'conditional':
                      return '#f59e0b';
                    case 'note':
                      return '#eab308';
                    case 'imageAI':
                      return '#f472b6';
                    case 'templateMerge':
                      return '#fbbf24';
                    case 'finalResult':
                    case 'webhookOutput':
                      return '#34d399';
                    default:
                      return '#52525b';
                  }
                }}
                maskColor="rgba(11, 15, 25, 0.75)"
                maskStrokeColor="rgba(99, 102, 241, 0.6)"
              />
            )}
          </ReactFlow>

          {/* 3-Tier Right-Click Context Menu */}
          {contextMenuState && (
            <ContextMenu
              state={contextMenuState}
              onClose={() => setContextMenuState(null)}
              onAddNode={(type, pos) => {
                const newNode: Node = {
                  id: `node_${Date.now()}`,
                  type,
                  position: pos,
                  data: getDefaultNodeData(type, studioSettings),
                };
                setNodes((nds) => {
                  const next = nds.concat(newNode);
                  takeSnapshot(next, edges);
                  return next;
                });
                showToast('تمت إضافة العقدة بنجاح ✨', undefined, 'success');
              }}
              onAutoLayout={() => handleAutoLayout('TB')}
              onFitView={handleFitView}
              onRunAll={handleRunWorkflow}
              onClearAllOutputs={handleClearAllOutputs}
              onPasteNode={handlePasteNode}
              hasClipboardNode={Boolean(clipboardNode)}
              onRunSingleNode={handleRunSingleNode}
              onRunFromNode={handleRunFromNode}
              onCopyNode={handleCopyNode}
              onDuplicateNode={handleDuplicateNode}
              onResetNodeOutput={handleResetNodeOutput}
              onToggleCollapseNode={handleToggleCollapseNode}
              onDisconnectNodeEdges={handleDisconnectNodeEdges}
              onDeleteNode={handleDeleteNode}
              onInsertNodeOnEdge={handleInsertNodeOnEdge}
              onDeleteEdge={handleDeleteEdge}
            />
          )}

          {/* Quick Add Node on Wire Drop Menu */}
          {quickConnectState?.isOpen && (
            <QuickAddNodeMenu
              isOpen={quickConnectState.isOpen}
              position={{ x: quickConnectState.screenX, y: quickConnectState.screenY }}
              onClose={() => setQuickConnectState(null)}
              onSelectNodeType={handleQuickConnectSelect}
            />
          )}

          {/* Unified Floating Command Dock (Ask AI + Canvas Tools) */}
          <div
            className={`fixed ${
              isLogsOpen ? 'bottom-[305px]' : 'bottom-12 md:bottom-14'
            } left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-300`}
          >
            <FloatingBottomDock
              zoom={zoomLevel}
              onZoomIn={() => reactFlowInstance?.zoomIn({ duration: 250 })}
              onZoomOut={() => reactFlowInstance?.zoomOut({ duration: 250 })}
              onFitView={handleFitView}
              isLocked={studioSettings.isLocked ?? false}
              onToggleLock={() => {
                const updated = saveStudioSettings({ isLocked: !studioSettings.isLocked });
                setStudioSettings(updated);
                showToast(
                  updated.isLocked ? 'تم قفل الكانفاس 🔒' : 'تم تحرير الكانفاس 🔓',
                  undefined,
                  'info'
                );
              }}
              snapToGrid={studioSettings.snapToGrid ?? false}
              onToggleSnapToGrid={() => {
                const updated = saveStudioSettings({ snapToGrid: !studioSettings.snapToGrid });
                setStudioSettings(updated);
                showToast(
                  updated.snapToGrid
                    ? 'تم تفعيل مغناطيس المحاذاة (Snap to Grid) 🧲'
                    : 'تم إلغاء مغناطيس المحاذاة',
                  undefined,
                  'info'
                );
              }}
              showMiniMap={studioSettings.showMiniMap ?? true}
              onToggleMiniMap={() => {
                const updated = saveStudioSettings({ showMiniMap: !studioSettings.showMiniMap });
                setStudioSettings(updated);
                showToast(
                  updated.showMiniMap
                    ? 'تم إظهار الخريطة المصغرة 🗺️'
                    : 'تم إخفاء الخريطة المصغرة',
                  undefined,
                  'info'
                );
              }}
              onAutoLayout={handleAutoLayout}
              onGenerateWorkflow={handleGenerateWorkflow}
              isGeneratingWorkflow={isGeneratingWorkflow}
            />
          </div>
        </div>

        {/* Left/Right Sidebar Toolbar */}
        <NodeToolbar onAddNode={handleAddNode} />
      </div>

      {/* Right/Left-Side Node Inspector Drawer */}
      {inspectorNode && (
        <NodeInspector
          selectedNode={inspectorNode}
          allNodes={nodes}
          edges={edges}
          onClose={() => setInspectorNodeId(null)}
          onUpdateNode={handleUpdateNode}
          onRunSingleNode={handleRunSingleNode}
          isRunning={isRunning}
        />
      )}

      {/* Comprehensive Studio Settings Modal (Ctrl + ,) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
        onSettingsSaved={(updated) => {
          setStudioSettings(updated);
          refreshApiKeysStatus();
          showToast('تم تطبيق الإعدادات الجديدة بنجاح ✨', undefined, 'success');
        }}
      />

      {/* Streamlined Minimalist AI API Keys Modal */}
      <AddKeyModal
        isOpen={isAddKeyModalOpen}
        onClose={() => setIsAddKeyModalOpen(false)}
        initialProvider={addKeyInitialProvider}
      />

      {/* A/B Model Tester Modal */}
      <ABTesterModal
        isOpen={isABTesterOpen}
        onClose={() => setIsABTesterOpen(false)}
      />

      {/* AI Models Hub Modal */}
      <ModelsHubModal
        isOpen={isModelsHubOpen}
        onClose={() => setIsModelsHubOpen(false)}
        onSelectModelAsDefault={(modelId) => {
          const updated = getStudioSettings();
          setStudioSettings(updated);
          showToast(`تم تعيين ${modelId} كنموذج افتراضي للاستوديو ✨`, undefined, 'success');
        }}
      />

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onApplyTemplate={handleSelectTemplate}
        onSelectTemplate={handleSelectTemplate}
      />



      {/* Brand Voice Configuration Modal */}
      <BrandVoiceModal
        isOpen={isBrandVoiceOpen}
        onClose={() => setIsBrandVoiceOpen(false)}
        onSaved={() => {
          const bv = getStoredBrandVoice();
          setIsBrandVoiceActive(Boolean(bv.enabled));
          showToast('تم حفظ إعدادات هوية البرند بنجاح 🎯', undefined, 'success');
        }}
      />

      {/* Saved Workspaces Modal */}
      <WorkspacesModal
        isOpen={isWorkspacesOpen}
        onClose={() => setIsWorkspacesOpen(false)}
        currentNodes={nodes}
        currentEdges={edges}
        onLoadWorkspace={(loadedNodes, loadedEdges, name, cloudId) => {
          const sanitizedEdges = sanitizeAndDeduplicateEdges(loadedEdges);
          setNodes(loadedNodes);
          setEdges(sanitizedEdges);
          setLogs([]);
          takeSnapshot(loadedNodes, sanitizedEdges);
          if (cloudId) {
            setCurrentWorkflowId(cloudId);
            setCurrentWorkflowTitle(name);
          }
          showToast(`تم فتح مسار العمل: ${name} 🗂️`, undefined, 'success');
          setTimeout(() => {
            reactFlowInstance?.fitView({ padding: 0.25, duration: 600 });
          }, 100);
        }}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onAddNode={handleAddNode}
        onRunAll={handleRunWorkflow}
        onAutoLayout={() => handleAutoLayout('TB')}
        onExportPng={handleExportPng}
        onExportJson={handleExport}
        onFitView={handleFitView}
        onClearOutputs={handleClearAllOutputs}
        onOpenBrandVoice={() => setIsBrandVoiceOpen(true)}
        onOpenWorkspaces={() => setIsWorkspacesOpen(true)}
        onOpenApiKeys={() => {
          setSettingsTab('keys');
          setIsSettingsOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />

      {/* Shortcuts Modal (?) */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* App Mode Fullscreen Web Form View */}
      {isAppModeOpen && (
        <AppModeView
          nodes={nodes}
          edges={edges}
          onUpdateNode={handleUpdateNode}
          onRunWorkflow={handleRunWorkflow}
          isRunning={isRunning}
          onExitAppMode={() => setIsAppModeOpen(false)}
        />
      )}

      {/* Bottom Collapsible Execution & Monitoring Panel */}
      <BottomExecutionPanel
        isOpen={isLogsOpen}
        onToggle={() => setIsLogsOpen((prev) => !prev)}
        logs={logs}
        onClearLogs={() => setLogs([])}
        nodes={nodes}
        edges={edges}
        metrics={metrics}
        validationResult={validationResult}
        isRunning={isRunning}
        onSelectNode={(nodeId) => setInspectorNodeId(nodeId)}
        onUpdateNode={handleUpdateNode}
      />

      {/* Workflow Testing Lab Modal */}
      <TestingLabModal
        isOpen={isTestingLabOpen}
        onClose={() => setIsTestingLabOpen(false)}
        nodes={nodes}
        edges={edges}
        onNodeUpdate={handleUpdateNode}
      />


    </div>
  );
};

export const WorkflowCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <ToastProvider>
        <WorkflowCanvasInner />
      </ToastProvider>
    </ReactFlowProvider>
  );
};

function getDefaultNodeData(type: string, settings?: StudioSettings): any {
  const defaultModel = settings?.defaultModel || 'gemini-1.5-flash';
  const defaultTemp = settings?.defaultTemperature ?? 0.7;

  switch (type) {
    case 'textInput':
      return {
        label: 'مدخل نصي',
        category: 'input',
        status: 'idle',
        text: '',
        output: '',
      };
    case 'webSearch':
      return {
        label: 'بحث ويب مباشر',
        category: 'input',
        status: 'idle',
        searchQuery: '',
        searchEngine: 'all',
        maxResults: 3,
        searchResults: [],
        output: '',
      };
    case 'fileUpload':
      return {
        label: 'رفع ملفات ومستندات',
        category: 'input',
        status: 'idle',
        fileName: '',
        fileSize: '',
        fileType: '',
        fileContent: '',
        output: '',
      };
    case 'urlScraper':
      return {
        label: 'سحب رابط / يوتيوب',
        category: 'input',
        status: 'idle',
        url: '',
        output: '',
      };
    case 'textAI':
      return {
        label: 'توليد نص (AI)',
        category: 'ai',
        status: 'idle',
        model: defaultModel,
        systemPrompt: 'لخص الفكرة واذكر أهم 3 نقاط بوضوح.',
        output: '',
        outputHistory: [],
        historyIndex: 0,
        temperature: defaultTemp,
      };
    case 'toneRewriter':
      return {
        label: 'محول اللهجة والأسلوب',
        category: 'ai',
        status: 'idle',
        targetTone: 'saudi',
        lengthPreference: 'balanced',
        output: '',
      };
    case 'jsonExtractor':
      return {
        label: 'استخراج بيانات (JSON)',
        category: 'utility',
        status: 'idle',
        fields: 'العنوان, الملخص_التنفيذي, التصنيف, الكلمات_المفتاحية',
        format: 'json',
        output: '',
      };
    case 'splitter':
      return {
        label: 'تقسيم ومعالجة دفعية',
        category: 'utility',
        status: 'idle',
        delimiter: 'newline',
        customDelimiter: '',
        splitItems: [],
        selectedItemIndex: -1,
        output: '',
      };
    case 'conditional':
      return {
        label: 'عقدة شرطية (If / Else)',
        category: 'utility',
        status: 'idle',
        conditionType: 'contains',
        conditionValue: 'ذكاء اصطناعي',
        output: '',
      };
    case 'note':
      return {
        label: 'ملاحظة',
        category: 'utility',
        status: 'idle',
        title: 'ملاحظة توثيقية',
        content: 'اكتب ملاحظاتك وشرحك لمسار العمل هنا...',
        color: 'yellow',
      };
    case 'imageAI':
      return {
        label: 'توليد الصور بالذكاء الاصطناعي',
        category: 'ai',
        status: 'idle',
        model: 'google-imagen-3',
        imagePrompt: '',
        imageUrl: '',
        output: '',
      };
    case 'templateMerge':
      return {
        label: 'دمج وتنسيق',
        category: 'utility',
        status: 'idle',
        template:
          'المقال المكتمل:\n{{input_1}}\n\nالتغريدات المقترحة:\n{{input_2}}',
        output: '',
      };
    case 'finalResult':
      return {
        label: 'النتيجة النهائية',
        category: 'output',
        status: 'idle',
        output: '',
      };
    case 'webhookOutput':
      return {
        label: 'إرسال Webhook خارجي',
        category: 'output',
        status: 'idle',
        webhookUrl: settings?.globalWebhookUrl || '',
        webhookMethod: 'POST',
        output: '',
      };
    case 'audioVoice':
      return {
        label: 'تعليق صوتي وبودكاست (TTS)',
        category: 'output',
        status: 'idle',
        voiceRate: 1.0,
        voicePitch: 1.0,
        text: '',
        output: '',
      };
    case 'batchLoop':
      return {
        label: 'تكرار ومعالجة دفعية (Batch Loop)',
        category: 'utility',
        status: 'idle',
        batchDelimiter: 'newline',
        batchItems: [],
        currentBatchIndex: 0,
        output: '',
      };
    case 'httpRequest':
      return {
        label: 'طلب HTTP (API)',
        category: 'utility',
        status: 'idle',
        httpMethod: 'GET',
        httpUrl: 'https://api.example.com/data',
        httpHeaders: '{\n  "Accept": "application/json"\n}',
        httpBody: '',
        output: '',
      };
    case 'structuredOutput':
      return {
        label: 'مخرجات مهيكلة (JSON Schema)',
        category: 'ai',
        status: 'idle',
        model: defaultModel,
        jsonSchema: JSON.stringify(
          {
            title: 'String',
            summary: 'String',
            tags: ['String'],
            sentiment: 'positive | neutral | negative',
          },
          null,
          2
        ),
        output: '',
      };
    case 'delay':
      return {
        label: 'مؤقت تأخير (Delay)',
        category: 'utility',
        status: 'idle',
        delaySeconds: 2,
        output: '',
      };
    case 'testAssertion':
      return {
        label: 'فحص واختبار (Assertion)',
        category: 'utility',
        status: 'idle',
        assertionType: 'notEmpty',
        expectedValue: '',
        failWorkflowOnMismatch: false,
        output: '',
      };
    default:
      return {
        label: 'عقدة جديدة',
        category: 'utility',
        status: 'idle',
      };
  }
}
