import type { PropsWithChildren } from 'react';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';

import '@formatjs/intl-pluralrules/polyfill.js';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/vi';

import '@formatjs/intl-relativetimeformat/polyfill.js';
import '@formatjs/intl-relativetimeformat/locale-data/en';
import '@formatjs/intl-relativetimeformat/locale-data/vi';

import { LanguageUtils } from '../utils';

const messages = LanguageUtils.getFlattenedMessages();

interface RootState {
  app: {
    language: 'vi' | 'en';
  };
}

const IntlProviderWrapper = ({ children }: PropsWithChildren<{}>) => {
  const language = useSelector((state: RootState) => state.app.language);

  return (
    <IntlProvider
      locale={language}
      messages={messages[language]}
      defaultLocale="vi"
    >
      {children}
    </IntlProvider>
  );
};

export default IntlProviderWrapper;
