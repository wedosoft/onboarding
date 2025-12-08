/**
 * 글로벌 SaaS 디자인 토큰
 * Linear, Notion, Stripe, Vercel 등 글로벌 SaaS 사이트 기준
 */

export const designTokens = {
    // 🎯 Linear.app 기반 중앙 집중식 Border Radius 시스템
    radius: {
        none: '0px',     // 모서리 없음
        xs: '6px',       // 매우 작은 요소 (뱃지, 아이콘) - Supabase 스타일
        sm: '8px',       // 작은 버튼, 인풋 - Linear 작은 버튼 (32px height)
        md: '8px',       // 기본 요소들 - 통일성을 위해 sm과 동일
        lg: '10px',      // 큰 버튼, 카드 - Linear 기본 버튼 (40px height)
        xl: '12px',      // 모달, 패널
        '2xl': '16px',   // 대형 카드
        '3xl': '20px',   // 컨테이너
        '4xl': '24px',   // 히어로 섹션 요소
        full: '9999px'   // 원형 (아바타, 상태 인디케이터)
    },

    // 글로벌 SaaS 표준 간격 (Linear 스타일 패딩 적용)
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
        '6xl': '64px'
    },

    // Linear.app 실제 측정값 기반 버튼 패딩
    buttonPadding: {
        sm: '4px 12px',    // Linear 작은 버튼 (32px height, 8px radius)
        md: '8px 16px',    // Linear 기본 버튼 (40px height, 10px radius)
        lg: '12px 20px',   // 큰 버튼
        xl: '16px 24px'    // 매우 큰 버튼
    },

    // 글로벌 SaaS 표준 폰트 크기
    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
        '6xl': '60px'
    },

    // 글로벌 SaaS 표준 그림자
    shadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: '0 0 #0000'
    },

    // 글로벌 SaaS 표준 z-index
    zIndex: {
        auto: 'auto',
        base: 0,
        docked: 10,
        dropdown: 1000,
        sticky: 1100,
        banner: 1200,
        overlay: 1300,
        modal: 1400,
        popover: 1500,
        skipLink: 1600,
        toast: 1700,
        tooltip: 1800
    },

    // 글로벌 SaaS 표준 애니메이션
    animation: {
        duration: {
            fast: '150ms',
            normal: '200ms',
            slow: '300ms',
            slower: '500ms'
        },
        easing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
    },

    // 글로벌 SaaS 표준 브레이크포인트
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
    }
} as const

// 타입 정의
export type DesignTokens = typeof designTokens
export type Radius = keyof typeof designTokens.radius
export type Spacing = keyof typeof designTokens.spacing
export type ButtonPadding = keyof typeof designTokens.buttonPadding
export type FontSize = keyof typeof designTokens.fontSize
export type Shadow = keyof typeof designTokens.shadow
