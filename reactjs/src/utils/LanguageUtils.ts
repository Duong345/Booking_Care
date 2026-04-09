import messages_vi from '../translations/vi.json';
import messages_en from '../translations/en.json';

type NestedMessages = Record<string, any>;

const flattenMessages = (
  nestedMessages: NestedMessages,
  prefix = ''
): Record<string, string> => {
  if (nestedMessages == null) {
    return {};
  }
  return Object.keys(nestedMessages).reduce(
    (messages, key) => {
      const value = nestedMessages[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        messages[prefixedKey] = value;
      } else {
        Object.assign(messages, flattenMessages(value, prefixedKey));
      }

      return messages;
    },
    {} as Record<string, string>
  );
};

const messages: Record<string, Record<string, string>> = {
  vi: flattenMessages(messages_vi),
  en: flattenMessages(messages_en),
};

export const getMessageByKey = (
  key: string,
  lang: string
): string | undefined => {
  return messages[lang]?.[key];
};

export const getFlattenedMessages = (): Record<
  string,
  Record<string, string>
> => {
  return messages;
};

export const LanguageUtils = {
  getMessageByKey,
  getFlattenedMessages,
};
