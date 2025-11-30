import React from 'react';

interface CompletionScreenProps {
  onRestart: () => void;
  categoryName: string;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onRestart, categoryName }) => {
  return (
    <div className="text-center glass-card rounded-2xl shadow-lg p-8 sm:p-12 animate-fade-in border border-white/10">
      <div className="text-6xl text-banana-400 mb-4">
        <i className="fa-solid fa-award"></i>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-200">'{categoryName}' 학습을 완료했습니다!</h2>
      <p className="text-slate-400 mb-8 text-lg">
        축하합니다! 시나리오 기반 학습을 통해 글로벌 인재의 핵심 역량을 탐색했습니다. 이 경험이 당신의 성공적인 커리어 여정에 훌륭한 나침반이 되기를 바랍니다.
      </p>
      <button
        onClick={onRestart}
        className="bg-banana-500 text-dark-900 font-bold py-3 px-8 rounded-lg hover:bg-banana-400 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto shadow-lg shadow-banana-500/30"
      >
        <i className="fa-solid fa-rotate-right"></i>
        처음으로 돌아가기
      </button>
    </div>
  );
};

export default CompletionScreen;
