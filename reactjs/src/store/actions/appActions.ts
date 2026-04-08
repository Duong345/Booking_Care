import actionTypes from './actionTypes';

interface ConfirmModalContent {
  isOpen?: boolean;
  title?: string;
  message?: string;
  [key: string]: any;
}

export const appStartUpComplete = () => ({
  type: actionTypes.APP_START_UP_COMPLETE,
});

export const setContentOfConfirmModal = (
  contentOfConfirmModal: ConfirmModalContent
) => ({
  type: actionTypes.SET_CONTENT_OF_CONFIRM_MODAL,
  contentOfConfirmModal,
});

export const changeLanguageApp = (languageInput: 'vi' | 'en') => ({
  type: actionTypes.CHANGE_LANGUAGE,
  language: languageInput,
});
