import { NextRequest, NextResponse } from "next/server";
import { WORKFLOW_TEMPLATES } from "@/data/sampleWorkflows";

/**
 * Local-First Single Workflow Handler
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const template = WORKFLOW_TEMPLATES.find((t) => t.id === id);

  if (template) {
    return NextResponse.json({
      success: true,
      workflow: template,
    });
  }

  return NextResponse.json({
    success: true,
    localMode: true,
    message: 'Local-First Mode: User workflows are retrieved directly from localStorage.',
  });
}

export async function DELETE() {
  return NextResponse.json({
    success: true,
    localMode: true,
    message: 'Workflow deleted locally from browser storage.',
  });
}
