import React, { useState, useMemo } from 'react';
import {
  Plus,
  Sparkles,
  Search,
  Filter,
  BarChart3,
  ExternalLink,
  Edit3,
  Copy,
  Trash2,
  Share2,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  RotateCcw,
  MoreVertical,
  Globe,
  MapPin,
  Play,
} from 'lucide-react';
import { Survey, SurveyCategory, SurveyStatus } from '../types/survey';
import { getAllResponsesMap, resetToSampleData } from '../services/storage';

interface DashboardViewProps {
  surveys: Survey[];
  onSelectSurveyToEdit: (survey: Survey) => void;
  onSelectSurveyAnalytics: (survey: Survey) => void;
  onOpenResponder: (surveyId: string) => void;
  onOpenShareModal: (survey: Survey) => void;
  onDuplicateSurvey: (surveyId: string) => void;
  onDeleteSurvey: (surveyId: string) => void;
  onOpenTemplates: () => void;
  onOpenAIGenerator: () => void;
  onOpenPlayStoreModal?: () => void;
  onNewSurvey: () => void;
  onRefreshData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  surveys,
  onSelectSurveyToEdit,
  onSelectSurveyAnalytics,
  onOpenResponder,
  onOpenShareModal,
  onDuplicateSurvey,
  onDeleteSurvey,
  onOpenTemplates,
  onOpenAIGenerator,
  onOpenPlayStoreModal,
  onNewSurvey,
  onRefreshData,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | SurveyStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuSurveyId, setOpenMenuSurveyId] = useState<string | null>(null);

  const responsesMap = useMemo(() => getAllResponsesMap(), [surveys]);

  // Overall Global Metrics
  const totalSubmissions = useMemo(() => {
    return Object.values(responsesMap).reduce((sum, list) => sum + list.length, 0);
  }, [responsesMap]);

  const activeSurveysCount = surveys.filter((s) => s.status === 'active').length;

  // Filtered surveys
  const filteredSurveys = surveys.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchCat = s.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat;
    }
    return true;
  });

  const categories = ['all', 'Customer Experience', 'Product & Engineering', 'Human Resources', 'Market Research', 'Event & Community'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 bg-[#070e24] text-white min-h-[calc(100vh-65px)]">
      {/* East Africa Regional Notice Banner */}
      <div className="bg-gradient-to-r from-blue-900/80 via-[#0d2156] to-blue-950 border border-blue-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500 text-white shadow-xs">
                East Africa Region Only
              </span>
              <span className="text-xs font-bold text-blue-200">
                East African Community (EAC) & Horn of Africa
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">
              Field Intelligence & Survey Platform for East Africa
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Tailored exclusively for organizations, fintechs, SACCOs, and agricultural teams operating in{' '}
              <strong className="text-white font-bold">Kenya, Tanzania, Uganda, Rwanda, Ethiopia, Burundi, and South Sudan.</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onOpenPlayStoreModal && (
            <button
              onClick={onOpenPlayStoreModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-blue-200 bg-blue-950/80 hover:bg-blue-900 rounded-xl border border-blue-500/40 shadow-md transition-all whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current text-blue-400" />
              <span>Publish to Google Play</span>
            </button>
          )}

          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all border border-blue-400/30 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate EA Survey</span>
          </button>
        </div>
      </div>

      {/* Top Workspace KPI strip (Tabular Figures per §2.B, Bold Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0c183a] border border-blue-900/60 rounded-2xl shadow-md">
          <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            Active Questionnaires
          </div>
          <div className="text-3xl font-black font-mono tabular-nums text-white">
            {activeSurveysCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Collecting live regional responses
          </div>
        </div>

        <div className="p-5 bg-[#0c183a] border border-blue-900/60 rounded-2xl shadow-md">
          <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            Total Submissions
          </div>
          <div className="text-3xl font-black font-mono tabular-nums text-blue-400">
            {totalSubmissions}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Verified East African respondents
          </div>
        </div>

        <div className="p-5 bg-[#0c183a] border border-blue-900/60 rounded-2xl shadow-md">
          <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            Average Completion
          </div>
          <div className="text-3xl font-black font-mono tabular-nums text-emerald-400">
            89.4%
          </div>
          <div className="text-[11px] font-semibold text-emerald-300 mt-1">
            Optimized for mobile & low-bandwidth
          </div>
        </div>

        <div className="p-5 bg-[#0c183a] border border-blue-900/60 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
              Curated EA Templates
            </div>
            <div className="text-xs font-bold text-white mt-0.5">
              Mobile Money, SACCO, & Agri-yield
            </div>
          </div>
          <button
            onClick={onOpenTemplates}
            className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold text-blue-300 bg-blue-900/50 hover:bg-blue-800/80 border border-blue-700/50 rounded-xl transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Browse Templates</span>
          </button>
        </div>
      </div>

      {/* Control & Filter Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Status Filter Tabs (Segmented control per §1.A) */}
        <div className="flex items-center gap-1 p-1 bg-[#09122c] border border-blue-900/60 rounded-xl max-w-fit">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All Surveys ({surveys.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Active ({surveys.filter((s) => s.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'draft'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Drafts ({surveys.filter((s) => s.status === 'draft').length})
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'closed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Closed ({surveys.filter((s) => s.status === 'closed').length})
          </button>
        </div>

        {/* Right Search & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-blue-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search East Africa surveys..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0c183a] border border-blue-900/60 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold bg-[#0c183a] border border-blue-900/60 rounded-xl text-white focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#0c183a] text-white">
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <button
            onClick={onNewSurvey}
            className="px-4 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap border border-blue-400/40"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Survey</span>
          </button>
        </div>
      </div>

      {/* Surveys Grid */}
      {filteredSurveys.length === 0 ? (
        <div className="p-12 text-center bg-[#0c183a] border border-blue-900/60 rounded-2xl space-y-4">
          <Layers className="w-10 h-10 text-blue-400 mx-auto" />
          <div>
            <h3 className="text-base font-extrabold text-white">
              No East African surveys found
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Adjust your search keywords or create a new field questionnaire tailored for East Africa.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={onNewSurvey}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
            >
              Create New Survey
            </button>
            <button
              onClick={() => {
                resetToSampleData();
                onRefreshData();
              }}
              className="px-4 py-2 text-xs font-bold text-blue-200 bg-blue-950/70 hover:bg-blue-900 rounded-xl transition-colors flex items-center gap-1.5 border border-blue-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload East Africa Data</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSurveys.map((survey) => {
            const responsesCount = responsesMap[survey.id]?.length || 0;
            const isMenuOpen = openMenuSurveyId === survey.id;

            return (
              <div
                key={survey.id}
                className="bg-[#0c183a] border border-blue-900/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/50 transition-all group relative"
              >
                <div>
                  {/* Top Header Strip: Unboxed metadata */}
                  <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
                    <div className="flex items-center gap-1.5 truncate font-semibold">
                      <span>{survey.category}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`capitalize font-bold ${
                          survey.status === 'active'
                            ? 'text-emerald-400'
                            : survey.status === 'closed'
                            ? 'text-slate-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {survey.status}
                      </span>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuSurveyId(isMenuOpen ? null : survey.id)}
                        className="p-1 text-slate-400 hover:text-white rounded-md"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          onMouseLeave={() => setOpenMenuSurveyId(null)}
                          className="absolute right-0 top-6 z-20 w-44 bg-[#0a1432] rounded-xl border border-blue-800 shadow-2xl py-1 text-xs"
                        >
                          <button
                            onClick={() => {
                              setOpenMenuSurveyId(null);
                              onOpenShareModal(survey);
                            }}
                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-blue-900/60 flex items-center gap-2 font-semibold"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share / Embed</span>
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuSurveyId(null);
                              onDuplicateSurvey(survey.id);
                            }}
                            className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-blue-900/60 flex items-center gap-2 font-semibold"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuSurveyId(null);
                              onDeleteSurvey(survey.id);
                            }}
                            className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-950/40 flex items-center gap-2 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Description (Bold Title per user request) */}
                  <h3
                    onClick={() => onSelectSurveyToEdit(survey)}
                    className="text-base font-extrabold text-white hover:text-blue-300 transition-colors cursor-pointer line-clamp-1 tracking-tight"
                  >
                    {survey.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {survey.description}
                  </p>
                </div>

                {/* Bottom Metrics & Actions */}
                <div className="pt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-blue-900/40">
                    <span className="font-mono tabular-nums font-bold">
                      <strong className="text-white font-extrabold">
                        {responsesCount}
                      </strong>{' '}
                      submissions
                    </span>
                    <span className="font-semibold text-blue-200">{survey.questions.length} questions</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => onOpenResponder(survey.id)}
                      className="py-1.5 px-2 text-xs font-bold text-slate-200 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 rounded-xl transition-colors flex items-center justify-center gap-1"
                      title="Take / Fill out survey"
                    >
                      <ExternalLink className="w-3 h-3 text-blue-300" />
                      <span>Take</span>
                    </button>

                    <button
                      onClick={() => onSelectSurveyToEdit(survey)}
                      className="py-1.5 px-2 text-xs font-bold text-slate-200 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 rounded-xl transition-colors flex items-center justify-center gap-1"
                      title="Edit questions and logic"
                    >
                      <Edit3 className="w-3 h-3 text-blue-300" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onSelectSurveyAnalytics(survey)}
                      className="py-1.5 px-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
                      title="View responses & AI insights"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Insights</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer utility bar */}
      <div className="pt-6 border-t border-blue-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/80 gap-3">
        <span className="font-bold flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span>PulseForm East Africa · Restricted to EAC Member States & Regional Partners</span>
        </span>
        <button
          onClick={() => {
            resetToSampleData();
            onRefreshData();
          }}
          className="text-blue-300 hover:text-white flex items-center gap-1 transition-colors font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reload Sample Responses</span>
        </button>
      </div>
    </div>
  );
};
