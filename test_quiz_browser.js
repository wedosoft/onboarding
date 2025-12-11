/**
 * 브라우저 콘솔에서 실행할 수 있는 Quiz API 디버깅 스크립트
 * 
 * 사용법:
 * 1. 브라우저 DevTools 열기 (F12)
 * 2. Console 탭으로 이동
 * 3. 이 파일의 내용을 복사해서 붙여넣기
 * 4. testQuizAPI('freshservice-automation') 실행
 */

async function testQuizAPI(moduleId = 'freshservice-automation') {
  const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';
  
  console.log('='.repeat(60));
  console.log('Quiz API 디버깅 테스트 (브라우저)');
  console.log('='.repeat(60));
  console.log(`Module ID: ${moduleId}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('');

  const url = `${API_BASE_URL}/curriculum/modules/${encodeURIComponent(moduleId)}/questions`;
  console.log(`요청 URL: ${url}`);
  console.log('');

  try {
    console.log('API 호출 중...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 호출 실패:', errorText);
      return;
    }

    const questions = await response.json();
    console.log(`✅ ${questions.length}개의 문제 조회됨`);
    console.log('');

    if (questions.length === 0) {
      console.warn('%c⚠️ 경고: 반환된 문제가 없습니다!', 'color: orange; font-weight: bold;');
      return;
    }

    // 문제 분석
    console.group('📊 문제 상세 정보');
    
    const moduleIds = new Set();
    const difficulties = new Set();
    let onboardingRelated = 0;

    questions.forEach((q, idx) => {
      if (q.moduleId) moduleIds.add(q.moduleId);
      if (q.difficulty) difficulties.add(q.difficulty);
      
      const isOnboarding = 
        (q.question && (q.question.includes('온보딩') || q.question.toLowerCase().includes('onboarding'))) ||
        (q.moduleId && (q.moduleId.includes('onboarding') || q.moduleId.includes('scenario')));
      
      if (isOnboarding) onboardingRelated++;

      const style = isOnboarding ? 'color: red; font-weight: bold;' : 'color: green;';
      console.log(`%c문제 ${idx + 1}:`, style);
      console.log({
        id: q.id,
        moduleId: q.moduleId,
        difficulty: q.difficulty,
        question: q.question.substring(0, 100) + '...',
        isOnboardingRelated: isOnboarding
      });
    });
    
    console.groupEnd();
    console.log('');

    // 요약
    console.group('📈 분석 결과');
    console.log(`총 문제 수: ${questions.length}`);
    console.log(`발견된 Module IDs:`, Array.from(moduleIds));
    console.log(`난이도 종류:`, Array.from(difficulties));
    console.log(`%c온보딩 관련 의심 문제: ${onboardingRelated}개`, 
      onboardingRelated > 0 ? 'color: red; font-weight: bold;' : 'color: green;');
    console.groupEnd();
    console.log('');

    // 진단
    console.group('🔍 진단');
    if (moduleIds.size > 1) {
      console.error('❌ 여러 모듈의 문제가 섞여 있습니다!');
      console.log('→ 백엔드에서 moduleId 필터링이 제대로 안 되는 것 같습니다.');
    } else if (moduleIds.size === 0 || !moduleIds.has(moduleId)) {
      console.error('❌ moduleId가 일치하지 않습니다!');
      console.log(`요청한 모듈: ${moduleId}`);
      console.log(`실제 반환된 모듈:`, Array.from(moduleIds));
    } else if (onboardingRelated > 0) {
      console.warn('⚠️ 온보딩 관련 문제가 포함되어 있습니다!');
      console.log('→ 데이터베이스에 잘못된 moduleId로 저장된 문제가 있을 수 있습니다.');
    } else {
      console.log('%c✅ 정상적으로 보입니다.', 'color: green; font-weight: bold;');
    }
    console.groupEnd();

    return questions;

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    console.log('백엔드 서버가 실행 중인지 확인하세요.');
  }
}

// 사용 예시 출력
console.log('%c사용법:', 'color: blue; font-size: 14px; font-weight: bold;');
console.log('testQuizAPI("freshservice-automation")');
console.log('testQuizAPI("freshservice-asset")');
console.log('testQuizAPI("freshservice-reporting")');
