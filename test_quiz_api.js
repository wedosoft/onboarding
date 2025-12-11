#!/usr/bin/env node

/**
 * Quiz API 디버깅 스크립트
 * 
 * 사용법:
 *   node test_quiz_api.js <moduleId>
 * 
 * 예시:
 *   node test_quiz_api.js freshservice-automation
 */

const moduleId = process.argv[2] || 'freshservice-automation';
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function testQuizAPI() {
  console.log('='.repeat(60));
  console.log('Quiz API 디버깅 테스트');
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
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 호출 실패:');
      console.error(errorText);
      return;
    }

    const questions = await response.json();
    console.log(`✅ ${questions.length}개의 문제 조회됨`);
    console.log('');

    if (questions.length === 0) {
      console.warn('⚠️ 경고: 반환된 문제가 없습니다!');
      console.log('');
      console.log('가능한 원인:');
      console.log('1. moduleId가 잘못되었습니다');
      console.log('2. 데이터베이스에 해당 모듈의 문제가 없습니다');
      console.log('3. 백엔드 필터가 너무 엄격합니다');
      return;
    }

    // 문제 분석
    console.log('-'.repeat(60));
    console.log('문제 상세 정보:');
    console.log('-'.repeat(60));

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

      console.log(`\n문제 ${idx + 1}:`);
      console.log(`  ID: ${q.id}`);
      console.log(`  Module ID: ${q.moduleId || '❌ 없음'}`);
      console.log(`  Difficulty: ${q.difficulty || '없음'}`);
      console.log(`  Question: ${q.question.substring(0, 80)}...`);
      if (isOnboarding) {
        console.log(`  ⚠️ 온보딩 관련 문제로 의심됨!`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('분석 결과:');
    console.log('='.repeat(60));
    console.log(`총 문제 수: ${questions.length}`);
    console.log(`발견된 Module IDs: ${Array.from(moduleIds).join(', ') || '없음'}`);
    console.log(`난이도 종류: ${Array.from(difficulties).join(', ') || '없음'}`);
    console.log(`온보딩 관련 의심 문제: ${onboardingRelated}개`);
    console.log('');

    // 진단
    if (moduleIds.size > 1) {
      console.log('🔍 진단: 여러 모듈의 문제가 섞여 있습니다!');
      console.log('→ 백엔드에서 moduleId 필터링이 제대로 안 되는 것 같습니다.');
    } else if (moduleIds.size === 0 || !moduleIds.has(moduleId)) {
      console.log('🔍 진단: moduleId가 일치하지 않습니다!');
      console.log(`→ 요청한 모듈: ${moduleId}`);
      console.log(`→ 실제 반환된 모듈: ${Array.from(moduleIds).join(', ')}`);
      console.log('→ 데이터베이스의 moduleId 값을 확인해보세요.');
    } else if (onboardingRelated > 0) {
      console.log('🔍 진단: 온보딩 관련 문제가 포함되어 있습니다!');
      console.log('→ 데이터베이스에 잘못된 moduleId로 저장된 문제가 있을 수 있습니다.');
    } else {
      console.log('✅ 진단: 정상적으로 보입니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('');
    console.log('확인 사항:');
    console.log('1. 백엔드 서버가 실행 중인가요?');
    console.log('2. VITE_API_BASE_URL 환경 변수가 올바른가요?');
    console.log(`   현재 값: ${API_BASE_URL}`);
  }
}

// 실행
testQuizAPI().catch(console.error);
