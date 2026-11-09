import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SurveyBuilder } from './components/SurveyBuilder/SurveyBuilder';
import { SurveyAnalytics } from './components/SurveyAnalytics/SurveyAnalytics';
import { SurveyResponder } from './components/SurveyResponder/SurveyResponder';
import { ShareModal } from './components/ShareModal';
import { TemplatesModal } from './components/TemplatesModal';
import { AIGeneratorModal } from './components/SurveyBuilder/AIGeneratorModal';
import { PublishPlayStoreModal } from './components/PublishPlayStoreModal';
import { Survey } from './types/survey';
import {
  getSurveys,
  getSurvey,
  saveSurvey,
  deleteSurvey,
  duplicateSurvey,
  initializeStorage,
} from './services/storage';

export default function App() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder' | 'analytics' | 'responder'>('dashboard');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [responderSurveyId, setResponderSurveyId] = useState<string | null>(null);

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isPlayStoreOpen, setIsPlayStoreOpen] = useState(false);
  const [shareSurvey, setShareSurvey] = useState<Survey | null>(null);

  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('pulseform_theme') === 'dark' ||
        (!localStorage.getItem('pulseform_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pulseform_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pulseform_theme', 'light');
    }
  }, [isDark]);

  // Initial load
  const reloadSurveys = () => {
    initializeStorage();
    const list = getSurveys();
    setSurveys(list);
  };

  useEffect(() => {
    reloadSurveys();

    // Check if URL has ?survey=ID parameter
    const params = new URLSearchParams(window.location.search);
    const surveyParam = params.get('survey');
    if (surveyParam) {
      setResponderSurveyId(surveyParam);
      setCurrentView('responder');
    }
  }, []);

  // Handlers
  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleNewSurvey = () => {
    const newSurvey: Survey = {
      id: `survey-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: 'East Africa Community Field Survey',
      description: 'Operations, service delivery, and merchant experience survey across East Africa partner states.',
      category: 'Customer Experience',
      status: 'draft',
      theme: {
        primaryColor: '#2563eb',
        mode: 'card_step',
        fontFamily: 'sans',
        borderRadius: 'rounded-xl',
        showProgress: true,
      },
      settings: {
        allowAnonymous: false,
        requireEmail: true,
        collectName: true,
        customThankYouTitle: 'Asante Sana! (Thank You for Your Feedback)',
        customThankYouMessage: 'Your responses have been recorded in the East Africa pulse repository.',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: `q_${Date.now()}_1`,
          type: 'multiple_choice',
          title: 'Which East Africa country is your primary base of operation?',
          required: true,
          options: [
            'Kenya (Nairobi / Mombasa / Kisumu / Rift)',
            'Tanzania (Dar es Salaam / Arusha / Mwanza)',
            'Uganda (Kampala / Entebbe / Jinja)',
            'Rwanda (Kigali / Musanze / Rubavu)',
            'Other EAC State (Ethiopia / Burundi / South Sudan)'
          ],
        },
        {
          id: `q_${Date.now()}_2`,
          type: 'rating',
          title: 'How satisfied are you with digital payment settlement speed (M-Pesa, Airtel Money, MTN MoMo)?',
          required: true,
          minRating: 1,
          maxRating: 5,
          ratingShape: 'star',
        },
        {
          id: `q_${Date.now()}_3`,
          type: 'long_text',
          title: 'What critical operational enhancement would most accelerate your business across East Africa?',
          required: false,
        },
      ],
    };

    saveSurvey(newSurvey);
    reloadSurveys();
    setSelectedSurvey(newSurvey);
    setCurrentView('builder');
  };

  const handleSelectSurveyToEdit = (survey: Survey) => {
    setSelectedSurvey(survey);
    setCurrentView('builder');
  };

  const handleSelectSurveyAnalytics = (survey: Survey) => {
    setSelectedSurvey(survey);
    setCurrentView('analytics');
  };

  const handleOpenResponder = (surveyId: string) => {
    setResponderSurveyId(surveyId);
    setCurrentView('responder');
  };

  const handleDuplicateSurvey = (surveyId: string) => {
    duplicateSurvey(surveyId);
    reloadSurveys();
  };

  const handleDeleteSurvey = (surveyId: string) => {
    deleteSurvey(surveyId);
    reloadSurveys();
  };

  const handleSaveSurvey = (survey: Survey) => {
    saveSurvey(survey);
    reloadSurveys();
    setSelectedSurvey(survey);
  };

  const handleSelectTemplate = (templateData: Partial<Survey>) => {
    const newSurvey: Survey = {
      id: `survey-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: templateData.title || 'New Survey',
      description: templateData.description || '',
      category: templateData.category || 'Customer Experience',
      status: 'active',
      theme: templateData.theme || {
        primaryColor: '#2563eb',
        mode: 'card_step',
        fontFamily: 'sans',
        borderRadius: 'rounded-xl',
        showProgress: true,
      },
      settings: templateData.settings || {
        allowAnonymous: false,
        requireEmail: true,
        collectName: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: templateData.questions || [],
    };

    saveSurvey(newSurvey);
    reloadSurveys();
    setSelectedSurvey(newSurvey);
    setCurrentView('builder');
  };

  const handleApplyAIGeneratedSurvey = (generatedData: Partial<Survey>) => {
    const newSurvey: Survey = {
      id: `survey-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: generatedData.title || 'AI Generated Survey',
      description: generatedData.description || '',
      category: generatedData.category || 'Customer Experience',
      status: 'active',
      theme: {
        primaryColor: '#2563eb',
        mode: 'card_step',
        fontFamily: 'sans',
        borderRadius: 'rounded-xl',
        showProgress: true,
      },
      settings: {
        allowAnonymous: false,
        requireEmail: true,
        collectName: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: generatedData.questions || [],
    };

    saveSurvey(newSurvey);
    reloadSurveys();
    setSelectedSurvey(newSurvey);
    setCurrentView('builder');
  };

  // Find active survey for responder mode
  const activeResponderSurvey = responderSurveyId
    ? getSurvey(responderSurveyId) || surveys.find((s) => s.id === responderSurveyId)
    : null;

  return (
    <div className="min-h-screen bg-[#070e24] text-white flex flex-col font-sans transition-colors">
      {/* If taking a survey in responder mode, optionally show a subtle exit bar */}
      {currentView === 'responder' && activeResponderSurvey ? (
        <div className="relative">
          <div className="bg-[#091330] text-blue-200 text-xs px-6 py-2.5 flex items-center justify-between border-b border-blue-900/60 font-semibold shadow-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <strong className="text-white font-extrabold">PulseForm East Africa</strong>
              <span className="text-blue-300">· {activeResponderSurvey.title}</span>
            </span>
            <button
              onClick={() => {
                // Clear query string and go to dashboard
                if (window.history.pushState) {
                  const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname;
                  window.history.pushState({ path: newurl }, '', newurl);
                }
                setCurrentView('dashboard');
              }}
              className="text-xs text-blue-300 hover:text-white underline font-bold"
            >
              Return to Workspace
            </button>
          </div>
          <SurveyResponder
            survey={activeResponderSurvey}
            onFinish={() => {
              setSelectedSurvey(activeResponderSurvey);
              setCurrentView('analytics');
            }}
          />
        </div>
      ) : currentView === 'builder' && selectedSurvey ? (
        <SurveyBuilder
          initialSurvey={selectedSurvey}
          onSave={handleSaveSurvey}
          onBack={() => {
            reloadSurveys();
            setCurrentView('dashboard');
          }}
        />
      ) : currentView === 'analytics' && selectedSurvey ? (
        <SurveyAnalytics
          survey={selectedSurvey}
          onBack={() => {
            reloadSurveys();
            setCurrentView('dashboard');
          }}
        />
      ) : (
        /* Standard Workspace Views (Dashboard / Templates / Analytics hub) */
        <>
          <Header
            currentTab={
              currentView === 'dashboard'
                ? 'surveys'
                : 'surveys'
            }
            onTabChange={(tab) => {
              if (tab === 'surveys') {
                setCurrentView('dashboard');
              } else if (tab === 'templates') {
                setIsTemplatesOpen(true);
              } else if (tab === 'analytics') {
                if (surveys.length > 0) {
                  setSelectedSurvey(surveys[0]);
                  setCurrentView('analytics');
                }
              }
            }}
            onNewSurvey={handleNewSurvey}
            onOpenPlayStoreModal={() => setIsPlayStoreOpen(true)}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
          />

          <main className="flex-1">
            <DashboardView
              surveys={surveys}
              onSelectSurveyToEdit={handleSelectSurveyToEdit}
              onSelectSurveyAnalytics={handleSelectSurveyAnalytics}
              onOpenResponder={handleOpenResponder}
              onOpenShareModal={(s) => setShareSurvey(s)}
              onDuplicateSurvey={handleDuplicateSurvey}
              onDeleteSurvey={handleDeleteSurvey}
              onOpenTemplates={() => setIsTemplatesOpen(true)}
              onOpenAIGenerator={() => setIsAIOpen(true)}
              onOpenPlayStoreModal={() => setIsPlayStoreOpen(true)}
              onNewSurvey={handleNewSurvey}
              onRefreshData={reloadSurveys}
            />
          </main>
        </>
      )}

      {/* Global Share Modal */}
      {shareSurvey && (
        <ShareModal
          survey={shareSurvey}
          isOpen={!!shareSurvey}
          onClose={() => setShareSurvey(null)}
          onOpenResponder={(id) => {
            setShareSurvey(null);
            handleOpenResponder(id);
          }}
        />
      )}

      {/* Global Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Global AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onApplyGeneratedSurvey={handleApplyAIGeneratedSurvey}
      />

      {/* Google Play Store Publishing Modal */}
      <PublishPlayStoreModal
        isOpen={isPlayStoreOpen}
        onClose={() => setIsPlayStoreOpen(false)}
      />
    </div>
  );
}
