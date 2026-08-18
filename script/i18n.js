/**
 * i18n.js - Internationalization Module with Google Translate
 * 사용자 언어 감지, 설정 저장, 언어 전환 기능
 */

class I18nManager {
    constructor() {
        this.STORAGE_KEY = 'blindWalker_preferredLanguage';
        this.DEFAULT_LANGUAGE = 'ko';
        this.currentLanguage = this.DEFAULT_LANGUAGE;
        this.supportedLanguages = {
            'ko': { name: '한국어', label: 'Ko', flag: '🇰🇷' },
            'en': { name: 'English', label: 'En', flag: '🇺🇸' },
            'ja': { name: '日本語', label: 'Ja', flag: '🇯🇵' },
            'zh-CN': { name: '简体中文', label: 'Zh', flag: '🇨🇳' },
            'es': { name: 'Español', label: 'Es', flag: '🇪🇸' },
            'fr': { name: 'Français', label: 'Fr', flag: '🇫🇷' },
            'de': { name: 'Deutsch', label: 'De', flag: '🇩🇪' },
            'pt': { name: 'Português', label: 'Pt', flag: '🇵🇹' }
        };
        this.isGoogleTranslateReady = false; // Flag to track library readiness

        this.detectInitialLanguage();
        
        // Defer UI setup until the DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.setupUI.bind(this));
        } else {
            this.setupUI();
        }
    }

    /**
     * Called by the global googleTranslateElementInit function when the Google Translate script is loaded.
     */
    onGoogleTranslateReady() {
        console.log('[i18n] Google Translate library is ready.');
        this.isGoogleTranslateReady = true;

        // Apply the initial language that was detected on load.
        // A short delay can help ensure the widget's internal state is ready.
        setTimeout(() => {
            this.applyLanguage(this.currentLanguage);
        }, 100);
    }

    /**
     * Detects initial language from storage or browser settings.
     * This part is safe to run before the DOM is ready.
     */
    detectInitialLanguage() {
        // 1. 로컬스토리지에서 사용자의 이전 선택 확인
        const savedLanguage = this.getSavedLanguage();
        if (savedLanguage && this.isSupportedLanguage(savedLanguage)) {
            this.currentLanguage = savedLanguage;
            console.log(`[i18n] 저장된 언어 로드: ${savedLanguage}`);
        } else {
            // 2. 저장된 언어가 없으면 브라우저 언어 감지
            const detectedLanguage = this.detectBrowserLanguage();
            if (detectedLanguage && this.isSupportedLanguage(detectedLanguage)) {
                this.currentLanguage = detectedLanguage;
                console.log(`[i18n] 브라우저 언어 감지: ${detectedLanguage}`);
            } else {
                console.log(`[i18n] 기본 언어 사용: ${this.DEFAULT_LANGUAGE}`);
                this.currentLanguage = this.DEFAULT_LANGUAGE;
            }
        }
    }

    /**
     * 로컬스토리지에서 저장된 언어 가져오기
     */
    getSavedLanguage() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
            console.warn('[i18n] localStorage 접근 실패:', e);
            return null;
        }
    }

    /**
     * 로컬스토리지에 언어 저장
     */
    saveLanguage(lang) {
        try {
            localStorage.setItem(this.STORAGE_KEY, lang);
            console.log(`[i18n] 언어 저장됨: ${lang}`);
        } catch (e) {
            console.warn('[i18n] localStorage 저장 실패:', e);
        }
    }

    /**
     * 브라우저 언어 감지
     * navigator.language (e.g., "ko-KR") 또는 navigator.languages 배열 사용
     */
    detectBrowserLanguage() {
        // navigator.language: 현재 지역
        let browserLang = navigator.language || navigator.userLanguage;
        
        // 언어 코드만 추출 (e.g., "ko-KR" -> "ko")
        let langCode = browserLang.split('-')[0];
        
        // 정확한 매칭 확인 (예: "zh-CN")
        if (this.isSupportedLanguage(browserLang)) {
            return browserLang;
        }
        
        // 언어 코드로 매칭
        if (this.isSupportedLanguage(langCode)) {
            return langCode;
        }
        
        // 특수 케이스: 중국어
        if (langCode === 'zh') {
            return browserLang.includes('TW') || browserLang.includes('HK') ? 'zh-TW' : 'zh-CN';
        }
        
        return null;
    }

    /**
     * 지원하는 언어인지 확인
     */
    isSupportedLanguage(lang) {
        return lang in this.supportedLanguages;
    }

    /**
     * 언어 선택 UI 설정
     */
    setupUI() {
        const langToggle = document.querySelector('.lang-toggle');
        const langDropdown = document.querySelector('#lang-dropdown');
        const langOptions = document.querySelectorAll('.lang-option');

        if (!langToggle || !langDropdown || !langOptions.length) {
            console.warn('[i18n] 언어 선택 UI 요소를 찾을 수 없습니다.');
            return;
        }

        // 토글 버튼 클릭
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });

        // 언어 옵션 클릭
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const selectedLang = option.dataset.lang;
                this.changeLanguage(selectedLang);
                langDropdown.classList.remove('active');
            });
        });

        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                langDropdown.classList.remove('active');
            }
        });

        // 초기 활성 옵션 표시 및 라벨 업데이트
        this.updateActiveOption();
        const langLabel = document.querySelector('#current-lang');
        if (langLabel) {
            langLabel.textContent = this.supportedLanguages[this.currentLanguage].label.toUpperCase();
        }
    }

    /**
     * 언어 변경
     */
    changeLanguage(lang) {
        if (!this.isSupportedLanguage(lang)) {
            console.error(`[i18n] 지원하지 않는 언어: ${lang}`);
            return;
        }

        if (this.currentLanguage === lang) {
            console.log(`[i18n] 이미 ${lang}로 설정되어 있습니다.`);
            return;
        }

        console.log(`[i18n] 언어 변경: ${this.currentLanguage} -> ${lang}`);
        this.currentLanguage = lang;
        this.saveLanguage(lang);
        this.applyLanguage(lang);
        this.updateActiveOption();
    }

    /**
     * 언어 적용 (Google Translate 호출)
     */
    applyLanguage(lang) {
        const langLabel = document.querySelector('#current-lang');
        if (langLabel) {
            langLabel.textContent = this.supportedLanguages[lang].label.toUpperCase();
        }

        // Google Translate 초기화 확인
        if (!this.isGoogleTranslateReady) {
            console.warn('[i18n] Google Translate 라이브러리가 아직 준비되지 않았습니다. 로드 후 적용됩니다.');
            return;
        }
        
        try {
            // Google Translate 코드 추출 및 실행
            const element = document.querySelector('.goog-te-combo');
            if (element) {
                element.value = lang;
                element.dispatchEvent(new Event('change'));
                
                // 페이드 인/아웃 효과
                this.fadeTransition();
                
                console.log(`[i18n] Google Translate로 ${lang} 적용됨`);
            } else {
                // This can happen if the widget is not yet in the DOM, even if the library is loaded.
                // We'll retry once, as a fallback.
                setTimeout(() => {
                    const elementRetry = document.querySelector('.goog-te-combo');
                    if(elementRetry) {
                        elementRetry.value = lang;
                        elementRetry.dispatchEvent(new Event('change'));
                        this.fadeTransition();
                        console.log(`[i18n] Google Translate로 ${lang} 적용됨 (재시도)`);
                    } else {
                        console.warn('[i18n] Google Translate 콤보박스를 찾을 수 없습니다.');
                    }
                }, 500);
            }
        } catch (e) {
            console.error('[i18n] Google Translate 적용 중 오류:', e);
        }
    }

    /**
     * 활성 언어 옵션 업데이트
     */
    updateActiveOption() {
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    /**
     * 언어 전환 시 페이드 효과
     */
    fadeTransition() {
        const body = document.body;
        body.style.transition = 'opacity 0.3s ease';
        body.style.opacity = '0.7';
        setTimeout(() => {
            body.style.opacity = '1';
        }, 300);
    }

    /**
     * 현재 언어 정보 반환
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 현재 언어 이름 반환
     */
    getCurrentLanguageName() {
        return this.supportedLanguages[this.currentLanguage]?.name || this.currentLanguage;
    }

    /**
     * 모든 지원 언어 반환
     */
    getSupportedLanguages() {
        return Object.keys(this.supportedLanguages);
    }
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18nManager = new I18nManager();
    });
} else {
    window.i18nManager = new I18nManager();
}
