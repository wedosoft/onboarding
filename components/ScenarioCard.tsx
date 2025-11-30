
import React from 'react';
import { Scenario, Choice } from '../types';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelectChoice: (choice: Choice) => void;
  isLoading: boolean;
  selectedChoiceId: string | null;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelectChoice, isLoading, selectedChoiceId }) => {

  const getButtonClasses = (choiceId: string) => {
    const baseClasses = "w-full text-left p-4 rounded-xl border transition-all duration-200 text-slate-300 font-medium";

    if (isLoading) {
      if (selectedChoiceId === choiceId) {
        return `${baseClasses} bg-banana-500/20 border-banana-400 ring-1 ring-banana-400 cursor-wait text-banana-200`;
      }
      return `${baseClasses} bg-dark-800/30 border-white/5 cursor-not-allowed text-slate-600`;
    }

    if (selectedChoiceId === choiceId) {
      return `${baseClasses} bg-banana-500/20 border-banana-400 ring-1 ring-banana-400 text-banana-200 shadow-[0_0_15px_rgba(255,192,0,0.2)]`;
    }

    return `${baseClasses} bg-dark-800/50 border-white/10 hover:bg-white/5 hover:border-banana-400/50 hover:text-banana-100 transform hover:-translate-y-1 hover:shadow-lg`;
  };

  return (
    <div className="glass-card rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-fade-in border border-white/10">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-banana-500/10 rounded-2xl flex items-center justify-center border border-banana-500/20 shadow-[0_0_15px_rgba(255,192,0,0.1)]">
            <i className={`${scenario.icon} text-3xl text-banana-400`}></i>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{scenario.title}</h2>
        </div>
        <p className="text-slate-300 mb-8 text-base sm:text-lg leading-relaxed">
          {scenario.description}
        </p>
        <div className="space-y-4 relative">
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