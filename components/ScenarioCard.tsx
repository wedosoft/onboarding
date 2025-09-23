
import React from 'react';
import { Scenario, Choice } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelectChoice: (choice: Choice) => void;
  isLoading: boolean;
  selectedChoiceId: string | null;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelectChoice, isLoading, selectedChoiceId }) => {

  const getButtonClasses = (choiceId: string) => {
    const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-slate-700 dark:text-slate-200";

    if (isLoading) {
      if (selectedChoiceId === choiceId) {
        return `${baseClasses} bg-sky-100 dark:bg-sky-900 border-sky-500 ring-2 ring-sky-500 cursor-wait`;
      }
      return `${baseClasses} bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-not-allowed text-slate-400 dark:text-slate-500`;
    }
    
    if (selectedChoiceId === choiceId) {
      return `${baseClasses} bg-sky-100 dark:bg-sky-900 border-sky-500 ring-2 ring-sky-500`;
    }

    return `${baseClasses} bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-sky-400 transform hover:-translate-y-1`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.01] animate-fade-in">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
            <i className={`${scenario.icon} text-2xl text-sky-600 dark:text-sky-400`}></i>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{scenario.title}</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-base sm:text-lg">
          {scenario.description}
        </p>
        <div className="space-y-3 relative">
          {isLoading && selectedChoiceId && (
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
                <LoadingSpinner />
              </div>
          )}
          {scenario.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onSelectChoice(choice)}
              disabled={isLoading}
              className={getButtonClasses(choice.id)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
