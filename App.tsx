import React, { useState, useCallback } from 'react';
import { Scenario, Choice, ChatMessage, FeedbackData } from './types';
import { SCENARIOS, CATEGORIES } from './constants';
import { getFeedbackStream, getChatResponseStream, getFollowUpAnswerStream, initializeMentorSession } from './services/geminiService';
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
  const [isFeedbackContentLoading, setIsFeedbackContentLoading] = useState(false);
  const [isFeedbackStreaming, setIsFeedbackStreaming] = useState(false);
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
      let isFirstChunk = true; // Use a local flag to track the first chunk

      for await (const chunk of stream) {
        // On the very first chunk, turn off the main loading spinner
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

      // Handle the case of an empty stream, where the loop never runs
      if (isFirstChunk) {
        setIsFeedbackContentLoading(false);
      }

    } catch (error) {
      console.error(error);
      setFeedbackData({ 
        feedback: '죄송합니다, 피드백을 받는 중 오류가 발생했습니다. 다시 시도해 주세요.', 
        followUpQuestions: [] 
      });
      setIsFeedbackContentLoading(false); // Ensure spinner is off on error
    } finally {
      setIsFeedbackStreaming(false);
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

  const handleRestart = () => {
    setUserName(null);
    setActiveScenarios([]);
    setSelectedCategoryName('');
    setIsCompleted(false);
    setCurrentScenarioIndex(0);
    setChatHistory([]);
  };

  const handleSendMessage = useCallback(async (message: string) => {
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }, { role: 'model', content: '' }];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const stream = await getChatResponseStream(message);
      let fullResponse = '';
      for await (const chunk of stream) {
          fullResponse += chunk.text;
          setChatHistory(prev => {
              const updatedHistory = [...prev];
              updatedHistory[updatedHistory.length - 1].content = fullResponse;
              return updatedHistory;
          });
      }
    } catch (error) {
      console.error(error);
      const errorMessage = '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      setChatHistory(prev => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1].content = errorMessage;
          return updatedHistory;
      });
    } finally {
      setIsChatLoading(false);
    }
  }, [chatHistory]);

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
            isLoading={isFeedbackStreaming}
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
          isLoading={isFeedbackContentLoading}
          onFollowUpQuestion={handleFollowUpQuestion}
          isFollowUpLoading={isFollowUpLoading}
          isStreaming={isFeedbackStreaming}
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