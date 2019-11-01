import Settings from '../default'
import * as actions from '../actions/ctr'
import { CtrCons } from '../actions/index'
import { ActionType } from 'typesafe-actions'
import { ReducersUtils } from './utils'

type CtrAction = ActionType<typeof actions>

export interface ICtrState {
  currentTime: number
  scale: number
}

const reducersUtils: ReducersUtils<CtrAction, ICtrState> = new ReducersUtils()

export const defaultState: ICtrState = {
  currentTime: 0,
  scale: Settings.time_scale
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
  }
})
