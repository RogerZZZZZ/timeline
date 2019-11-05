import { applyMiddleware, compose, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { Persistor, persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { ActionType } from 'typesafe-actions'

import * as ctrAction from './actions/ctr'
import reducers, { RootState } from './reducers'

type CtrActions = ActionType<typeof ctrAction>
const logEpicMiddleware = createEpicMiddleware<CtrActions, CtrActions, RootState>()

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['auth', 'anime'],
}

const configStore = (initState?: RootState) => {
  const middlewares = [
    logEpicMiddleware,
  ]

  const enhancer = compose(
    applyMiddleware(...middlewares)
  )

  const persistedReducer = persistReducer(persistConfig, reducers)

  const createdStore = createStore(
    persistedReducer,
    initState,
    enhancer,
  )

  return { store: createdStore,  persistor: persistStore(createdStore)}
}

class ReduxPersist {
  private readonly persistor: Persistor
  private readonly store: any

  constructor() {
    const { store, persistor } = configStore()
    this.persistor = persistor
    this.store = store
  }

  public getPersistor() {
    return this.persistor
  }

  public getStore() {
    return this.store
  }
}

export default new ReduxPersist()
