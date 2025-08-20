import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale, hasLocale } from './routing';

// Type for message files
type Messages = Record<string, unknown>;

async function loadMessages(locale: Locale): Promise<Messages> {
  try {
    const messages = await import(`../../messages/${locale}.json`) as { default: Messages };
    return messages.default;
  } catch {
    // Return empty object if messages file not found
    return {};
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Handle Next.js 15 async params pattern
  const requested = await requestLocale;
  
  // Validate locale using type-safe helper or fall back to default
  const locale: Locale = hasLocale(routing.locales, requested) 
    ? requested as Locale
    : routing.defaultLocale;

  const messages = await loadMessages(locale);
  
  // If messages are empty and it's not the default locale, try default locale
  if (Object.keys(messages).length === 0 && locale !== routing.defaultLocale) {
    console.warn(`No messages found for locale "${locale}", falling back to "${routing.defaultLocale}"`);
    const defaultMessages = await loadMessages(routing.defaultLocale);
    return {
      locale: routing.defaultLocale,
      messages: defaultMessages
    };
  }

  return {
    locale,
    messages
  };
});