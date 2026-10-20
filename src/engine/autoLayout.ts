import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';

function getNodeDimensions(node: Node): { width: number; height: number } {
  const isCollapsed = Boolean(node.data?.isCollapsed);
  if (isCollapsed) {
    return { width: 360, height: 85 };
  }

  switch (node.type) {
    case 'textAI':
    case 'imageAI':
      return { width: 380, height: 460 };
    case 'audioVoice':
    case 'batchLoop':
      return { width: 380, height: 420 };
    case 'jsonExtractor':
    case 'toneRewriter':
      return { width: 360, height: 390 };
    case 'templateMerge':
    case 'finalResult':
    case 'webhookOutput':
      return { width: 360, height: 360 };
    case 'textInput':
    case 'urlScraper':
    case 'webSearch':
    case 'fileUpload':
      return { width: 360, height: 340 };
    default:
      return { width: 360, height: 400 };
  }
}

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' | 'RL' = 'RL'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 140, // Generous spacing between parallel branches
    ranksep: 200, // Generous distance between sequential ranks
    align: direction === 'RL' ? 'UR' : direction === 'LR' ? 'UL' : 'DL',
    marginx: 80,
    marginy: 80,
  });

  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getNodeDimensions(node);

    return {
      ...node,
      position: {
        x: Math.round(nodeWithPosition.x - width / 2),
        y: Math.round(nodeWithPosition.y - height / 2),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

