import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, SCENARIOS } from '../constants';
import { Scenario, Choice, FeedbackData } from '../types';
import { getFeedbackStream, getFollowUpAnswerStream, initializeMentorSession } from '../services/geminiService';
import ScenarioCard from '../components/ScenarioCard';
import FeedbackModal from '../components/FeedbackModal';
import { getProgress } from '../services/apiClient';

const ScenariosPage: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || '신입사원';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeScenarios, setActiveScenarios] = useState<Scenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({ feedback: '', followUpQuestions: [] });
  const [isFeedbackContentLoading, setIsFeedbackContentLoading] = useState(false);
  const [isFeedbackStreaming, setIsFeedbackStreaming] = useState(false);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedScenarioIds, setCompletedScenarioIds] = useState<Set<string>>(new Set());

  const currentScenario = activeScenarios[currentScenarioIndex];

  // 진행도 로드
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const sessionId = localStorage.getItem('onboarding_session_id');
        if (sessionId) {
          const data = await getProgress(sessionId);
          const completedIds = new Set(data.completedScenarios?.map((c: { scenarioId: string }) => c.scenarioId) || []);
          setCompletedScenarioIds(completedIds);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };
    loadProgress();
  }, []);

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    const filtered = SCENARIOS.filter(s => s.category === categoryId);
    setActiveScenarios(filtered);
    setCurrentScenarioIndex(0);
    setIsCompleted(false);

    // Initialize mentor session
    await initializeMentorSession(userName);
  };

  const handleChoiceSelect = useCallback(async (choice: Choice) => {
    if (!currentScenario) return;

    setSelectedChoice(choice);
    setFeedbackData({ feedback: '', followUpQuestions: [] });
    setIsFeedbackContentLoading(true);
    setIsFeedbackStreaming(true);
    setIsFeedbackVisible(true);

    try {
      const stream = await getFeedbackStream(currentScenario, choice);
      let feedbackText = '';
      let questionsBuffer = '';
      let separatorFound = false;
      const separator = '%%%QUESTIONS%%%';
      let isFirstChunk = true;

      for await (const chunk of stream) {
        if (isFirstChunk) {
          setIsFeedbackContentLoading(false);
          isFirstChunk = false;
        }

        const chunkText = chunk.text;

        if (separatorFound) {
          questionsBuffer += chunkText;
        } else {
          if (chunkText.includes(separator)) {
            separatorFound = true;
            const parts = chunkText.split(separator);
            feedbackText += parts[0];
            questionsBuffer += parts[1];
            setFeedbackData(prev => ({ ...prev, feedback: feedbackText }));
          } else {
            feedbackText += chunkText;
            setFeedbackData(prev => ({ ...prev, feedback: feedbackText }));
          }
        }
      }

      if (questionsBuffer) {
        const questions = questionsBuffer.trim().split('\n').filter(q => q.trim());
        setFeedbackData(prev => ({ ...prev, followUpQuestions: questions }));
      }

      if (isFirstChunk) {
        setIsFeedbackContentLoading(false);
      }

    } catch (error) {
      console.error(error);
      setFeedbackData({
        feedback: '죄송합니다, 피드백을 받는 중 오류가 발생했습니다.',
        followUpQuestions: []
      });
      setIsFeedbackContentLoading(false);
    } finally {
      setIsFeedbackStreaming(false);
    }
  }, [currentScenario]);

  const handleNextScenario = () => {
    // 완료된 시나리오 추가
    if (currentScenario) {
      setCompletedScenarioIds(prev => new Set([...prev, currentScenario.id]));
    }

    setIsFeedbackVisible(false);
    setSelectedChoice(null);
    setFeedbackData({ feedback: '', followUpQuestions: [] });

    if (currentScenarioIndex < activeScenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleFollowUpQuestion = useCallback(async (question: string) => {
    if (!currentScenario || isFollowUpLoading) return;

    setIsFollowUpLoading(true);
    const questionHeader = `\n\n---\n\n### "${question}"에 대한 답변\n\n`;
    setFeedbackData(prev => ({
      ...prev,
      feedback: prev.feedback + questionHeader,
      followUpQuestions: [],
    }));

    try {
      const stream = await getFollowUpAnswerStream(currentScenario, feedbackData.feedback, question);
      let answerText = '';
      for await (const chunk of stream) {
        answerText += chunk.text;
        setFeedbackData(prev => ({
          ...prev,
          feedback: prev.feedback.substring(0, prev.feedback.length - answerText.length) + answerText
        }));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = `죄송합니다. 추가 답변을 생성하는 중 오류가 발생했습니다.`;
      setFeedbackData(prev => ({
        ...prev,
        feedback: prev.feedback + errorMessage,
      }));
    } finally {
      setIsFollowUpLoading(false);
    }
  }, [currentScenario, feedbackData.feedback, isFollowUpLoading]);

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setActiveScenarios([]);
    setCurrentScenarioIndex(0);
    setIsCompleted(false);
  };

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            학습할 카테고리를 선택하세요
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            각 카테고리별로 실무에서 마주할 수 있는 시나리오를 학습합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map(category => {
            const categoryScenarios = SCENARIOS.filter(s => s.category === category.id);
            const completedCount = categoryScenarios.filter(s => completedScenarioIds.has(s.id)).length;
            const progress = Math.round((completedCount / categoryScenarios.length) * 100);

            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 text-left shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-sky-300 dark:hover:border-sky-600"
              >
                <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900 rounded-xl flex items-center justify-center mb-4">
                  <i className={`${category.icon} text-2xl text-sky-600 dark:text-sky-400`} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    {completedCount} / {categoryScenarios.length} 완료
                  </span>
                  <span className="font-medium text-sky-600 dark:text-sky-400">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-sky-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Completion view
  if (isCompleted) {
    const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || '';
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-trophy text-4xl text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            축하합니다!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            <strong>{categoryName}</strong> 카테고리의 모든 시나리오를 완료했습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleBackToCategories}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
            >
              다른 카테고리 학습하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Scenario learning view
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            <i className="fas fa-arrow-left" />
            <span>카테고리 선택</span>
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {currentScenarioIndex + 1} / {activeScenarios.length}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-sky-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentScenarioIndex + 1) / activeScenarios.length) * 100}%` }}
          />
        </div>
      </div>

      {currentScenario && (
        <ScenarioCard
          scenario={currentScenario}
          onSelectChoice={handleChoiceSelect}
          isLoading={isFeedbackStreaming}
          selectedChoiceId={selectedChoice?.id ?? null}
        />
      )}

      {isFeedbackVisible && (
        <FeedbackModal
          isOpen={isFeedbackVisible}
          onClose={() => setIsFeedbackVisible(false)}
          feedbackData={feedbackData}
          onNext={handleNextScenario}
          isLoading={isFeedbackContentLoading}
          onFollowUpQuestion={handleFollowUpQuestion}
          isFollowUpLoading={isFollowUpLoading}
          isStreaming={isFeedbackStreaming}
        />
      )}
    </div>
  );
};

export default ScenariosPage;
