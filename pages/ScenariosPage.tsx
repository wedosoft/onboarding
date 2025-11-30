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
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            학습할 카테고리를 선택하세요
          </h2>
          <p className="text-slate-400">
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
                className="glass-card rounded-xl p-6 text-left hover:bg-white/5 transition-all border border-white/5 hover:border-banana-500/30 group"
              >
                <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-banana-500/10 transition-colors">
                  <i className={`${category.icon} text-2xl text-slate-400 group-hover:text-banana-400 transition-colors`} />
                </div>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-banana-200 transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {completedCount} / {categoryScenarios.length} 완료
                  </span>
                  <span className="font-bold text-banana-400">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-banana-500 h-1.5 rounded-full transition-all shadow-[0_0_5px_rgba(255,192,0,0.5)]"
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
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-banana-400 via-yellow-300 to-banana-600"></div>
          <div className="w-24 h-24 bg-banana-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-banana-500/20 shadow-[0_0_30px_rgba(255,192,0,0.2)]">
            <i className="fas fa-trophy text-5xl text-banana-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            축하합니다!
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            <strong className="text-banana-300">{categoryName}</strong> 카테고리의 모든 시나리오를 완료했습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleBackToCategories}
              className="px-8 py-3 bg-banana-500 hover:bg-banana-400 text-dark-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-banana-500/50"
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-2 text-slate-400 hover:text-banana-400 transition-colors"
          >
            <i className="fas fa-arrow-left" />
            <span>카테고리 선택</span>
          </button>
          <span className="text-sm text-slate-500 font-mono">
            {currentScenarioIndex + 1} / {activeScenarios.length}
          </span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-banana-500 h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,192,0,0.5)]"
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
