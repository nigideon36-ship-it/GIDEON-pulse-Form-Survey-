import React, { useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight, Wand2 } from 'lucide-react';
import { generateSurveyWithAI } from '../../services/aiService';
import { Survey, SurveyCategory } from '../../types/survey';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedSurvey: (surveyData: Partial<Survey>) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedSurvey,
}) => {
  const [prompt, setPrompt] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [tone, setTone] = useState<string>('professional');
  const [category, setCategory] = useState<SurveyCategory>('Customer Experience');
  const [loading, setLoading] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<Partial<Survey> | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'M-Pesa agent & till merchant satisfaction in Nairobi & Dar es Salaam',
    'SACCO member loan approval & dividend service feedback',
    'Smallholder tea & coffee farmer cooperative yield & fertilizer audit',
    'East Africa cross-border truck logistics & customs clearance pulse',
    'Tech safari & remote software engineer compensation survey (Kenya, Rwanda, Uganda)',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setGeneratedPreview(null);

    try {
      const result = await generateSurveyWithAI(prompt, questionCount, tone, category);
      setGeneratedPreview(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedPreview) return;
    onApplyGeneratedSurvey(generatedPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#0c183a] text-white rounded-3xl border border-blue-900/60 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/60 bg-[#0a1538]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                AI Survey Architect (East Africa Edition)
              </h3>
              <p className="text-xs text-blue-300 font-bold">
                Generate high-converting survey questions tailored for East African markets using Gemini
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!generatedPreview ? (
            <>
              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-2">
                  What is the goal of this East African survey?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Gather feedback from M-Pesa agents and till users across Nairobi and Mombasa on float liquidity..."
                  rows={3}
                  className="w-full p-3.5 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* Quick Prompts */}
              <div>
                <span className="text-[11px] font-black text-blue-300 uppercase tracking-wider block mb-2">
                  Quick East Africa Starters:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((qp) => (
                    <button
                      key={qp}
                      onClick={() => setPrompt(qp)}
                      className="px-3 py-1.5 text-[11px] font-bold text-blue-200 bg-[#091330] hover:bg-blue-950 border border-blue-900/60 hover:border-blue-700 rounded-xl transition-colors text-left"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-1.5">
                    Question Count ({questionCount})
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-blue-300/70 font-bold mt-1">
                    <span>3 quick</span>
                    <span>8 thorough</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-1.5">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professional" className="bg-[#0c183a] text-white">Professional & Direct</option>
                    <option value="conversational" className="bg-[#0c183a] text-white">Warm & Friendly (Jambo)</option>
                    <option value="academic" className="bg-[#0c183a] text-white">Field Research & NGO</option>
                    <option value="minimalist" className="bg-[#0c183a] text-white">USSD / SMS Short Style</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SurveyCategory)}
                    className="w-full px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Customer Experience" className="bg-[#0c183a] text-white">Customer Experience</option>
                    <option value="Product & Engineering" className="bg-[#0c183a] text-white">Product & Engineering</option>
                    <option value="Human Resources" className="bg-[#0c183a] text-white">Human Resources</option>
                    <option value="Market Research" className="bg-[#0c183a] text-white">Market Research</option>
                    <option value="Event & Community" className="bg-[#0c183a] text-white">Event & Community</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3.5 text-xs text-rose-300 bg-rose-950/60 rounded-xl border border-rose-800 font-bold">
                  {error}
                </div>
              )}
            </>
          ) : (
            /* Generated Survey Review */
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/60 border border-blue-700 rounded-2xl">
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider">
                  Generated East Africa Questionnaire
                </span>
                <h4 className="text-base font-black text-white mt-1">
                  {generatedPreview.title}
                </h4>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  {generatedPreview.description}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-black text-blue-300 uppercase tracking-wider mb-2">
                  Generated Questions ({generatedPreview.questions?.length})
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {generatedPreview.questions?.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-3.5 bg-[#091330] rounded-xl border border-blue-900/60 text-xs"
                    >
                      <div className="flex items-center justify-between text-blue-300 text-[11px] mb-1">
                        <span className="font-black text-white">
                          {idx + 1}. {q.title}
                        </span>
                        <span className="capitalize font-mono font-bold">{q.type.replace('_', ' ')}</span>
                      </div>
                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {q.options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="text-[10px] px-2.5 py-1 bg-blue-950 rounded-lg text-blue-300 font-bold border border-blue-800"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-blue-900/60 flex items-center justify-between bg-[#0a1538]">
          {!generatedPreview ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md border border-blue-400/30 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Architecting East Africa Survey...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Generate Survey</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setGeneratedPreview(null)}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Adjust Prompt
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md border border-blue-400/30 transition-colors"
              >
                <span>Apply to Builder</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
