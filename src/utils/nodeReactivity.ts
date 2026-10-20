export interface NodeDataUpdateEventDetail {
  sourceNodeId: string;
  output: string;
  extraUpdates?: Record<string, any>;
  timestamp: number;
}

/**
 * Dispatches a global reactive event notifying the canvas and all connected nodes
 * that a source node's data or output has updated in real time.
 */
export function triggerNodeDataUpdate(
  sourceNodeId: string,
  output: string,
  extraUpdates?: Record<string, any>
) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<NodeDataUpdateEventDetail>('promptflow:node-output-updated', {
        detail: {
          sourceNodeId,
          output,
          extraUpdates,
          timestamp: Date.now(),
        },
      })
    );
  }
}
