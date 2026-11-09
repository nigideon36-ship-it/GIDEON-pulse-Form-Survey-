import React from 'react';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Sliders,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { Question, QuestionType, LogicOperator, LogicAction } from '../../types/survey';

interface QuestionEditorCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  allQuestions: Question[];
  onChange: (updated: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: 'multiple_choice', label: 'Multiple Choice (Single)' },
  { type: 'checkboxes', label: 'Checkboxes (Multi-select)' },
  { type: 'nps', label: 'Net Promoter Score (0–10)' },
  { type: 'rating', label: 'Star / Number Rating' },
  { type: 'likert', label: 'Likert Matrix Scale' },
  { type: 'short_text', label: 'Short Text Input' },
  { type: 'long_text', label: 'Long Text / Paragraph' },
  { type: 'dropdown', label: 'Dropdown List' },
  { type: 'yes_no', label: 'Yes / No Binary' },
  { type: 'date', label: 'Date Selection' },
];

export const QuestionEditorCard: React.FC<QuestionEditorCardProps> = ({
  question,
  index,
  totalQuestions,
  allQuestions,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const [showLogic, setShowLogic] = React.useState(false);

  // Helper to update fields
  const updateField = (field: keyof Question, value: any) => {
    onChange({ ...question, [field]: value });
  };

  // Option handlers for multiple_choice / checkboxes / dropdown
  const handleAddOption = () => {
    const currentOptions = question.options || [];
    updateField('options', [...currentOptions, `Option ${currentOptions.length + 1}`]);
  };

  const handleUpdateOption = (optIndex: number, text: string) => {
    const currentOptions = [...(question.options || [])];
    currentOptions[optIndex] = text;
    updateField('options', currentOptions);
  };

  const handleDeleteOption = (optIndex: number) => {
    const currentOptions = [...(question.options || [])];
    currentOptions.splice(optIndex, 1);
    updateField('options', currentOptions);
  };

  // Likert statement handlers
  const handleAddLikertStatement = () => {
    const stmts = question.likertStatements || [];
    updateField('likertStatements', [...stmts, `Statement ${stmts.length + 1}`]);
  };

  const handleUpdateLikertStatement = (stmtIndex: number, text: string) => {
    const stmts = [...(question.likertStatements || [])];
    stmts[stmtIndex] = text;
    updateField('likertStatements', stmts);
  };

  const handleDeleteLikertStatement = (stmtIndex: number) => {
    const stmts = [...(question.likertStatements || [])];
    stmts.splice(stmtIndex, 1);
    updateField('likertStatements', stmts);
  };

  // Conditional logic handlers
  const handleAddLogicRule = () => {
    const rules = question.logic || [];
    const priorQuestions = allQuestions.slice(0, index);
    const defaultTarget = priorQuestions.length > 0 ? priorQuestions[0].id : '';

    updateField('logic', [
      ...rules,
      {
        id: `rule_${Date.now()}`,
        questionId: defaultTarget,
        operator: 'equals' as LogicOperator,
        value: '',
        action: 'show' as LogicAction,
      },
    ]);
  };

  const handleRemoveLogicRule = (ruleId: string) => {
    const rules = (question.logic || []).filter((r) => r.id !== ruleId);
    updateField('logic', rules);
  };

  const handleUpdateLogicRule = (ruleId: string, updates: any) => {
    const rules = (question.logic || []).map((r) =>
      r.id === ruleId ? { ...r, ...updates } : r
    );
    updateField('logic', rules);
  };

  const previousQuestions = allQuestions.slice(0, index);

  return (
    <div className="bg-[#0c183a] border border-blue-900/60 rounded-2xl p-6 shadow-md transition-all hover:border-blue-700 text-white">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between pb-4 border-b border-blue-900/60 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 font-black text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <select
            value={question.type}
            onChange={(e) => {
              const newType = e.target.value as QuestionType;
              let defaultOptions = question.options;
              if (['multiple_choice', 'checkboxes', 'dropdown'].includes(newType) && (!defaultOptions || defaultOptions.length === 0)) {
                defaultOptions = ['Option 1', 'Option 2', 'Option 3'];
              }
              let defaultLikert = question.likertStatements;
              if (newType === 'likert' && (!defaultLikert || defaultLikert.length === 0)) {
                defaultLikert = ['Product is easy to use', 'Features meet team requirements'];
              }
              onChange({
                ...question,
                type: newType,
                options: defaultOptions,
                likertStatements: defaultLikert,
                likertScale: question.likertScale || ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
                minRating: question.minRating || 1,
                maxRating: question.maxRating || 5,
              });
            }}
            className="text-xs font-black text-white bg-[#091330] border border-blue-900/60 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {QUESTION_TYPES.map((qt) => (
              <option key={qt.type} value={qt.type} className="bg-[#0c183a] text-white">
                {qt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
            className="p-1.5 text-blue-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-blue-950 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalQuestions - 1}
            title="Move down"
            className="p-1.5 text-blue-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-blue-950 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDuplicate}
            title="Duplicate question"
            className="p-1.5 text-blue-300 hover:text-white rounded-lg hover:bg-blue-950 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            title="Delete question"
            className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Question Fields */}
      <div className="pt-4 space-y-4">
        <div>
          <label className="block text-[11px] font-black text-blue-300 uppercase tracking-wider mb-1.5">
            Question Prompt (Main Words)
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Rate your satisfaction with M-Pesa agent transaction speed"
            className="w-full px-3.5 py-2.5 text-sm font-black bg-[#091330] border border-blue-900/60 rounded-xl text-white placeholder:text-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Help Text / Description (Optional)
          </label>
          <input
            type="text"
            value={question.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Add context or instructions for respondents..."
            className="w-full px-3.5 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white placeholder:text-blue-300/40 focus:outline-none font-semibold"
          />
        </div>

        {/* Options Management for Multiple Choice / Checkboxes / Dropdown */}
        {['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type) && (
          <div className="pt-2">
            <label className="block text-[11px] font-black text-blue-300 uppercase tracking-wider mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {(question.options || []).map((option, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <span className="text-xs text-blue-400 font-mono font-bold w-4 text-center">
                    {optIdx + 1}.
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {(question.options || []).length > 1 && (
                    <button
                      onClick={() => handleDeleteOption(optIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddOption}
              className="mt-2.5 text-xs font-black text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Option</span>
            </button>
          </div>
        )}

        {/* Likert Matrix Configuration */}
        {question.type === 'likert' && (
          <div className="pt-2 space-y-3">
            <div>
              <label className="block text-[11px] font-black text-blue-300 uppercase tracking-wider mb-2">
                Statements to Rate
              </label>
              <div className="space-y-2">
                {(question.likertStatements || []).map((stmt, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2">
                    <span className="text-xs text-blue-400 font-mono font-bold w-4 text-center">{sIdx + 1}.</span>
                    <input
                      type="text"
                      value={stmt}
                      onChange={(e) => handleUpdateLikertStatement(sIdx, e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleDeleteLikertStatement(sIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddLikertStatement}
                className="mt-2.5 text-xs font-black text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Statement</span>
              </button>
            </div>
          </div>
        )}

        {/* Rating Scale Config */}
        {question.type === 'rating' && (
          <div className="pt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-blue-300 uppercase tracking-wider mb-1.5">
                Max Scale
              </label>
              <select
                value={question.maxRating || 5}
                onChange={(e) => updateField('maxRating', Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold"
              >
                <option value={5} className="bg-[#0c183a] text-white">5 Stars / Points</option>
                <option value={10} className="bg-[#0c183a] text-white">10 Points</option>
                <option value={3} className="bg-[#0c183a] text-white">3 Points</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-blue-300 uppercase tracking-wider mb-1.5">
                Display Style
              </label>
              <select
                value={question.ratingShape || 'star'}
                onChange={(e) => updateField('ratingShape', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#091330] border border-blue-900/60 rounded-xl text-white font-bold"
              >
                <option value="star" className="bg-[#0c183a] text-white">Star Rating ★</option>
                <option value="number" className="bg-[#0c183a] text-white">Numeric Pills (1, 2, 3...)</option>
              </select>
            </div>
          </div>
        )}

        {/* Bottom Options: Required Toggle & Conditional Logic Expander */}
        <div className="pt-3 border-t border-blue-900/60 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateField('required', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Required field</span>
          </label>

          <button
            onClick={() => setShowLogic(!showLogic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
              (question.logic && question.logic.length > 0) || showLogic
                ? 'bg-blue-600 text-white'
                : 'text-blue-300 hover:text-white bg-blue-950 border border-blue-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Conditional Logic {question.logic?.length ? `(${question.logic.length})` : ''}</span>
          </button>
        </div>

        {/* Conditional Logic Section */}
        {showLogic && (
          <div className="mt-3 p-4 bg-[#091330] rounded-2xl border border-blue-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-white">
                  Branching Rules for Question {index + 1}
                </span>
                <p className="text-[11px] text-blue-300 font-bold">
                  Only show this question when conditions from earlier questions are satisfied.
                </p>
              </div>
              <button
                onClick={handleAddLogicRule}
                disabled={previousQuestions.length === 0}
                className="flex items-center gap-1 px-3 py-1 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Add Condition</span>
              </button>
            </div>

            {previousQuestions.length === 0 ? (
              <p className="text-xs text-blue-300/70 italic py-2 font-bold">
                This is the first question in the survey. Conditional display can only be linked to preceding questions.
              </p>
            ) : (question.logic || []).length === 0 ? (
              <p className="text-xs text-blue-300/70 italic py-1 font-bold">
                No rules active. This question will be displayed to all respondents.
              </p>
            ) : (
              <div className="space-y-2">
                {(question.logic || []).map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-wrap items-center gap-2 p-2.5 bg-[#0c183a] rounded-xl border border-blue-900/60 text-xs"
                  >
                    <span className="font-black text-blue-300 text-[11px]">SHOW IF</span>
                    <select
                      value={rule.questionId}
                      onChange={(e) => handleUpdateLogicRule(rule.id, { questionId: e.target.value })}
                      className="px-2.5 py-1 bg-[#091330] border border-blue-900/60 rounded-lg text-white font-bold max-w-[140px] truncate"
                    >
                      {previousQuestions.map((pq, pqIdx) => (
                        <option key={pq.id} value={pq.id} className="bg-[#0c183a] text-white">
                          Q{pqIdx + 1}: {pq.title}
                        </option>
                      ))}
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => handleUpdateLogicRule(rule.id, { operator: e.target.value })}
                      className="px-2.5 py-1 bg-[#091330] border border-blue-900/60 rounded-lg text-white font-bold"
                    >
                      <option value="equals" className="bg-[#0c183a] text-white">is equal to</option>
                      <option value="not_equals" className="bg-[#0c183a] text-white">is not equal to</option>
                      <option value="less_than" className="bg-[#0c183a] text-white">is less than</option>
                      <option value="greater_than" className="bg-[#0c183a] text-white">is greater than</option>
                      <option value="contains" className="bg-[#0c183a] text-white">contains</option>
                      <option value="is_answered" className="bg-[#0c183a] text-white">is answered</option>
                    </select>

                    {rule.operator !== 'is_answered' && (
                      <input
                        type="text"
                        value={rule.value ?? ''}
                        onChange={(e) => handleUpdateLogicRule(rule.id, { value: e.target.value })}
                        placeholder="Value to match..."
                        className="px-2.5 py-1 bg-[#091330] border border-blue-900/60 rounded-lg text-white font-bold flex-1 min-w-[100px]"
                      />
                    )}

                    <button
                      onClick={() => handleRemoveLogicRule(rule.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 ml-auto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
