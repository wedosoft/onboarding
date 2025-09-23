import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import Header from './Header';

interface LandingProps {
  onStart: (name: string, category: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1 for name, 2 for category

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
    }
  };

  const handleSkip = () => {
    setName('주니어');
    setStep(2);
  };

  const handleStart = () => {
    if (name.trim() && selectedCategory) {
      onStart(name.trim(), selectedCategory);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="w-full max-w-2xl mx-auto">
        <Header />

        {step === 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-slate-700 dark:text-slate-200 mb-2">멘토링을 시작하기 전에,</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">AI 멘토가 당신을 어떻게 부르면 좋을까요?</p>
            <form onSubmit={handleNameSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="flex-grow w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                aria-label="이름 입력"
                required
              />
              <button
                type="submit"
                className="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-700 transition-all duration-200 disabled:bg-slate-400 flex-shrink-0 whitespace-nowrap"
              >
                확인
              </button>
            </form>
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                바로가기 (기본 이름 '주니어'로 시작)
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-slate-700 dark:text-slate-200 mb-2">
              반가워요, <span className="text-sky-600 dark:text-sky-400">{name}</span>님!
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">어떤 역량을 키우고 싶으신가요? 학습할 주제를 선택해주세요.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-6 rounded-2xl border-4 text-left transition-all duration-200 transform hover:-translate-y-1 ${selectedCategory === category.id
                    ? 'bg-sky-100 dark:bg-sky-900 border-sky-500'
                    : 'bg-white dark:bg-slate-800 border-transparent hover:border-sky-300 shadow-md'
                    }`}
                >
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                    <i className={`${category.icon} text-2xl text-sky-600 dark:text-sky-400`}></i>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{category.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleStart}
                disabled={!selectedCategory}
                className="bg-sky-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-sky-700 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 w-full sm:w-auto"
              >
                멘토링 시작하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;