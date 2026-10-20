import { NextResponse } from 'next/server';
import { WORKFLOW_TEMPLATES } from '@/data/sampleWorkflows';

/**
 * Workflows API - Local-First & Static Templates Engine
 * Operates with 100% privacy: no cloud database connections, zero external dependencies.
 * Workflows are saved directly in user's browser localStorage.
 */

// GET /api/workflows: Returns ready-made static templates or local mode status
export async function GET() {
  return NextResponse.json({
    success: true,
    localMode: true,
    message: 'Running in 100% Local-First Storage Mode (Privacy Protected)',
    templates: WORKFLOW_TEMPLATES,
    workflows: [],
  });
}

// POST /api/workflows: Acknowledges local storage mode gracefully
export async function POST() {
  return NextResponse.json({
    success: true,
    localMode: true,
    message: 'Local-First Architecture: Workflows are persisted in browser localStorage and JSON export.',
  });
}
