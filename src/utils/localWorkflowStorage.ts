/**
 * @file localWorkflowStorage.ts
 * @description Local-First storage manager for saving, loading, exporting,
 * and importing PF Studio visual workflows directly within the user's browser.
 */

import { Workflow } from '@/types/workflow';
import type { Node, Edge } from '@xyflow/react';

const STORAGE_KEY = 'pf_studio_saved_workflows';
const ACTIVE_WORKFLOW_KEY = 'pf_studio_active_canvas';
const LEGACY_STORAGE_KEY = 'promptflow_saved_workspaces';

export type LocalWorkflow = Workflow;
export { STORAGE_KEY, ACTIVE_WORKFLOW_KEY };

/**
 * Retrieves all locally saved workflows from the browser's LocalStorage.
 * @returns Array of saved Workflow objects.
 */
export function getLocalWorkflows(): Workflow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item: any) => ({
          ...item,
          title: item.title || item.name || 'مسار عمل',
          name: item.name || item.title || 'مسار عمل',
          nodeCount: item.nodeCount ?? item.nodes?.length ?? 0,
          edgeCount: item.edgeCount ?? item.edges?.length ?? 0,
        }))
      : [];
  } catch (error) {
    console.error('Failed to load workflows from localStorage:', error);
    return [];
  }
}

/**
 * Saves or updates a workflow in LocalStorage.
 * @param workflow The workflow instance to persist.
 */
export function saveLocalWorkflow(
  workflow: Partial<Workflow> & { nodes: Node[]; edges: Edge[]; title?: string; name?: string; id?: string }
): Workflow {
  if (typeof window === 'undefined') {
    return workflow as Workflow;
  }
  try {
    const existing = getLocalWorkflows();
    const id = workflow.id || `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = workflow.title || workflow.name || 'مسار عمل جديد';
    const index = existing.findIndex((w) => w.id === id);
    const updated: Workflow = {
      ...workflow,
      id,
      title,
      name: title,
      nodes: workflow.nodes,
      edges: workflow.edges,
      nodeCount: workflow.nodes.length,
      edgeCount: workflow.edges.length,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      existing[index] = updated;
    } else {
      existing.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return updated;
  } catch (error) {
    console.error('Failed to save workflow locally:', error);
    return workflow as Workflow;
  }
}

/**
 * Deletes a workflow from LocalStorage by its unique identifier.
 * @param id The ID of the workflow to delete.
 */
export function deleteLocalWorkflow(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalWorkflows();
    const filtered = existing.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete workflow:', error);
  }
}

/**
 * Exports a workflow to a downloadable .json file on the user's computer.
 * @param workflow The workflow object to export.
 */
export function exportWorkflowToJsonFile(workflow: Workflow | { title?: string; name?: string; nodes: any[]; edges: any[] }): void {
  const title = workflow.title || workflow.name || 'pf_studio';
  const cleanTitle = title.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_').toLowerCase();
  const filename = `${cleanTitle || 'workflow'}_${new Date().toISOString().split('T')[0]}.json`;

  const payload = {
    pfStudioVersion: '2.0.0',
    type: 'pf-studio-workflow',
    title,
    name: title,
    exportedAt: new Date().toISOString(),
    nodes: workflow.nodes,
    edges: workflow.edges,
    nodeCount: workflow.nodes.length,
    edgeCount: workflow.edges.length,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(payload, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Imports a workflow from a local .json file selected by the user.
 * @param file The uploaded JSON file.
 * @returns Promise resolving to the parsed Workflow object.
 */
export function importWorkflowFromJsonFile(file: File): Promise<Workflow & { name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.nodes || !parsed.edges) {
          throw new Error('Invalid workflow format: missing nodes or edges.');
        }
        const title = parsed.title || parsed.name || file.name.replace(/\.json$/i, '');
        resolve({
          ...parsed,
          title,
          name: title,
          nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
          edges: Array.isArray(parsed.edges) ? parsed.edges : [],
        });
      } catch (err: any) {
        reject(err?.message ? err : new Error('Invalid JSON file format'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

// Aliases for backwards compatibility with existing UI components
export const exportWorkflowToFile = exportWorkflowToJsonFile;
export const importWorkflowFromFile = (file: File): Promise<{ name: string; nodes: Node[]; edges: Edge[] }> =>
  importWorkflowFromJsonFile(file);
