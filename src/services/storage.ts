import { Survey, SurveyResponse } from '../types/survey';
import { SAMPLE_SURVEYS, SAMPLE_RESPONSES } from '../data/sampleSurveys';

const STORAGE_KEY_SURVEYS = 'pulseform_surveys_v1';
const STORAGE_KEY_RESPONSES = 'pulseform_responses_v1';

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;

  const existingSurveys = localStorage.getItem(STORAGE_KEY_SURVEYS);
  if (!existingSurveys) {
    localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(SAMPLE_SURVEYS));
  }

  const existingResponses = localStorage.getItem(STORAGE_KEY_RESPONSES);
  if (!existingResponses) {
    localStorage.setItem(STORAGE_KEY_RESPONSES, JSON.stringify(SAMPLE_RESPONSES));
  }
}

export function getSurveys(): Survey[] {
  if (typeof window === 'undefined') return SAMPLE_SURVEYS;
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SURVEYS);
    return raw ? JSON.parse(raw) : SAMPLE_SURVEYS;
  } catch (e) {
    console.error('Failed to parse surveys from localStorage:', e);
    return SAMPLE_SURVEYS;
  }
}

export function getSurvey(id: string): Survey | undefined {
  const surveys = getSurveys();
  return surveys.find((s) => s.id === id);
}

export function saveSurvey(survey: Survey): void {
  if (typeof window === 'undefined') return;
  const surveys = getSurveys();
  const index = surveys.findIndex((s) => s.id === survey.id);

  const updatedSurvey: Survey = {
    ...survey,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    surveys[index] = updatedSurvey;
  } else {
    surveys.unshift(updatedSurvey);
  }

  localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(surveys));
}

export function deleteSurvey(id: string): void {
  if (typeof window === 'undefined') return;
  const surveys = getSurveys().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(surveys));

  // Also remove responses for this survey
  const allResponses = getAllResponsesMap();
  delete allResponses[id];
  localStorage.setItem(STORAGE_KEY_RESPONSES, JSON.stringify(allResponses));
}

export function duplicateSurvey(id: string): Survey | null {
  const source = getSurvey(id);
  if (!source) return null;

  const newSurvey: Survey = {
    ...JSON.parse(JSON.stringify(source)),
    id: `survey-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `${source.title} (Copy)`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveSurvey(newSurvey);
  return newSurvey;
}

export function getAllResponsesMap(): Record<string, SurveyResponse[]> {
  if (typeof window === 'undefined') return SAMPLE_RESPONSES;
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESPONSES);
    return raw ? JSON.parse(raw) : SAMPLE_RESPONSES;
  } catch (e) {
    console.error('Failed to parse responses from localStorage:', e);
    return SAMPLE_RESPONSES;
  }
}

export function getResponses(surveyId: string): SurveyResponse[] {
  const map = getAllResponsesMap();
  return map[surveyId] || [];
}

export function saveResponse(
  surveyId: string,
  response: Omit<SurveyResponse, 'id' | 'submittedAt' | 'surveyId'> & { id?: string; surveyId?: string }
): SurveyResponse {
  if (typeof window === 'undefined') {
    return {
      ...response,
      id: `resp-${Date.now()}`,
      surveyId,
      submittedAt: new Date().toISOString(),
    };
  }

  const map = getAllResponsesMap();
  const surveyResponses = map[surveyId] || [];

  const newResponse: SurveyResponse = {
    ...response,
    id: response.id || `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    surveyId,
    submittedAt: new Date().toISOString(),
  };

  surveyResponses.unshift(newResponse);
  map[surveyId] = surveyResponses;
  localStorage.setItem(STORAGE_KEY_RESPONSES, JSON.stringify(map));

  return newResponse;
}

export function deleteResponse(surveyId: string, responseId: string): void {
  if (typeof window === 'undefined') return;
  const map = getAllResponsesMap();
  if (map[surveyId]) {
    map[surveyId] = map[surveyId].filter((r) => r.id !== responseId);
    localStorage.setItem(STORAGE_KEY_RESPONSES, JSON.stringify(map));
  }
}

export function resetToSampleData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(SAMPLE_SURVEYS));
  localStorage.setItem(STORAGE_KEY_RESPONSES, JSON.stringify(SAMPLE_RESPONSES));
}
