import { Position } from '@xyflow/react';
import { getStudioSettings } from './studioSettings';
import { useEffect, useState } from 'react';

export function useHandlePositions() {
  const [direction, setDirection] = useState<'LR' | 'TB' | 'RL'>('RL');

  useEffect(() => {
    const current = getStudioSettings();
    if (current.layoutDirection) {
      setDirection(current.layoutDirection);
    }

    const handler = (e: Event) => {
      const custom = e as CustomEvent<any>;
      if (custom.detail?.layoutDirection) {
        setDirection(custom.detail.layoutDirection);
      }
    };

    window.addEventListener('promptflow:settings-changed', handler);
    window.addEventListener('promptflow:layout-changed', handler);
    return () => {
      window.removeEventListener('promptflow:settings-changed', handler);
      window.removeEventListener('promptflow:layout-changed', handler);
    };
  }, []);

  const isHorizontal = direction === 'LR' || direction === 'RL';

  // In Arabic horizontal mode (RL): Exit from Left, Enter from Right
  let targetPosition = Position.Right;
  let sourcePosition = Position.Left;

  if (direction === 'LR') {
    targetPosition = Position.Left;
    sourcePosition = Position.Right;
  } else if (direction === 'TB') {
    targetPosition = Position.Top;
    sourcePosition = Position.Bottom;
  } else {
    // Default 'RL'
    targetPosition = Position.Right;
    sourcePosition = Position.Left;
  }

  return {
    targetPosition,
    sourcePosition,
    isHorizontal,
    direction,
  };
}
