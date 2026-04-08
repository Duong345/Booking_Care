import { logger } from 'redux-logger';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { createStore, applyMiddleware, compose, Store } from 'redux';
// @ts-ignore
import { createStateSyncMiddleware } from 'redux-state-sync';
import { persistStore, Persistor } from 'redux-persist';
import createRootReducer from './store/reducers/rootReducer';
import actionTypes from './store/actions/actionTypes';
import type { RootState } from './store/reducers/rootReducer';

// @ts-ignore
const environment = process.env.NODE_ENV || 'development';
let isDevelopment = environment === 'development';

// hide redux logs
isDevelopment = false;

const reduxStateSyncConfig = {
  whitelist: [actionTypes.APP_START_UP_COMPLETE, actionTypes.CHANGE_LANGUAGE],
};

const rootReducer = createRootReducer();
const middleware = [
  thunkMiddleware,
  createStateSyncMiddleware(reduxStateSyncConfig),
];
if (isDevelopment) middleware.push(logger);

const composeEnhancers =
  isDevelopment &&
  typeof window !== 'undefined' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const reduxStore: Store<RootState> = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

export const dispatch = reduxStore.dispatch;

export const persistor: Persistor = persistStore(reduxStore);

export default reduxStore;
