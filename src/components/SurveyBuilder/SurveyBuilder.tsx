import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Sparkles,
  Sliders,
  Palette,
  GitBranch,
  Layers,
  Settings as SettingsIcon,
  Check,
  Send,
} from 'lucide-react';
import { Question, Survey, SurveyCategory, SurveyStatus } from '../../types/survey';
import { QuestionEditorCard } from './QuestionEditorCard';
import { AIGeneratorModal } from './AIGeneratorModal';
import { SurveyResponder } from '../SurveyResponder/SurveyResponder';

interface SurveyBuilderProps {
  initialSurvey: Survey;
  onSave: (survey: Survey) => void;
  onBack: () => void;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  initialSurvey,
  onSave,
  onBack,
}) => {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [activeTab, setActiveTab] = useState<'questions' | 'logic' | 'theme' | 'settings'>('questions');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Field updates
  const handleUpdateTitle = (title: string) => {
    setSurvey((prev) => ({ ...prev, title }));
  };

  const handleUpdateDescription = (description: string) => {
    setSurvey((prev) => ({ ...prev, description }));
  };

  const handleUpdateStatus = (status: SurveyStatus) => {
    setSurvey((prev) => ({ ...prev, status }));
  };

  const handleUpdateCategory = (category: SurveyCategory) => {
    setSurvey((prev) => ({ ...prev, category }));
  };

  // Question handlers
  const handleAddQuestion = (type: Question['type'] = 'multiple_choice') => {
    const newQ: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: 'Untitled Question',
      description: '',
      required: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
      minRating: 1,
      maxRating: 5,
    };
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
  };

  const handleUpdateQuestion = (index: number, updated: Question) => {
    setSurvey((prev) => {
      const qList = [...prev.questions];
      qList[index] = updated;
      return { ...prev, questions: qList };
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setSurvey((prev) => {
      const qList = [...prev.questions];
      qList.splice(index, 1);
      return { ...prev, questions: qList };
    });
  };

  const handleDuplicateQuestion = (index: number) => {
    setSurvey((prev) => {
      const qList = [...prev.questions];
      const source = qList[index];
      const duplicate: Question = {
        ...JSON.parse(JSON.stringify(source)),
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `${source.title} (Copy)`,
      };
      qList.splice(index + 1, 0, duplicate);
      return { ...prev, questions: qList };
    });
  };

  const handleMoveQuestion = (from: number, to: number) => {
    setSurvey((prev) => {
      if (to < 0 || to >= prev.questions.length) return prev;
      const qList = [...prev.questions];
      const [moved] = qList.splice(from, 1);
      qList.splice(to, 0, moved);
      return { ...prev, questions: qList };
    });
  };

  // Apply AI Generated Survey
  const handleApplyAI = (generatedData: Partial<Survey>) => {
    setSurvey((prev) => ({
      ...prev,
      title: generatedData.title || prev.title,
      description: generatedData.description || prev.description,
      category: generatedData.category || prev.category,
      questions: generatedData.questions && generatedData.questions.length > 0 ? generatedData.questions : prev.questions,
    }));
  };

  // Save handler
  const handleSave = () => {
    onSave(survey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070e24] text-white flex flex-col">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-30 bg-[#0a1538] border-b border-blue-900/60 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 flex-1 mr-4">
          <button
            onClick={onBack}
            className="p-1.5 text-blue-300 hover:text-white rounded-xl hover:bg-blue-950 border border-transparent hover:border-blue-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-xl">
            <input
              type="text"
              value={survey.title}
              onChange={(e) => handleUpdateTitle(e.target.value)}
              placeholder="Survey Title (East Africa Edition)"
              className="w-full text-base sm:text-lg font-black text-white bg-transparent border-0 border-b border-transparent hover:border-blue-700 focus:border-blue-400 focus:ring-0 focus:outline-none px-0 py-0.5 tracking-tight"
            />
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={survey.status}
            onChange={(e) => handleUpdateStatus(e.target.value as SurveyStatus)}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-colors ${
              survey.status === 'active'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                : survey.status === 'closed'
                ? 'bg-blue-950 text-slate-300 border-blue-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-700'
            }`}
          >
            <option value="draft">Draft</option>
            <option value="active">Active (Accepting)</option>
            <option value="closed">Closed</option>
          </select>

          <button
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-blue-300 bg-blue-950 hover:bg-blue-900 border border-blue-800 rounded-xl transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">AI Architect</span>
          </button>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-[#0c183a] border border-blue-700 hover:bg-blue-950 rounded-xl transition-colors whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Live Test</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md border border-blue-400/30 transition-colors whitespace-nowrap"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#0a1538] border-b border-blue-900/60 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-8 text-xs font-bold">
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors font-black ${
              activeTab === 'questions'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Questions ({survey.questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logic')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors font-black ${
              activeTab === 'logic'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Branching & Logic</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors font-black ${
              activeTab === 'theme'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme & Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors font-black ${
              activeTab === 'settings'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings & Access</span>
          </button>
        </div>
      </div>

      {/* Main Tab Viewports */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6">
        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-[#0c183a] border border-blue-900/60 rounded-2xl p-6 shadow-md space-y-4">
              <div>
                <label className="block text-[11px] font-black text-blue-300 uppercase tracking-wider mb-1.5">
                  Survey Subtitle / East Africa Context
                </label>
                <textarea
                  value={survey.description}
                  onChange={(e) => handleUpdateDescription(e.target.value)}
                  placeholder="Explain the mission and scope of this East African survey..."
                  rows={2}
                  className="w-full p-3.5 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-56">
                  <label className="block text-[11px] font-black text-blue-300 uppercase tracking-wider mb-1.5">
                    Regional Category
                  </label>
                  <select
                    value={survey.category}
                    onChange={(e) => handleUpdateCategory(e.target.value as SurveyCategory)}
                    className="w-full px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Customer Experience">Customer Experience (M-Pesa / MoMo)</option>
                    <option value="Product & Engineering">Product & Engineering (Tech Safari)</option>
                    <option value="Human Resources">Human Resources (East Africa Teams)</option>
                    <option value="Market Research">Market Research & Agribusiness</option>
                    <option value="Event & Community">Event & Community (SACCO & Cooperatives)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {survey.questions.map((q, idx) => (
                <QuestionEditorCard
                  key={q.id}
                  question={q}
                  index={idx}
                  totalQuestions={survey.questions.length}
                  allQuestions={survey.questions}
                  onChange={(updated) => handleUpdateQuestion(idx, updated)}
                  onDelete={() => handleDeleteQuestion(idx)}
                  onDuplicate={() => handleDuplicateQuestion(idx)}
                  onMoveUp={() => handleMoveQuestion(idx, idx - 1)}
                  onMoveDown={() => handleMoveQuestion(idx, idx + 1)}
                />
              ))}
            </div>

            {/* Add Question Toolbar */}
            <div className="p-5 bg-[#0c183a] border border-dashed border-blue-700/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Add Next Question:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="px-3 py-1.5 text-xs font-black text-white bg-[#091330] hover:bg-blue-950 border border-blue-800 rounded-xl transition-colors"
                >
                  + Choice
                </button>
                <button
                  onClick={() => handleAddQuestion('rating')}
                  className="px-3 py-1.5 text-xs font-black text-white bg-[#091330] hover:bg-blue-950 border border-blue-800 rounded-xl transition-colors"
                >
                  + Rating ★
                </button>
                <button
                  onClick={() => handleAddQuestion('nps')}
                  className="px-3 py-1.5 text-xs font-black text-white bg-[#091330] hover:bg-blue-950 border border-blue-800 rounded-xl transition-colors"
                >
                  + NPS (0–10)
                </button>
                <button
                  onClick={() => handleAddQuestion('long_text')}
                  className="px-3 py-1.5 text-xs font-black text-white bg-[#091330] hover:bg-blue-950 border border-blue-800 rounded-xl transition-colors"
                >
                  + Long Text
                </button>
                <button
                  onClick={() => handleAddQuestion('likert')}
                  className="px-3 py-1.5 text-xs font-black text-white bg-[#091330] hover:bg-blue-950 border border-blue-800 rounded-xl transition-colors"
                >
                  + Likert Matrix
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOGIC & FLOW TAB */}
        {activeTab === 'logic' && (
          <div className="space-y-6">
            <div className="bg-[#0c183a] border border-blue-900/60 rounded-2xl p-6 shadow-md">
              <h3 className="text-sm font-black text-white mb-1">
                Survey Branching & Skip Logic Map
              </h3>
              <p className="text-xs text-blue-300 font-bold">
                Conditional logic pathways configured across all East African respondents.
              </p>
            </div>

            <div className="space-y-3">
              {survey.questions.map((q, idx) => {
                const hasLogic = q.logic && q.logic.length > 0;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border bg-[#0c183a] ${
                      hasLogic
                        ? 'border-blue-400 ring-1 ring-blue-500/20'
                        : 'border-blue-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-white">
                        Q{idx + 1}: {q.title}
                      </span>
                      <span className="text-blue-300 font-bold capitalize bg-[#091330] px-2 py-0.5 rounded-lg border border-blue-900/60">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>

                    {hasLogic ? (
                      <div className="mt-3 p-3.5 bg-[#091330] rounded-xl border border-blue-900/60 text-xs space-y-1.5">
                        <span className="font-black text-blue-300 text-[11px] uppercase tracking-wider block">
                          Conditional Rule Active:
                        </span>
                        {q.logic?.map((r) => (
                          <div key={r.id} className="text-slate-200 font-semibold">
                            • Display question only when <strong className="text-white">Question {r.questionId}</strong> {r.operator.replace('_', ' ')} <strong className="text-blue-300">"{r.value}"</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-400 italic font-semibold">
                        Standard sequence (Always shown to respondent)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* THEME & DESIGN TAB */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="bg-[#0c183a] border border-blue-900/60 rounded-2xl p-6 shadow-md space-y-6">
              <h3 className="text-sm font-black text-white">
                Appearance & Form UX
              </h3>

              {/* Form Presentation Mode */}
              <div>
                <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-2">
                  Presentation Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() =>
                      setSurvey((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, mode: 'card_step' },
                      }))
                    }
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      survey.theme.mode === 'card_step'
                        ? 'border-blue-400 bg-blue-950/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-blue-900/60 bg-[#091330] hover:border-blue-700'
                    }`}
                  >
                    <div className="font-black text-xs text-white mb-1">
                      Card Step-by-Step (Typeform Style)
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      One question at a time. Keyboard navigation (Enter / 1-9), fluid animated transitions, and high focus.
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      setSurvey((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, mode: 'scroll' },
                      }))
                    }
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      survey.theme.mode === 'scroll'
                        ? 'border-blue-400 bg-blue-950/80 shadow-md ring-2 ring-blue-500/30'
                        : 'border-blue-900/60 bg-[#091330] hover:border-blue-700'
                    }`}
                  >
                    <div className="font-black text-xs text-white mb-1">
                      Continuous Single-Scroll Document
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      All questions visible in an airy, unified form sheet. Ideal for rapid field surveys and offline enumerators.
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary Color Accent */}
              <div>
                <label className="block text-xs font-black text-blue-300 uppercase tracking-wider mb-2">
                  Brand Color Accent
                </label>
                <div className="flex items-center gap-3">
                  {['#2563eb', '#0d9488', '#4f46e5', '#e11d48', '#d97706', '#0f172a'].map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setSurvey((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: color },
                        }))
                      }
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        survey.theme.primaryColor === color ? 'scale-110 ring-2 ring-offset-2 ring-blue-400 ring-offset-[#0c183a]' : 'hover:scale-105'
                      }`}
                    />
                  ))}
                  <input
                    type="text"
                    value={survey.theme.primaryColor}
                    onChange={(e) =>
                      setSurvey((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, primaryColor: e.target.value },
                      }))
                    }
                    className="w-28 px-3 py-1.5 text-xs font-mono bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              {/* Progress Bar Toggle */}
              <div className="pt-3 border-t border-blue-900/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-white">
                    Show Respondent Progress Bar
                  </div>
                  <div className="text-[11px] text-blue-300 font-bold">
                    Displays real-time completion percentage at the top of the survey.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={survey.theme.showProgress}
                  onChange={(e) =>
                    setSurvey((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, showProgress: e.target.checked },
                    }))
                  }
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-[#0c183a] border border-blue-900/60 rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-black text-white">
                Response Collection & Privacy (East Africa Protocols)
              </h3>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-900/60 bg-[#091330] hover:bg-blue-950/60 cursor-pointer">
                  <div>
                    <div className="text-xs font-black text-white">
                      Require Respondent Email
                    </div>
                    <div className="text-[11px] text-blue-300 font-bold">
                      Prompts respondents to verify their email before taking the survey.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={survey.settings.requireEmail}
                    onChange={(e) =>
                      setSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, requireEmail: e.target.checked },
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-900/60 bg-[#091330] hover:bg-blue-950/60 cursor-pointer">
                  <div>
                    <div className="text-xs font-black text-white">
                      Collect Respondent Full Name
                    </div>
                    <div className="text-[11px] text-blue-300 font-bold">
                      Stores verified full names for regional customer insight follow-ups.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={survey.settings.collectName}
                    onChange={(e) =>
                      setSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, collectName: e.target.checked },
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-900/60 bg-[#091330] hover:bg-blue-950/60 cursor-pointer">
                  <div>
                    <div className="text-xs font-black text-white">
                      Allow Anonymous Submissions
                    </div>
                    <div className="text-[11px] text-blue-300 font-bold">
                      Enables participants to submit with zero identifying metadata.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={survey.settings.allowAnonymous}
                    onChange={(e) =>
                      setSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, allowAnonymous: e.target.checked },
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* Thank you message customizer */}
              <div className="pt-4 border-t border-blue-900/60 space-y-3">
                <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider">
                  Completion Screen Text
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Thank You Title
                  </label>
                  <input
                    type="text"
                    value={survey.settings.customThankYouTitle || ''}
                    onChange={(e) =>
                      setSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, customThankYouTitle: e.target.value },
                      }))
                    }
                    placeholder="e.g. Asante Sana! Thank You for Shaping East Africa"
                    className="w-full px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Thank You Message
                  </label>
                  <textarea
                    value={survey.settings.customThankYouMessage || ''}
                    onChange={(e) =>
                      setSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, customThankYouMessage: e.target.value },
                      }))
                    }
                    placeholder="Explain what happens next with their feedback..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onApplyGeneratedSurvey={handleApplyAI}
      />

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#070e24]/95 backdrop-blur-md flex flex-col">
          <div className="p-4 bg-[#0a1538] border-b border-blue-900/60 flex items-center justify-between px-6 text-white text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm">Interactive East Africa Preview</span>
              <span className="text-blue-300 font-bold">· Testing live question validation & logic</span>
            </div>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-black transition-colors"
            >
              Exit Preview
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SurveyResponder
              survey={survey}
              isPreviewMode={true}
              onClosePreview={() => setIsPreviewOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
