import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  Check,
  CheckCircle2,
  Table,
  Sliders,
  Info,
} from 'lucide-react';
import { Survey, SurveyResponse } from '../../types/survey';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey;
  allResponses: SurveyResponse[];
  filteredResponses: SurveyResponse[];
  hasActiveFilter: boolean;
  onExportSuccess: (filename: string, rowCount: number) => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  survey,
  allResponses,
  filteredResponses,
  hasActiveFilter,
  onExportSuccess,
}) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [scope, setScope] = useState<'all' | 'filtered'>('all');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [cleanFormatting, setCleanFormatting] = useState<boolean>(true);
  const [includeBOM, setIncludeBOM] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Target responses dataset
  const targetResponses = useMemo(() => {
    return scope === 'filtered' && hasActiveFilter ? filteredResponses : allResponses;
  }, [scope, hasActiveFilter, filteredResponses, allResponses]);

  // Escape a CSV field according to RFC 4180
  const escapeCsvCell = (val: any): string => {
    if (val === undefined || val === null) return '""';

    let str = String(val);

    // If cell contains commas, double quotes, or newlines, quote it and escape inner quotes
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      str = `"${str.replace(/"/g, '""')}"`;
    } else {
      str = `"${str}"`;
    }
    return str;
  };

  // Build CSV content
  const generatedCSV = useMemo(() => {
    if (targetResponses.length === 0) return '';

    // Headers
    const headers: string[] = [];
    if (includeMetadata) {
      headers.push('Response ID', 'Submitted At', 'Respondent Email', 'Respondent Name', 'Completion Time (seconds)');
    }

    survey.questions.forEach((q) => {
      headers.push(q.title);
    });

    const headerLine = headers.map(escapeCsvCell).join(',');

    // Rows
    const rows = targetResponses.map((resp) => {
      const rowCells: string[] = [];

      if (includeMetadata) {
        rowCells.push(
          escapeCsvCell(resp.id),
          escapeCsvCell(resp.submittedAt),
          escapeCsvCell(resp.respondentEmail || 'Anonymous'),
          escapeCsvCell(resp.respondentName || 'Anonymous'),
          escapeCsvCell(resp.completionTimeSeconds)
        );
      }

      survey.questions.forEach((q) => {
        const val = resp.answers[q.id];

        if (val === undefined || val === null) {
          rowCells.push(escapeCsvCell(''));
        } else if (Array.isArray(val)) {
          // Multi-select / checkboxes
          rowCells.push(escapeCsvCell(val.join('; ')));
        } else if (typeof val === 'object') {
          // Likert matrix or composite answer
          if (cleanFormatting) {
            const formatted = Object.entries(val)
              .map(([stmt, rating]) => `${stmt}: ${rating}`)
              .join(' | ');
            rowCells.push(escapeCsvCell(formatted));
          } else {
            rowCells.push(escapeCsvCell(JSON.stringify(val)));
          }
        } else {
          rowCells.push(escapeCsvCell(val));
        }
      });

      return rowCells.join(',');
    });

    return [headerLine, ...rows].join('\r\n');
  }, [targetResponses, survey.questions, includeMetadata, cleanFormatting]);

  // Build JSON content
  const generatedJSON = useMemo(() => {
    const exportPayload = {
      survey: {
        id: survey.id,
        title: survey.title,
        category: survey.category,
        totalQuestions: survey.questions.length,
        exportedAt: new Date().toISOString(),
      },
      responses: targetResponses.map((r) => ({
        id: r.id,
        submittedAt: r.submittedAt,
        completionTimeSeconds: r.completionTimeSeconds,
        respondent: {
          name: r.respondentName || null,
          email: r.respondentEmail || null,
        },
        answers: r.answers,
      })),
    };
    return JSON.stringify(exportPayload, null, 2);
  }, [survey, targetResponses]);

  if (!isOpen) return null;

  const sanitizedSurveyName = survey.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 32);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${sanitizedSurveyName}_responses_${dateStr}.${format}`;

  const estimatedSizeBytes = format === 'csv'
    ? new Blob([generatedCSV]).size
    : new Blob([generatedJSON]).size;
  const sizeFormatted = estimatedSizeBytes < 1024
    ? `${estimatedSizeBytes} B`
    : `${(estimatedSizeBytes / 1024).toFixed(1)} KB`;

  // Download Trigger
  const handleDownload = () => {
    let contentBlob: Blob;

    if (format === 'csv') {
      // Add UTF-8 BOM if enabled to ensure Excel opens non-ASCII characters seamlessly
      const bom = includeBOM ? '\uFEFF' : '';
      contentBlob = new Blob([bom + generatedCSV], { type: 'text/csv;charset=utf-8;' });
    } else {
      contentBlob = new Blob([generatedJSON], { type: 'application/json;charset=utf-8;' });
    }

    const url = URL.createObjectURL(contentBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onExportSuccess(filename, targetResponses.length);
    onClose();
  };

  // Preview lines (first 4 lines)
  const previewLines = generatedCSV.split('\r\n').slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#0c183a] text-white rounded-3xl border border-blue-900/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/60 bg-[#0a1538]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Export East Africa Survey Responses
              </h3>
              <p className="text-xs text-blue-300 font-bold">
                Download formatted CSV or JSON datasets for Excel, PowerBI, and Sheets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-blue-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Format Selection Cards */}
          <div>
            <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-2">
              Select Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setFormat('csv')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  format === 'csv'
                    ? 'border-blue-400 bg-blue-950/80 shadow-md ring-2 ring-blue-500/30'
                    : 'border-blue-900/60 bg-[#091330] hover:border-blue-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    format === 'csv'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-900/40 text-blue-300'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>CSV (Recommended)</span>
                    {format === 'csv' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    Standard RFC 4180 format for Excel, Google Sheets, & SPSS.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setFormat('json')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  format === 'json'
                    ? 'border-blue-400 bg-blue-950/80 shadow-md ring-2 ring-blue-500/30'
                    : 'border-blue-900/60 bg-[#091330] hover:border-blue-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    format === 'json'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-900/40 text-blue-300'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>JSON Raw Data</span>
                    {format === 'json' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    Structured nested objects for developers and APIs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dataset Scope */}
          <div>
            <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-2">
              Export Scope
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-900/60 bg-[#091330] hover:bg-blue-950/60 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="text-blue-500 focus:ring-blue-400"
                  />
                  <div>
                    <span className="text-xs font-black text-white">
                      All Recorded Responses
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium block">
                      Full historical dataset across all East African countries
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono tabular-nums font-black text-blue-300">
                  {allResponses.length} rows
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                  hasActiveFilter
                    ? 'border-blue-900/60 bg-[#091330] hover:bg-blue-950/60 cursor-pointer'
                    : 'border-blue-950 bg-[#081028] opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="scope"
                    disabled={!hasActiveFilter}
                    checked={scope === 'filtered'}
                    onChange={() => setScope('filtered')}
                    className="text-blue-500 focus:ring-blue-400"
                  />
                  <div>
                    <span className="text-xs font-black text-white">
                      Currently Filtered Results
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium block">
                      Only responses matching current search query
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono tabular-nums font-black text-blue-300">
                  {filteredResponses.length} rows
                </span>
              </label>
            </div>
          </div>

          {/* Options Checklist */}
          {format === 'csv' && (
            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-black text-blue-300 uppercase tracking-wider">
                Formatting & Metadata Options
              </label>

              <label className="flex items-center gap-2.5 text-xs text-white font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Include response metadata (ID, Submitted At, Name, Email, Completion Time)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-white font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanFormatting}
                  onChange={(e) => setCleanFormatting(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Format Likert matrix & multi-select choices into clean strings</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-white font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBOM}
                  onChange={(e) => setIncludeBOM(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Include Excel UTF-8 BOM (guarantees Swahili & East African accents render properly)</span>
              </label>
            </div>
          )}

          {/* Data Preview Toggle */}
          {format === 'csv' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-black text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
              >
                <Table className="w-3.5 h-3.5" />
                <span>{showPreview ? 'Hide Raw CSV Preview' : 'Preview CSV Header & First Rows'}</span>
              </button>

              {showPreview && (
                <div className="mt-2 p-3.5 bg-[#091330] text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 leading-relaxed border border-blue-900/60">
                  {previewLines.map((line, idx) => (
                    <div key={idx} className={idx === 0 ? 'text-blue-300 font-black' : 'text-slate-300'}>
                      {line}
                    </div>
                  ))}
                  {generatedCSV.split('\r\n').length > 4 && (
                    <div className="text-blue-400 font-bold italic mt-1">
                      ... and {targetResponses.length - 3} more response records
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/60 bg-[#0a1538] flex items-center justify-between">
          <div className="text-xs text-blue-300 flex items-center gap-2 font-bold">
            <span>File: <strong className="font-mono text-white font-black">{filename}</strong></span>
            <span>·</span>
            <span>{sizeFormatted}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={targetResponses.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl shadow-md border border-blue-400/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
