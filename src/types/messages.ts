// Type definition for translation messages
// The actual message structure is defined in /messages/en.json and /messages/ja.json

export interface Messages {
  Common: {
    navigation: {
      home: string;
      chat: string;
      profile: string;
      settings: string;
      logout: string;
    };
    actions: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      back: string;
      next: string;
      submit: string;
      confirm: string;
    };
    status: {
      loading: string;
      saving: string;
      success: string;
      error: string;
    };
  };
  Auth: {
    login: {
      title: string;
      emailLabel: string;
      emailPlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      submitButton: string;
      signupLink: string;
      forgotPassword: string;
      rememberMe: string;
      errors: {
        invalidCredentials: string;
        networkError: string;
        serverError: string;
      };
    };
    signup: {
      title: string;
      emailLabel: string;
      passwordLabel: string;
      confirmPasswordLabel: string;
      submitButton: string;
      loginLink: string;
      termsAgreement: string;
      errors: {
        emailInUse: string;
        passwordMismatch: string;
        weakPassword: string;
      };
    };
    profile: {
      title: string;
      displayName: string;
      email: string;
      language: string;
      theme: string;
      mbtiType: string;
      bio: string;
      saveButton: string;
      cancelButton: string;
      deleteAccount: string;
      success: string;
    };
  };
  Chat: {
    title: string;
    inputPlaceholder: string;
    sendButton: string;
    newChat: string;
    clearHistory: string;
    typing: string;
    thinking: string;
    sessionTitle: string;
    welcome: string;
    errors: {
      sendFailed: string;
      connectionLost: string;
      rateLimited: string;
    };
    prompts: {
      suggestion1: string;
      suggestion2: string;
      suggestion3: string;
    };
  };
  MBTI: {
    diagnosis: {
      title: string;
      subtitle: string;
      startButton: string;
      nextQuestion: string;
      previousQuestion: string;
      submitButton: string;
      progress: string;
      question: string;
    };
    result: {
      title: string;
      yourType: string;
      description: string;
      strengths: string;
      weaknesses: string;
      recommendations: string;
      retakeButton: string;
      saveButton: string;
    };
    types: {
      INTJ: string;
      INTP: string;
      ENTJ: string;
      ENTP: string;
      INFJ: string;
      INFP: string;
      ENFJ: string;
      ENFP: string;
      ISTJ: string;
      ISFJ: string;
      ESTJ: string;
      ESFJ: string;
      ISTP: string;
      ISFP: string;
      ESTP: string;
      ESFP: string;
    };
  };
  Personas: {
    title: string;
    subtitle: string;
    createNew: string;
    edit: string;
    delete: string;
    select: string;
    selected: string;
    parameters: {
      creativity: string;
      empathy: string;
      analyticalThinking: string;
      friendliness: string;
      formality: string;
    };
    presets: {
      mentor: string;
      friend: string;
      teacher: string;
      coach: string;
      assistant: string;
    };
  };
  Settings: {
    title: string;
    sections: {
      general: string;
      appearance: string;
      notifications: string;
      privacy: string;
      language: string;
    };
    theme: {
      label: string;
      light: string;
      dark: string;
      system: string;
    };
    language: {
      label: string;
      japanese: string;
      english: string;
    };
  };
  Errors: {
    404: string;
    500: string;
    generic: string;
    networkError: string;
    unauthorized: string;
    forbidden: string;
  };
}

// Utility type for translation functions
export type TranslationKey = keyof Messages | `${keyof Messages}.${string}`;

// Type helper to get nested keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & string]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & string];

// Full translation key type including nested keys
export type FullTranslationKey = NestedKeyOf<Messages>;

// Namespace types
export type TranslationNamespace = keyof Messages;

// Type helper for namespace-specific keys
export type NamespaceKeys<N extends TranslationNamespace> = keyof Messages[N];

// Type guard to check if a key exists
export function isValidTranslationKey(key: string): key is FullTranslationKey {
  // This is a runtime check placeholder
  // In practice, you'd validate against the actual message structure
  return true;
}

// Export individual namespace types for better type inference
export type CommonMessages = Messages['Common'];
export type AuthMessages = Messages['Auth'];
export type ChatMessages = Messages['Chat'];
export type MBTIMessages = Messages['MBTI'];
export type PersonasMessages = Messages['Personas'];
export type SettingsMessages = Messages['Settings'];
export type ErrorMessages = Messages['Errors'];