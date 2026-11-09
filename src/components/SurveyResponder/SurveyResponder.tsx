import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Survey, Question, LogicRule } from '../../types/survey';
import { saveResponse } from '../../services/storage';

interface SurveyResponderProps {
  survey: Survey;
  isPreviewMode?: boolean;
  onClosePreview?: () => void;
  onFinish?: () => void;
}

export const SurveyResponder: React.FC<SurveyResponderProps> = ({
  survey,
  isPreviewMode = false,
  onClosePreview,
  onFinish,
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [respondentEmail, setRespondentEmail] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [startTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Evaluate conditional logic to determine which questions are active
  const isQuestionVisible = (q: Question, currentAnswers: Record<string, any>): boolean => {
    if (!q.logic || q.logic.length === 0) return true;

    // By default, if any rule matches 'show', it is shown
    return q.logic.every((rule: LogicRule) => {
      const priorAnswer = currentAnswers[rule.questionId];

      if (rule.operator === 'is_answered') {
        return priorAnswer !== undefined && priorAnswer !== '';
      }
      if (rule.operator === 'is_empty') {
        return priorAnswer === undefined || priorAnswer === '';
      }

      if (priorAnswer === undefined || priorAnswer === null) return false;

      if (rule.operator === 'equals') {
        return String(priorAnswer).trim().toLowerCase() === String(rule.value).trim().toLowerCase();
      }
      if (rule.operator === 'not_equals') {
        return String(priorAnswer).trim().toLowerCase() !== String(rule.value).trim().toLowerCase();
      }
      if (rule.operator === 'less_than') {
        return Number(priorAnswer) < Number(rule.value);
      }
      if (rule.operator === 'greater_than') {
        return Number(priorAnswer) > Number(rule.value);
      }
      if (rule.operator === 'contains') {
        if (Array.isArray(priorAnswer)) {
          return priorAnswer.includes(rule.value);
        }
        return String(priorAnswer).toLowerCase().includes(String(rule.value).toLowerCase());
      }
      return true;
    });
  };

  // Active visible questions list based on live answers
  const activeQuestions = useMemo(() => {
    return survey.questions.filter((q) => isQuestionVisible(q, answers));
  }, [survey.questions, answers]);

  const currentQuestion = activeQuestions[currentIndex];
  const progressPercent = activeQuestions.length > 0
    ? Math.round(((currentIndex + 1) / activeQuestions.length) * 100)
    : 0;

  // Answer handler
  const handleSetAnswer = (qId: string, value: any) => {
    setValidationError(null);
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  // Step Validation
  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;

    const currentVal = answers[currentQuestion.id];

    if (currentQuestion.type === 'likert') {
      const stmts = currentQuestion.likertStatements || [];
      const likertAnswers = currentVal || {};
      const missing = stmts.some((s) => !likertAnswers[s]);
      if (missing) {
        setValidationError('Please select a rating for every statement before proceeding.');
        return false;
      }
    } else if (currentVal === undefined || currentVal === '' || (Array.isArray(currentVal) && currentVal.length === 0)) {
      setValidationError('Please answer this required question to continue.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  // Navigation: Next or Submit
  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitSurvey();
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit survey responses
  const handleSubmitSurvey = () => {
    const elapsedSeconds = Math.max(12, Math.round((Date.now() - startTime) / 1000));
    const generatedId = `RESP-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmissionId(generatedId);

    if (!isPreviewMode) {
      saveResponse(survey.id, {
        respondentEmail: respondentEmail || undefined,
        respondentName: respondentName || undefined,
        completionTimeSeconds: elapsedSeconds,
        answers,
      });
    }

    setIsSubmitted(true);
  };

  // Keyboard shortcut listener for Typeform mode
  useEffect(() => {
    if (!hasStarted || isSubmitted || survey.theme.mode !== 'card_step') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when user is typing in a text input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Enter' && target.tagName === 'INPUT') {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (currentQuestion && (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'dropdown')) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= (currentQuestion.options?.length || 0)) {
          const selectedOption = currentQuestion.options![num - 1];
          handleSetAnswer(currentQuestion.id, selectedOption);
        }
      } else if (currentQuestion && currentQuestion.type === 'nps') {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 0 && num <= 9) {
          handleSetAnswer(currentQuestion.id, num);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isSubmitted, currentIndex, activeQuestions, answers, currentQuestion]);

  const brandColor = survey.theme.primaryColor || '#2563eb';

  // WELCOME SCREEN
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#070e24] text-white flex flex-col justify-center items-center p-6">
        <div className="max-w-xl w-full bg-[#0c183a] border border-blue-900/60 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 text-center">
          <div
            style={{ backgroundColor: `${brandColor}25`, color: '#60a5fa' }}
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-black text-xl border border-blue-500/30 shadow-md"
          >
            EA
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-700/50 mb-2">
              <span>East Africa Field Survey</span>
              <span aria-hidden="true">·</span>
              <span>{survey.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {survey.title}
            </h1>
            <p className="text-sm text-slate-300 mt-2.5 max-w-md mx-auto leading-relaxed font-medium">
              {survey.description}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-blue-200 font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>~2–3 minutes</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{survey.questions.length} questions</span>
            {survey.settings.allowAnonymous && (
              <>
                <span aria-hidden="true">·</span>
                <span>Anonymous permitted</span>
              </>
            )}
          </div>

          {/* Optional Name/Email inputs if required by settings */}
          {(survey.settings.requireEmail || survey.settings.collectName) && (
            <div className="pt-3 border-t border-blue-900/50 space-y-3 text-left">
              {survey.settings.collectName && (
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Your Full Name {survey.settings.allowAnonymous && '(Optional)'}
                  </label>
                  <input
                    type="text"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="e.g. Juma Mwangi (Nairobi) or Brenda Akoth (Kampala)"
                    className="w-full px-3.5 py-2 text-xs bg-[#070e24] border border-blue-900/60 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {survey.settings.requireEmail && (
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Your Business / Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    placeholder="e.g. name@company.co.ke / .tz / .ug"
                    className="w-full px-3.5 py-2 text-xs bg-[#070e24] border border-blue-900/60 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}


          <div className="pt-4">
            <button
              onClick={() => {
                if (survey.settings.requireEmail && !respondentEmail.trim()) {
                  setValidationError('Please enter your email address to begin.');
                  return;
                }
                setValidationError(null);
                setHasStarted(true);
              }}
              style={{ backgroundColor: brandColor }}
              className="w-full py-3 px-6 text-sm font-semibold text-white rounded-xl shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Start Survey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-neutral-400 mt-2">
              Press <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-[10px]">Enter ↵</kbd> to start
            </p>
          </div>

          {validationError && (
            <div className="p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900">
              {validationError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // COMPLETION SCREEN
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#070e24] text-white flex flex-col justify-center items-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-w-md w-full bg-[#0c183a] border border-blue-900/60 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6"
        >
          <div className="w-14 h-14 rounded-full bg-blue-950 text-blue-400 border border-blue-500/40 flex items-center justify-center mx-auto shadow-inner">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>

          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-blue-300 px-2 py-0.5 rounded bg-blue-950 inline-block mb-1.5 border border-blue-700/50">
              East Africa Verified
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {survey.settings.customThankYouTitle || 'Asante Sana! Feedback Recorded'}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
              {survey.settings.customThankYouMessage ||
                'Thank you for contributing your candid perspective. Your response has been securely saved and synthesized for East African decision-makers.'}
            </p>
          </div>

          <div className="p-3 bg-[#070e24] rounded-xl border border-blue-900/60 text-xs flex items-center justify-between">
            <span className="text-slate-400 font-bold">Submission Reference:</span>
            <span className="font-mono font-black text-blue-300">
              #{submissionId}
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {isPreviewMode ? (
              <button
                onClick={onClosePreview}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-md"
              >
                Close Preview
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAnswers({});
                    setCurrentIndex(0);
                    setIsSubmitted(false);
                    setHasStarted(false);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-blue-200 bg-blue-950 hover:bg-blue-900 border border-blue-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit Another</span>
                </button>

                {onFinish && (
                  <button
                    onClick={onFinish}
                    className="flex-1 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-md"
                  >
                    View Analytics
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // CONTINUOUS SCROLL MODE
  if (survey.theme.mode === 'scroll') {
    return (
      <div className="min-h-screen bg-[#070e24] text-white py-10 px-4 flex justify-center">
        <div className="max-w-2xl w-full space-y-6">
          {/* Document Header */}
          <div className="bg-[#0c183a] border border-blue-900/60 rounded-2xl p-6 sm:p-8 shadow-xl border-t-4" style={{ borderTopColor: '#3b82f6' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-300 px-2 py-0.5 rounded bg-blue-950 border border-blue-700/50">
                East Africa
              </span>
              <span className="text-xs font-bold text-blue-200">
                {survey.category}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {survey.title}
            </h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
              {survey.description}
            </p>
          </div>

          {/* Questions Stack */}
          {activeQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-[#0c183a] border border-blue-900/60 rounded-2xl p-6 shadow-md space-y-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-blue-400">
                    {idx + 1}.
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    {q.title} {q.required && <span className="text-rose-400">*</span>}
                  </h3>
                </div>
                {q.description && (
                  <p className="text-xs text-slate-300 ml-4">
                    {q.description}
                  </p>
                )}
              </div>

              {/* Render Question Inputs */}
              <div className="pt-1">
                <QuestionInput
                  question={q}
                  value={answers[q.id]}
                  onChange={(val) => handleSetAnswer(q.id, val)}
                  brandColor={brandColor}
                />
              </div>
            </div>
          ))}

          {validationError && (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
              {validationError}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                // Check all required
                const missing = activeQuestions.find((q) => {
                  if (!q.required) return false;
                  const v = answers[q.id];
                  return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
                });
                if (missing) {
                  setValidationError(`Please answer all required questions (Missing: "${missing.title}")`);
                  return;
                }
                handleSubmitSurvey();
              }}
              style={{ backgroundColor: brandColor }}
              className="w-full py-3 px-6 text-sm font-semibold text-white rounded-xl shadow-md hover:opacity-95 transition-opacity"
            >
              Submit Responses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CARD STEP-BY-STEP MODE (Default Typeform Style)
  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#070e24] text-white flex flex-col justify-between"
    >
      {/* Top Progress Bar */}
      {survey.theme.showProgress && (
        <div className="w-full h-1.5 bg-blue-950 fixed top-0 left-0 z-40">
          <motion.div
            className="h-full bg-blue-500 shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}

      {/* Top Meta info */}
      <div className="pt-6 px-6 max-w-3xl mx-auto w-full flex items-center justify-between text-xs text-blue-300">
        <span className="font-extrabold text-white truncate max-w-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span>{survey.title}</span>
        </span>
        <span className="font-mono tabular-nums font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
          {currentIndex + 1} of {activeQuestions.length}
        </span>
      </div>

      {/* Main Card Viewport */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Question Title & Description (Bold Words & Title per user request) */}
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-xs font-black font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                      Q{currentIndex + 1}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                      {currentQuestion.title}
                      {currentQuestion.required && (
                        <span className="text-rose-400 ml-1.5 text-base" title="Required">*</span>
                      )}
                    </h2>
                  </div>

                  {currentQuestion.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-8 font-medium">
                      {currentQuestion.description}
                    </p>
                  )}
                </div>

                {/* Input Control */}
                <div className="pl-8 pt-1">
                  <QuestionInput
                    question={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={(val) => handleSetAnswer(currentQuestion.id, val)}
                    brandColor={brandColor}
                    isStepMode={true}
                  />
                </div>

                {validationError && (
                  <div className="ml-8 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-800 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{validationError}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Bottom Navigation Controls */}
      <div className="p-6 max-w-3xl mx-auto w-full flex items-center justify-between border-t border-blue-900/60 bg-[#0a1538]/90 backdrop-blur-md">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] text-blue-300 font-semibold">
            press <kbd className="px-1.5 py-0.5 bg-blue-950 border border-blue-800 rounded font-mono text-[10px] text-white">Enter ↵</kbd>
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all border border-blue-400/30"
          >
            <span>{currentIndex === activeQuestions.length - 1 ? 'Submit' : 'OK'}</span>
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Question Input Renderer for Both Step & Scroll Modes
interface QuestionInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  brandColor: string;
  isStepMode?: boolean;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  value,
  onChange,
  brandColor,
  isStepMode = false,
}) => {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <div className="space-y-2.5 max-w-lg">
          {(question.options || []).map((opt, optIdx) => {
            const isSelected = value === opt;
            const letter = String.fromCharCode(65 + optIdx);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-blue-400 bg-blue-600/30 text-white shadow-md ring-1 ring-blue-400'
                    : 'border-blue-900/60 bg-[#0c183a] hover:border-blue-500 text-slate-100 hover:bg-[#10204a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[11px] ${
                      isSelected
                        ? 'bg-blue-500 text-white shadow-xs'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="font-bold">{opt}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-400 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      );

    case 'checkboxes': {
      const selectedList: string[] = Array.isArray(value) ? value : [];
      const handleToggle = (opt: string) => {
        if (selectedList.includes(opt)) {
          onChange(selectedList.filter((item) => item !== opt));
        } else {
          onChange([...selectedList, opt]);
        }
      };

      return (
        <div className="space-y-2.5 max-w-lg">
          {(question.options || []).map((opt) => {
            const isChecked = selectedList.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => handleToggle(opt)}
                className={`w-full p-4 rounded-xl border text-left cursor-pointer flex items-center justify-between text-xs font-bold transition-all ${
                  isChecked
                    ? 'border-blue-400 bg-blue-600/30 text-white shadow-md ring-1 ring-blue-400'
                    : 'border-blue-900/60 bg-[#0c183a] hover:border-blue-500 text-slate-100 hover:bg-[#10204a]'
                }`}
              >
                <span>{opt}</span>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isChecked
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'border-blue-700 bg-blue-950'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'nps': {
      const selectedScore = value !== undefined ? Number(value) : null;
      return (
        <div className="space-y-3 max-w-xl">
          <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
              const isSelected = selectedScore === score;
              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => onChange(score)}
                  className={`py-3.5 rounded-xl border text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105 ring-2 ring-blue-400'
                      : 'bg-[#0c183a] border-blue-900/60 text-slate-200 hover:border-blue-500 hover:bg-[#10204a]'
                  }`}
                >
                  {score}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] font-bold text-blue-300">
            <span>0 = Not at all likely</span>
            <span>10 = Extremely likely (Advocate)</span>
          </div>
        </div>
      );
    }

    case 'rating': {
      const max = question.maxRating || 5;
      const currentRating = value || 0;
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {Array.from({ length: max }).map((_, i) => {
              const starVal = i + 1;
              const isFilled = currentRating >= starVal;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => onChange(starVal)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 sm:w-9 sm:h-9 ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-blue-900/80 hover:text-blue-700'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {question.ratingLabels && (
            <div className="flex justify-between max-w-xs text-[11px] font-bold text-blue-300">
              <span>{question.ratingLabels.min || 'Low'}</span>
              <span>{question.ratingLabels.max || 'High'}</span>
            </div>
          )}
        </div>
      );
    }

    case 'likert': {
      const statements = question.likertStatements || [];
      const scale = question.likertScale || ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
      const matrixAnswers: Record<string, string> = value || {};

      const handleSetRow = (stmt: string, opt: string) => {
        onChange({ ...matrixAnswers, [stmt]: opt });
      };

      return (
        <div className="overflow-x-auto border border-blue-900/60 rounded-xl bg-[#0c183a] shadow-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#091330] border-b border-blue-900/60 text-blue-200 font-black">
              <tr>
                <th className="p-3 pl-4 min-w-[200px]">East Africa Benchmark Statement</th>
                {scale.map((s) => (
                  <th key={s} className="p-3 text-center min-w-[90px] font-black">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/40 text-slate-100">
              {statements.map((stmt) => (
                <tr key={stmt} className="hover:bg-blue-900/20">
                  <td className="p-3 pl-4 font-bold text-white">
                    {stmt}
                  </td>
                  {scale.map((opt) => {
                    const isSelected = matrixAnswers[stmt] === opt;
                    return (
                      <td key={opt} className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleSetRow(stmt, opt)}
                          className={`w-5 h-5 rounded-full border inline-flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-blue-400 bg-blue-600 shadow-md ring-2 ring-blue-300'
                              : 'border-blue-700 bg-blue-950 hover:border-blue-400'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'short_text':
      return (
        <div className="max-w-md">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'Type your answer here...'}
            className="w-full px-4 py-3 text-sm bg-[#091330] border border-blue-900/60 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 font-semibold"
          />
        </div>
      );

    case 'long_text':
      return (
        <div className="max-w-xl">
          <textarea
            rows={4}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'Share your detailed feedback here...'}
            className="w-full p-4 text-xs leading-relaxed bg-[#091330] border border-blue-900/60 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 font-semibold"
          />
        </div>
      );

    case 'dropdown':
      return (
        <div className="max-w-md">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          >
            <option value="" className="bg-[#0c183a] text-white">Select an option...</option>
            {(question.options || []).map((opt) => (
              <option key={opt} value={opt} className="bg-[#0c183a] text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case 'yes_no':
      return (
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {['Yes', 'No'].map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`py-4 rounded-xl border text-center text-xs font-black transition-all ${
                  isSelected
                    ? 'border-blue-400 bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                    : 'border-blue-900/60 bg-[#0c183a] hover:border-blue-500 text-white hover:bg-[#10204a]'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );

    case 'date':
      return (
        <div className="max-w-xs">
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold"
          />
        </div>
      );

    default:
      return null;
  }
};
