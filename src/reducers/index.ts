import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import ctrReducer, { ICtrState } from './ctr'

export type RootState = {
  ctr: ICtrState
}

const ctrPersistConfig = {
  key: 'anime',
  storage,
}

export default combineReducers({
  ctr: persistReducer<ICtrState, any>(ctrPersistConfig, ctrReducer),
})
