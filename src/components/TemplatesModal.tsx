import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { PREBUILT_TEMPLATES } from '../data/sampleSurveys';
import { Survey } from '../types/survey';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateSurvey: Partial<Survey>) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePreviewId, setActivePreviewId] = useState<string>(PREBUILT_TEMPLATES[0].id);

  if (!isOpen) return null;

  const categories = ['All', 'Customer Experience', 'Product & Engineering', 'Human Resources', 'Event & Community'];

  const filteredTemplates =
    selectedCategory === 'All'
      ? PREBUILT_TEMPLATES
      : PREBUILT_TEMPLATES.filter((t) => t.category === selectedCategory);

  const activeTemplate = PREBUILT_TEMPLATES.find((t) => t.id === activePreviewId) || PREBUILT_TEMPLATES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-[#0c183a] text-white rounded-3xl border border-blue-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/60 bg-[#0a1538]">
          <div>
            <h3 className="text-base font-black text-white">
              East Africa Survey Templates Library
            </h3>
            <p className="text-xs text-blue-300 font-bold mt-0.5">
              Regionally calibrated questionnaires for Mobile Money, SACCOs, Agribusiness, and Trade.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-blue-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-blue-900/60 bg-[#091330] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-blue-950 border border-transparent hover:border-blue-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Body Split View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Template Cards List */}
          <div className="md:col-span-5 border-r border-blue-900/60 overflow-y-auto p-4 space-y-3 bg-[#0a1538]">
            {filteredTemplates.map((template) => {
              const isSelected = template.id === activePreviewId;
              return (
                <div
                  key={template.id}
                  onClick={() => setActivePreviewId(template.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-950/90 shadow-md ring-2 ring-blue-500/30'
                      : 'border-blue-900/60 bg-[#0c183a] hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-blue-300 font-bold mb-1.5">
                    <span>{template.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{template.estimatedMinutes} min</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">
                    {template.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-blue-300 font-bold">
                    <span>{template.questionsCount} questions</span>
                    {isSelected && (
                      <span className="text-blue-400 font-black flex items-center gap-1">
                        Selected <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Preview of Selected Template */}
          <div className="md:col-span-7 overflow-y-auto p-6 flex flex-col justify-between space-y-6 bg-[#0c183a]">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-blue-400 font-black uppercase tracking-wider">
                  {activeTemplate.category}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {activeTemplate.sampleSurvey.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  {activeTemplate.sampleSurvey.description}
                </p>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider mb-3">
                  Included Questions ({activeTemplate.sampleSurvey.questions.length})
                </h4>
                <div className="space-y-2.5">
                  {activeTemplate.sampleSurvey.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-[#091330] rounded-xl border border-blue-900/60 text-xs flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 font-black flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-black text-white">
                          {q.title}
                        </div>
                        <div className="text-[11px] text-blue-300 mt-0.5 capitalize flex items-center gap-1.5 font-bold">
                          <span>Type: {q.type.replace('_', ' ')}</span>
                          {q.required && <span className="text-rose-400 font-black">· Required</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between">
              <div className="text-xs text-blue-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Calibrated for East Africa deployment</span>
              </div>
              <button
                onClick={() => {
                  onSelectTemplate(activeTemplate.sampleSurvey);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md border border-blue-400/30 transition-colors"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
