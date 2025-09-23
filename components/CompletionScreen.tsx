import React from 'react';

interface CompletionScreenProps {
  onRestart: () => void;
  categoryName: string;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onRestart, categoryName }) => {
  return (
    <div className="text-center bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 sm:p-12 animate-fade-in">
      <div className="text-6xl text-green-500 mb-4">
        <i className="fa-solid fa-award"></i>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-800 dark:text-slate-100">'{categoryName}' 학습을 완료했습니다!</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
        축하합니다! 시나리오 기반 학습을 통해 글로벌 인재의 핵심 역량을 탐색했습니다. 이 경험이 당신의 성공적인 커리어 여정에 훌륭한 나침반이 되기를 바랍니다.
      </p>
      <button
        onClick={onRestart}
        className="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
      >
        <i className="fa-solid fa-rotate-right"></i>
        처음으로 돌아가기
      </button>
    </div>
  );
};

export default CompletionScreen;
