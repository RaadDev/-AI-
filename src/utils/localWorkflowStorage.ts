import type { Node, Edge } from '@xyflow/react';
import { SavedWorkspace } from '@/types/workflow';

export const LOCAL_WORKFLOWS_STORAGE_KEY = 'promptflow_saved_workspaces';
export const ACTIVE_CANVAS_STORAGE_KEY = 'ai_prompt_studio_workflow_v1';

export interface LocalWorkflow {
  id: string;
  name: string;
  description?: string;
  updatedAt: number;
  createdAt?: number;
  nodeCount: number;
  edgeCount?: number;
  nodes: Node[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
}

/**
 * Retrieves all locally saved workflows from browser localStorage
 */
export function getLocalWorkflows(): LocalWorkflow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_WORKFLOWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[LocalWorkflowStorage] Failed to read workflows from localStorage:', err);
    return [];
  }
}

/**
 * Saves or updates a local workflow in browser localStorage
 */
export function saveLocalWorkflow(workflow: Partial<LocalWorkflow> & { name: string; nodes: Node[]; edges: Edge[] }): LocalWorkflow {
  if (typeof window === 'undefined') {
    return {
      id: workflow.id || `local_${Date.now()}`,
      name: workflow.name,
      updatedAt: Date.now(),
      nodeCount: workflow.nodes.length,
      nodes: workflow.nodes,
      edges: workflow.edges,
    };
  }

  const existing = getLocalWorkflows();
  const id = workflow.id || `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const workflowRecord: LocalWorkflow = {
    id,
    name: workflow.name.trim() || 'مسار عمل جديد',
    description: workflow.description,
    createdAt: workflow.createdAt || now,
    updatedAt: now,
    nodeCount: workflow.nodes.length,
    edgeCount: workflow.edges.length,
    nodes: workflow.nodes,
    edges: workflow.edges,
    viewport: workflow.viewport,
  };

  const index = existing.findIndex((w) => w.id === id);
  if (index >= 0) {
    existing[index] = { ...existing[index], ...workflowRecord, createdAt: existing[index].createdAt || now };
  } else {
    existing.unshift(workflowRecord);
  }

  try {
    localStorage.setItem(LOCAL_WORKFLOWS_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('[LocalWorkflowStorage] Quota exceeded or error saving to localStorage:', err);
  }

  return workflowRecord;
}

/**
 * Deletes a local workflow by ID
 */
export function deleteLocalWorkflow(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalWorkflows();
    const filtered = existing.filter((w) => w.id !== id);
    localStorage.setItem(LOCAL_WORKFLOWS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[LocalWorkflowStorage] Failed to delete workflow:', err);
  }
}

/**
 * Exports a workflow to a downloadable JSON file on user's device
 */
export function exportWorkflowToFile(workflow: { name?: string; title?: string; nodes: Node[]; edges: Edge[] }): void {
  if (typeof window === 'undefined') return;

  const title = workflow.name || workflow.title || 'pf-studio-workflow';
  const cleanTitle = title.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_').toLowerCase();
  const filename = `${cleanTitle || 'workflow'}_${new Date().toISOString().split('T')[0]}.json`;

  const dataToExport = {
    pfStudioVersion: '2.0.0',
    type: 'pf-studio-workflow',
    name: title,
    exportedAt: new Date().toISOString(),
    nodeCount: workflow.nodes.length,
    edgeCount: workflow.edges.length,
    nodes: workflow.nodes,
    edges: workflow.edges,
  };

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Imports a workflow from a user selected JSON file
 */
export function importWorkflowFromFile(file: File): Promise<{ name: string; nodes: Node[]; edges: Edge[] }> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('لم يتم تحديد أي ملف'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Validate structure
        const nodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
        const edges = Array.isArray(parsed.edges) ? parsed.edges : [];
        const name = parsed.name || parsed.title || file.name.replace(/\.json$/i, '');

        if (nodes.length === 0) {
          throw new Error('الملف لا يحتوي على عقد صالحة');
        }

        resolve({ name, nodes, edges });
      } catch (err: any) {
        reject(new Error(err.message || 'الملف المرفوع ليس ملف JSON صالح لمسار عمل'));
      }
    };

    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsText(file);
  });
}
