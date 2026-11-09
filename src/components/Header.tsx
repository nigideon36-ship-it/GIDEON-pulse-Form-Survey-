import React from 'react';
import { Plus, Sun, Moon, LayoutDashboard, FileText, BarChart3, Globe, Play } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: 'surveys' | 'templates' | 'analytics';
  onTabChange: (tab: 'surveys' | 'templates' | 'analytics') => void;
  onNewSurvey: () => void;
  onOpenPlayStoreModal?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onNewSurvey,
  onOpenPlayStoreModal,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-900/50 bg-[#0a1538]/95 backdrop-blur-md text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element, bold) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm border border-blue-400/30">
            P
          </div>
          <button
            onClick={() => onTabChange('surveys')}
            className="text-lg font-extrabold tracking-tight text-white hover:text-blue-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span>PulseForm East Africa</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 uppercase tracking-widest hidden sm:inline">
              EAC Edition
            </span>
          </button>
        </div>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-bold">
          <button
            onClick={() => onTabChange('surveys')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'surveys'
                ? 'text-blue-400 font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Surveys</span>
          </button>

          <button
            onClick={() => onTabChange('templates')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'templates'
                ? 'text-blue-400 font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'analytics'
                ? 'text-blue-400 font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-blue-300/80 text-xs font-semibold whitespace-nowrap shrink-0">
            <Globe className="w-3.5 h-3.5" />
            <span>KE · TZ · UG · RW · ET · BI · SS</span>
          </div>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <PWAInstallButton />

          {onOpenPlayStoreModal && (
            <button
              onClick={onOpenPlayStoreModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-blue-200 bg-blue-950/80 hover:bg-blue-900 rounded-lg border border-blue-700/60 transition-colors shadow-xs"
              title="Google Play Store Publishing Guide & Packages"
            >
              <Play className="w-3.5 h-3.5 fill-current text-blue-400" />
              <span className="hidden sm:inline">Google Play</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-blue-900/50 transition-colors shrink-0"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-200" />}
          </button>

          <button
            onClick={onNewSurvey}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-md transition-all whitespace-nowrap shrink-0 border border-blue-400/40"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Survey</span>
          </button>
        </div>
      </div>
    </header>
  );
};
