"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertTriangle, FileCode } from "lucide-react";

interface DocumentUploadZoneProps {
  onTextLoaded: (extractedText: string, filename: string) => void;
  className?: string;
}

export function DocumentUploadZone({ onTextLoaded, className = "" }: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loadedFile, setLoadedFile] = useState<{ name: string; size: string; words: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = (file: File) => {
    setError(null);
    const validExtensions = [".txt", ".md", ".csv", ".json", ".doc", ".docx", ".pdf"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(ext) && !file.type.includes("text")) {
      setError("Please upload a text, markdown, or document file (.txt, .md, .docx, .pdf).");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || !content.trim()) {
        setError("The uploaded file appears to be empty.");
        return;
      }

      // Clean non-printable binary artifacts if any
      const cleaned = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").trim();
      const words = cleaned.split(/\s+/).filter(Boolean).length;

      setLoadedFile({
        name: file.name,
        size: formatFileSize(file.size),
        words
      });

      onTextLoaded(cleaned, file.name);
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try copy-pasting the text instead.");
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.csv,.json,.doc,.docx,.pdf,text/*"
        onChange={handleFileInput}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
            : loadedFile
            ? "border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-500/60"
            : "border-slate-300 dark:border-zinc-800 hover:border-violet-500/50 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
        }`}
      >
        {loadedFile ? (
          <div className="flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {loadedFile.name}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                  {loadedFile.words.toLocaleString()} words • {loadedFile.size} • Loaded into editor
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Drop an essay or document file here, or{" "}
              <span className="text-violet-600 dark:text-violet-400 underline underline-offset-2">browse</span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              Supports .txt, .md, .docx, .pdf, .json (Evaluates locally in memory)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
