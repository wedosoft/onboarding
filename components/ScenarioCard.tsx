
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
    const baseClasses = "w-full text-left p-4 rounded-xl border transition-all duration-200 text-muted-foreground font-medium";

    if (isLoading) {
      if (selectedChoiceId === choiceId) {
        return `${baseClasses} bg-primary/20 border-primary ring-1 ring-primary cursor-wait text-primary`;
      }
      return `${baseClasses} bg-muted border-border cursor-not-allowed text-muted-foreground`;
    }

    if (selectedChoiceId === choiceId) {
      return `${baseClasses} bg-primary/20 border-primary ring-1 ring-primary text-primary shadow-[0_0_15px_rgba(90,142,192,0.2)]`;
    }

    return `${baseClasses} bg-card border-border hover:bg-muted hover:border-primary/50 hover:text-primary transform hover:-translate-y-1 hover:shadow-lg`;
  };

  return (
    <div className="glass-card rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-fade-in border border-border">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(90,142,192,0.1)]">
            <i className={`${scenario.icon} text-3xl text-primary`}></i>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{scenario.title}</h2>
        </div>
        <p className="text-muted-foreground mb-8 text-base sm:text-lg leading-relaxed">
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
              <div className="flex items-center justify-between">
                <span>{choice.text}</span>
                <i className="fa-solid fa-chevron-right text-sm opacity-50"></i>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
