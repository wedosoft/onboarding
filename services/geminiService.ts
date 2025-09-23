import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Scenario, Choice, FeedbackData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;
let currentUserName: string = '신입사원';

export function initializeMentorSession(userName: string): void {
  currentUserName = userName;
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `당신은 글로벌 최상위 테크 기업의 시니어 멘토 '온보딩 나침반'입니다. 신입사원 ${currentUserName}님의 성장을 돕는 것이 당신의 역할입니다. 생산성, 시간 관리, 커뮤니케이션, 문제 해결, 협업 등 신입사원이 겪을 수 있는 어려움에 대해 따뜻하고, 실질적이며, 실행 가능한 조언을 해주세요. 이 앱의 시나리오에서 다루는 원칙들을 바탕으로 답변하면 더욱 좋습니다. 항상 격려하는 톤을 유지하고, 답변은 한국어로 해주세요.`,
    },
  });
}

export async function getChatResponse(message: string): Promise<string> {
  if (!chat) {
    initializeMentorSession('신입사원'); // Fallback
  }
  try {
    const response = await chat!.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error('Error fetching chat response from Gemini API:', error);
    throw new Error('AI 멘토로부터 답변을 가져오는 데 실패했습니다.');
  }
}

export async function getFeedback(scenario: Scenario, userChoice: Choice): Promise<FeedbackData> {
  const allChoicesText = scenario.choices.map(c => `- ${c.text}`).join('\n');
  
  const prompt = `
    당신은 글로벌 최상위 테크 기업의 노련한 시니어 매니저입니다. 신입 주니어 사원 ${currentUserName}님에게 멘토링을 제공하는 역할을 수행해 주세요. 당신의 말투는 따뜻하고, 건설적이며, 통찰력 있는 조언을 담아야 합니다.

    신입사원에게 다음과 같은 업무 시나리오가 주어졌습니다:
    **시나리오 제목:** ${scenario.title}
    **상세 설명:** ${scenario.description}

    선택 가능한 행동들은 다음과 같았습니다:
    ${allChoicesText}

    **신입사원의 선택:** "${userChoice.text}"

    이 선택에 대해 명확하고 실행 가능한 피드백을 제공해 주세요. 피드백은 반드시 아래 구조와 마크다운 서식을 따라야 합니다:
    
    ### 당신의 선택에 대한 분석
    신입사원의 선택을 먼저 인정하고, 해당 선택이 실제 업무 환경에서 가질 수 있는 장점과 단점을 균형 있게 분석해 주세요.

    ### 추천하는 접근 방식
    이 시나리오에 적용할 수 있는 가장 효과적인 업무 원칙이나 사고 모델(예: 아이젠하워 매트릭스, 이해관계자 커뮤니케이션, 투명한 실수 인정 등)을 설명해 주세요. 가장 이상적인 행동이 무엇이며, 왜 그것이 최선인지 명확하게 알려주세요.

    ### 다른 선택지들에 대한 고찰
    선택되지 않은 다른 옵션들이 왜 덜 효과적인지 간략하게 설명해 주세요.

    ### 핵심 정리
    신입사원이 앞으로 유사한 상황에서 기억하고 적용할 수 있는, 힘을 실어주는 핵심 원칙이나 교훈으로 마무리해 주세요.

    마지막으로, 신입사원이 이 주제에 대해 더 깊이 생각해볼 수 있도록 3개의 연관 질문을 생성해주세요. 질문은 신입사원의 학습을 유도하고 대화를 이어갈 수 있도록 개방형 질문으로 만들어주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            followUpQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['feedback', 'followUpQuestions'],
        },
      },
    });
    
    const responseJson = JSON.parse(response.text);
    return responseJson;

  } catch (error) {
    console.error('Error fetching feedback from Gemini API:', error);
    throw new Error('AI로부터 피드백을 가져오는 데 실패했습니다.');
  }
}

export async function getFollowUpAnswer(
  scenario: Scenario,
  originalFeedback: string,
  question: string
): Promise<string> {
  const prompt = `
    당신은 글로벌 최상위 테크 기업의 시니어 멘토 '온보딩 나침반'입니다. 신입사원의 성장을 돕는 것이 당신의 역할입니다.

    **상황:**
    - **시나리오:** ${scenario.title} (${scenario.description})
    - **당신의 이전 조언:**
    ---
    ${originalFeedback}
    ---

    위 상황과 조언에 이어, 신입사원 ${currentUserName}님이 다음과 같은 추가 질문을 했습니다.
    **신입사원의 질문:** "${question}"

    이 질문에 대해 명확하고, 실질적이며, 실행 가능한 답변을 해주세요. 답변은 이전 조언의 맥락을 유지하며, 신입사원이 한 단계 더 성장할 수 있도록 도와주어야 합니다. 답변은 마크다운 형식으로, 한국어로 해주세요.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error fetching follow-up answer from Gemini API:', error);
    throw new Error('AI 멘토로부터 추가 답변을 가져오는 데 실패했습니다.');
  }
}
