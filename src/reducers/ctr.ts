import Settings from '../default'
import * as actions from '../actions/ctr'
import { CtrCons } from '../actions/index'
import { ActionType } from 'typesafe-actions'
import { ReducersUtils } from './utils'

type CtrAction = ActionType<typeof actions>

export interface ICtrState {
  currentTime: number
  scale: number
  scrollTime: number
  totalTime: number
}

const reducersUtils: ReducersUtils<CtrAction, ICtrState> = new ReducersUtils()

export const defaultState: ICtrState = {
  currentTime: 0,
  scale: Settings.time_scale,
  scrollTime: 0,
  totalTime: 0,
}

export default reducersUtils.createReducers(defaultState, {
  [CtrCons.SCALE_SET]: (state: ICtrState, payload: any) => {
    state.scale = payload
    return {
      ...state,
    }
  },
  [CtrCons.TIME_SET]: (state: ICtrState, payload: any) => {
    state.currentTime = payload
    return {
      ...state,
    }
  },
  [CtrCons.SCROLL_TIME_SET]: (state: ICtrState, payload: any) => {
    state.scrollTime = payload
    return {
      ...state
    }
  },
  [CtrCons.TOTAL_TIME_SET]: (state: ICtrState, payload: any) => {
    state.totalTime = payload
    return {
      ...state
    }
  }
})
