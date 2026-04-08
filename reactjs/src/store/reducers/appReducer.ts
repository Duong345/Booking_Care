import actionTypes from '../actions/actionTypes';

export interface ConfirmModalContent {
  isOpen: boolean;
  messageId: string;
  handleFunc: ((data?: any) => void) | null;
  dataFunc: any;
}

export interface AppState {
  started: boolean;
  language: string;
  systemMenuPath: string;
  contentOfConfirmModal: ConfirmModalContent;
}

const initContentOfConfirmModal: ConfirmModalContent = {
  isOpen: false,
  messageId: '',
  handleFunc: null,
  dataFunc: null,
};

const initialState: AppState = {
  started: true,
  language: 'en',
  systemMenuPath: '/system/user-manage',
  contentOfConfirmModal: {
    ...initContentOfConfirmModal,
  },
};

interface AppAction {
  type: string;
  language?: string;
  contentOfConfirmModal?: Partial<ConfirmModalContent>;
  [key: string]: any;
}

const appReducer = (
  state: AppState = initialState,
  action: AppAction
): AppState => {
  switch (action.type) {
    case actionTypes.APP_START_UP_COMPLETE:
      return {
        ...state,
        started: true,
      };
    case actionTypes.SET_CONTENT_OF_CONFIRM_MODAL:
      return {
        ...state,
        contentOfConfirmModal: {
          ...state.contentOfConfirmModal,
          ...action.contentOfConfirmModal,
        },
      };
    case actionTypes.CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.language || state.language,
      };
    default:
      return state;
  }
};

export default appReducer;
