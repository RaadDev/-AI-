'use client';

import React, { memo, useRef, useState } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import {
  Upload,
  FileText,
  Check,
  Copy,
  Trash2,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const FileUploadNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { sourcePosition } = useHandlePositions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const sizeFormatted =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      updateNodeData(id, {
        fileName: file.name,
        fileSize: sizeFormatted,
        fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        output: text,
        status: 'completed',
      });
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleClear = () => {
    updateNodeData(id, {
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      output: '',
      status: 'idle',
    });
  };

  const handleCopy = () => {
    if (nodeData.output) {
      navigator.clipboard.writeText(nodeData.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const getFileIcon = () => {
    const type = nodeData.fileType || '';
    if (type === 'JSON' || type === 'CSV')
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (type === 'MD') return <FileCode className="w-5 h-5 text-sky-400" />;
    return <FileText className="w-5 h-5 text-emerald-400" />;
  };

  const wordsCount = (nodeData.output || '').split(/\s+/).filter(Boolean).length;

  return (
    <div className="relative group">
      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'رفع ملف ومستند (File)'}
        category="Input"
        icon={<Upload className="w-4 h-4 text-emerald-400" />}
        status={nodeData.status}
        accentColor="emerald"
        width="w-[360px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-2.5">
          {/* Dropzone */}
          {!nodeData.fileName ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                  : 'border-slate-800 bg-slate-950/60 hover:border-emerald-500/50 hover:bg-slate-950 text-slate-400'
              }`}
            >
              <Upload className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
              <div className="text-xs font-semibold text-slate-200">
                انقر لرفع ملف أو اسحبه إلى هنا
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                يدعم .txt, .md, .csv, .json
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {/* File Info Card */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-emerald-900/40 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 shrink-0">
                    {getFileIcon()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">
                      {nodeData.fileName}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-mono">
                      {nodeData.fileSize} • {wordsCount} كلمة
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded text-slate-400 hover:text-white transition"
                    title="نسخ المحتوى"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                    title="إزالة الملف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Preview */}
              <div
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 max-h-24 overflow-y-auto text-[11px] text-slate-300 font-mono whitespace-pre-wrap select-text leading-relaxed"
                dir="auto"
              >
                {nodeData.output?.slice(0, 500)}
                {(nodeData.output?.length || 0) > 500 && '...'}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--card-border)]/60">
          <span>{nodeData.fileName ? 'الملف جاهز' : 'في انتظار الرفع'}</span>
          <span className="text-[var(--text-subtle)] font-medium">جاهز للتمرير</span>
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-emerald-400 !border-slate-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

FileUploadNode.displayName = 'FileUploadNode';
