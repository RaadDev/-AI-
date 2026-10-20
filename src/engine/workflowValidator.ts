import type { Node, Edge } from '@xyflow/react';
import { WorkflowValidationIssue, WorkflowValidationResult, WorkflowNodeData } from '@/types/workflow';

/**
 * Validates a visual workflow graph before or during execution.
 * Detects cycles, disconnected nodes, missing required inputs, and structural issues.
 */
export function validateWorkflow(nodes: Node[], edges: Edge[]): WorkflowValidationResult {
  const errors: WorkflowValidationIssue[] = [];
  const warnings: WorkflowValidationIssue[] = [];

  if (nodes.length === 0) {
    const w: WorkflowValidationIssue[] = [{ id: 'empty-canvas', type: 'info', message: 'الكانفاس فارغ، أضف عقدة للبدء في بناء المسار' }];
    return {
      isValid: true,
      issues: w,
      errors: [],
      warnings: w,
    };
  }

  const nodeMap = new Map<string, Node>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // 1. Check for orphaned / invalid edges
  edges.forEach((edge) => {
    if (!nodeMap.has(edge.source)) {
      errors.push({
        id: `invalid-edge-source-${edge.id}`,
        type: 'error',
        message: `سلك اتصال يشير إلى عقدة مصدر محذوفة أو غير موجودة (${edge.source})`,
      });
    }
    if (!nodeMap.has(edge.target)) {
      errors.push({
        id: `invalid-edge-target-${edge.id}`,
        type: 'error',
        message: `سلك اتصال يشير إلى عقدة هدف محذوفة أو غير موجودة (${edge.target})`,
      });
    }
  });

  // 2. Cycle Detection using Kahn's Algorithm
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adjList[n.id] = [];
  });

  edges.forEach((e) => {
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    }
    if (adjList[e.source]) {
      adjList[e.source].push(e.target);
    }
  });

  const queue: string[] = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  let visitedCount = 0;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedCount++;

    const neighbors = adjList[curr] || [];
    for (const neighbor of neighbors) {
      if (inDegree[neighbor] !== undefined) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }
  }

  if (visitedCount < nodes.length) {
    errors.push({
      id: 'graph-cycle-detected',
      type: 'error',
      message: 'تم اكتشاف حلقة مغلقة (Circular Dependency / Cycle) تجعل المسار غير قابل للتنفيذ المتسلسل',
    });
  }

  // 3. Node-Level Validation
  nodes.forEach((node) => {
    const data = (node.data || {}) as WorkflowNodeData;
    const title = data.label || node.id;
    const incomingEdges = edges.filter((e) => e.target === node.id);
    const outgoingEdges = edges.filter((e) => e.source === node.id);

    // Note nodes are purely visual annotations
    if (node.type === 'note') return;

    // Disconnected / Isolated node warning
    if (incomingEdges.length === 0 && outgoingEdges.length === 0 && nodes.length > 1) {
      warnings.push({
        id: `isolated-node-${node.id}`,
        nodeId: node.id,
        nodeTitle: title,
        type: 'warning',
        message: `العقدة "${title}" غير متصلة بأي أسلاك في المخطط`,
      });
    }

    // Type-specific validation
    switch (node.type) {
      case 'urlScraper': {
        const url = (data.url || '').trim();
        if (!url) {
          warnings.push({
            id: `missing-url-${node.id}`,
            nodeId: node.id,
            nodeTitle: title,
            type: 'warning',
            message: `العقدة "${title}" لا تحتوي على رابط موقع أو يوتيوب`,
            field: 'url',
          });
        }
        break;
      }

      case 'httpRequest': {
        const url = (data.url || '').trim();
        if (!url) {
          errors.push({
            id: `missing-http-url-${node.id}`,
            nodeId: node.id,
            nodeTitle: title,
            type: 'error',
            message: `عقدة طلب HTTP "${title}" تتطلب تزويد رابط (URL) صالح`,
            field: 'url',
          });
        }
        break;
      }

      case 'textAI': {
        const prompt = (data.systemPrompt || '').trim();
        if (!prompt && incomingEdges.length === 0) {
          warnings.push({
            id: `empty-ai-prompt-${node.id}`,
            nodeId: node.id,
            nodeTitle: title,
            type: 'warning',
            message: `عقدة الذكاء الاصطناعي "${title}" ليس لها أمر توجيه (Prompt) ولا تستقبل سياقاً وارداً`,
            field: 'systemPrompt',
          });
        }
        break;
      }

      case 'templateMerge': {
        if (incomingEdges.length === 0) {
          warnings.push({
            id: `template-merge-no-inputs-${node.id}`,
            nodeId: node.id,
            nodeTitle: title,
            type: 'warning',
            message: `عقدة الدمج "${title}" لا تتلقى أي مدخلات عبر الأسلاك الواردة`,
          });
        }
        break;
      }

      case 'finalResult': {
        if (incomingEdges.length === 0) {
          warnings.push({
            id: `final-result-no-incoming-${node.id}`,
            nodeId: node.id,
            nodeTitle: title,
            type: 'warning',
            message: `عقدة النتيجة النهائية "${title}" لا تتلقى أي نتائج من خطوات سابقة`,
          });
        }
        break;
      }

      case 'webhookOutput': {
        const whUrl = (data.webhookUrl || '').trim();
        if (!whUrl) {
          warnings.push({
            id: `webhook-empty-url-${node.id}`,
            nodeId: node.id,
            nodeTitle: title,
            type: 'warning',
            message: `عقدة الـ Webhook "${title}" لم يُحدد لها رابط الإرسال`,
            field: 'webhookUrl',
          });
        }
        break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    issues: [...errors, ...warnings],
    errors,
    warnings,
  };
}
