import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SCENARIOS } from '../constants';
import { Scenario, Choice, FeedbackData } from '../types';
import { getFeedbackStream, initializeMentorSession } from '../services/geminiService';
import ScenarioCard from '../components/ScenarioCard';
import FeedbackModal from '../components/FeedbackModal';

// 업무 센스 체크용 시나리오 (모든 카테고리에서 랜덤하게 선택)
const ASSESSMENT_SCENARIO_COUNT = 5;

const WorkSenseAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || '신입사원';

  const [assessmentScenarios, setAssessmentScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({ feedback: '', followUpQuestions: [] });
  const [isFeedbackContentLoading, setIsFeedbackContentLoading] = useState(false);
  const [isFeedbackStreaming, setIsFeedbackStreaming] = useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const currentScenario = assessmentScenarios[currentIndex];

  // 평가용 시나리오 초기화
  useEffect(() => {
    const initAssessment = async () => {
      // 랜덤하게 시나리오 선택
      const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, ASSESSMENT_SCENARIO_COUNT);
      setAssessmentScenarios(selected);

      // 멘토 세션 초기화
      await initializeMentorSession(userName);
      setIsInitialized(true);
    };

    initAssessment();
  }, [userName]);

  const handleChoiceSelect = useCallback(async (choice: Choice) => {
    if (!currentScenario) return;

    setSelectedChoice(choice);
    setFeedbackData({ feedback: '', followUpQuestions: [] });
    setIsFeedbackContentLoading(true);
    setIsFeedbackStreaming(true);
    setIsFeedbackVisible(true);

    // 점수 계산 (isCorrect가 true인 선택지를 고르면 점수 획득)
    if (choice.isCorrect) {
      setScore(prev => prev + 1);
    }

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

  const handleNext = () => {
    setIsFeedbackVisible(false);
    setSelectedChoice(null);
    setFeedbackData({ feedback: '', followUpQuestions: [] });

    if (currentIndex < assessmentScenarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleFollowUpQuestion = useCallback(async (question: string) => {
    // 평가 모드에서는 후속 질문 비활성화
  }, []);

  const scorePercent = Math.round((score / ASSESSMENT_SCENARIO_COUNT) * 100);
  const isPassed = scorePercent >= 80;

  if (!isInitialized) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">평가를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 완료 화면
  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${isPassed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}></div>

          <div className={`w-24 h-24 ${isPassed ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'} rounded-full flex items-center justify-center mx-auto mb-6 border shadow-lg`}>
            <i className={`fas ${isPassed ? 'fa-trophy text-green-500' : 'fa-redo text-orange-500'} text-5xl`} />
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {isPassed ? '축하합니다!' : '아쉽네요!'}
          </h2>

          <p className="text-slate-600 mb-6 text-lg">
            업무 센스 체크를 완료했습니다.
          </p>

          {/* 점수 표시 */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
            <div className="text-5xl font-bold text-primary-500 mb-2">
              {scorePercent}%
            </div>
            <p className="text-slate-500">
              {ASSESSMENT_SCENARIO_COUNT}문제 중 {score}문제 정답
            </p>
            <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
              <div
                className={`h-3 rounded-full transition-all ${isPassed ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              통과 기준: 80% 이상
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/assessment')}
              className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
            >
              목록으로
            </button>
            {!isPassed && (
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/50"
              >
                다시 도전하기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/assessment')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors mb-4"
        >
          <i className="fas fa-arrow-left" />
          <span>평가 목록</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-700 mb-2">업무 센스 체크</h1>
        <p className="text-slate-500 text-sm">
          실제 업무 상황에서의 판단력을 평가합니다.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">진행률</span>
          <span className="text-sm text-slate-500 font-mono">
            {currentIndex + 1} / {assessmentScenarios.length}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(90,142,192,0.5)]"
            style={{ width: `${((currentIndex + 1) / assessmentScenarios.length) * 100}%` }}
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
          onNext={handleNext}
          isLoading={isFeedbackContentLoading}
          onFollowUpQuestion={handleFollowUpQuestion}
          isFollowUpLoading={false}
          isStreaming={isFeedbackStreaming}
        />
      )}
    </div>
  );
};

export default WorkSenseAssessmentPage;
