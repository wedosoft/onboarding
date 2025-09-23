import React, { useState, useCallback } from 'react';
import { Scenario, Choice, ChatMessage, FeedbackData } from './types';
import { SCENARIOS, CATEGORIES } from './constants';
import { getFeedback, getChatResponse, getFollowUpAnswer, initializeMentorSession } from './services/geminiService';
import Header from './components/Header';
import ScenarioCard from './components/ScenarioCard';
import FeedbackModal from './components/FeedbackModal';
import CompletionScreen from './components/CompletionScreen';
import Chatbot from './components/Chatbot';
import Landing from './components/Landing';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [activeScenarios, setActiveScenarios] = useState<Scenario[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({ feedback: '', followUpQuestions: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const currentScenario = activeScenarios[currentScenarioIndex];

  const handleStart = (name: string, categoryId: string) => {
    setUserName(name);
    
    const categoryInfo = CATEGORIES.find(c => c.id === categoryId);
    if (categoryInfo) {
      setSelectedCategoryName(categoryInfo.name);
    }

    const filteredScenarios = SCENARIOS.filter(s => s.category === categoryId);
    setActiveScenarios(filteredScenarios);

    // Reset scenario progress
    setCurrentScenarioIndex(0);
    setSelectedChoice(null);
    setFeedbackData({ feedback: '', followUpQuestions: [] });
    setIsFeedbackVisible(false);
    setIsCompleted(false);

    // Initialize AI Mentor session
    initializeMentorSession(name);
    setChatHistory([
        { role: 'model', content: `안녕하세요, ${name}님! 저는 당신의 AI 시니어 멘토 '온보딩 나침반'입니다. 무엇이든 물어보세요.` }
    ]);
  };

  const handleChoiceSelect = useCallback(async (choice: Choice) => {
    if (!currentScenario) return;

    setIsLoading(true);
    setSelectedChoice(choice);
    setFeedbackData({ feedback: '', followUpQuestions: [] });

    try {
      const aiFeedback = await getFeedback(currentScenario, choice);
      setFeedbackData(aiFeedback);
    } catch (error) {
      console.error(error);
      setFeedbackData({ 
        feedback: '죄송합니다, 피드백을 받는 중 오류가 발생했습니다. 다시 시도해 주세요.', 
        followUpQuestions: [] 
      });
    } finally {
      setIsLoading(false);
      setIsFeedbackVisible(true);
    }
  }, [currentScenario]);

  const handleNextScenario = () => {
    setIsFeedbackVisible(false);
    setSelectedChoice(null);
    setFeedbackData({ feedback: '', followUpQuestions: [] });
    if (currentScenarioIndex < activeScenarios.length - 1) {
      setCurrentScenarioIndex(prevIndex => prevIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };
  
  const handleFollowUpQuestion = useCallback(async (question: string) => {
    if (!currentScenario) return;

    setIsFollowUpLoading(true);
    setFeedbackData(prev => ({ ...prev, followUpQuestions: [] }));

    try {
      const aiAnswer = await getFollowUpAnswer(currentScenario, feedbackData.feedback, question);
      setFeedbackData(prev => ({
        ...prev,
        feedback: `### "${question}"에 대한 답변\n\n${aiAnswer}`,
      }));
    } catch (error) {
      console.error(error);
      setFeedbackData(prev => ({
        ...prev,
        feedback: `### "${question}"에 대한 답변\n\n---\n\n죄송합니다. 추가 답변을 생성하는 중 오류가 발생했습니다.`,
      }));
    } finally {
      setIsFollowUpLoading(false);
    }
  }, [currentScenario, feedbackData.feedback]);

  const handleRestart = () => {
    setUserName(null);
    setActiveScenarios([]);
    setSelectedCategoryName('');
    setIsCompleted(false);
    setCurrentScenarioIndex(0);
    setChatHistory([]);
  };

  const handleSendMessage = useCallback(async (message: string) => {
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setIsChatLoading(true);

    try {
      const aiResponse = await getChatResponse(message);
      setChatHistory(prev => [...prev, { role: 'model', content: aiResponse }]);
    } catch (error) {
      console.error(error);
      const errorMessage = '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      setChatHistory(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  if (!userName) {
    return <Landing onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 pt-12 sm:pt-16 transition-colors duration-300">
      <Header userName={userName} onHomeClick={handleRestart} />
      <main className="w-full max-w-2xl mx-auto">
        {isCompleted ? (
          <CompletionScreen onRestart={handleRestart} categoryName={selectedCategoryName} />
        ) : currentScenario ? (
          <ScenarioCard
            scenario={currentScenario}
            onSelectChoice={handleChoiceSelect}
            isLoading={isLoading}
            selectedChoiceId={selectedChoice?.id ?? null}
          />
        ) : (
           <p>시나리오를 불러오는 중입니다...</p>
        )}
      </main>
      
      {isFeedbackVisible && (
        <FeedbackModal
          isOpen={isFeedbackVisible}
          onClose={() => setIsFeedbackVisible(false)}
          feedbackData={feedbackData}
          onNext={handleNextScenario}
          isLoading={isLoading && !feedbackData.feedback}
          onFollowUpQuestion={handleFollowUpQuestion}
          isFollowUpLoading={isFollowUpLoading}
        />
      )}

      <Chatbot 
        history={chatHistory}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
      />
    </div>
  );
};

export default App;