import { combineReducers } from 'redux';
import appReducer, { AppState } from './appReducer';
import adminReducer, { AdminState } from './adminReducer';
import userReducer, { UserState } from './userReducer';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

export interface RootState {
  user: UserState;
  app: AppState;
  admin: AdminState;
}

const persistCommonConfig = {
  storage: storage,
  stateReconciler: autoMergeLevel2,
};

const userPersistConfig = {
  ...persistCommonConfig,
  key: 'user',
  whitelist: ['isLoggedIn', 'userInfo'],
};

const appPersistConfig = {
  ...persistCommonConfig,
  key: 'app',
  whitelist: ['language'],
};

export default () =>
  combineReducers({
    user: persistReducer(userPersistConfig, userReducer as any) as any,
    app: persistReducer(appPersistConfig, appReducer as any) as any,
    admin: adminReducer as any,
  }) as any;
