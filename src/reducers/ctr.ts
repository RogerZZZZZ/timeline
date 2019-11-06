import Settings, { TIMELINE_STATUS } from '../default'
import * as actions from '../actions/ctr'
import { CtrCons } from '../actions/index'
import { ActionType } from 'typesafe-actions'
import { ReducersUtils } from './utils'
import { ILayer } from '../IInterface'

type CtrAction = ActionType<typeof actions>

export interface ICtrState {
  currentTime: number
  scale: number
  scrollTime: number
  totalTime: number
  timelineStatus: number
  layers: ILayer[]
  maxEnd: number
  layerMax: number[]
}

const reducersUtils: ReducersUtils<CtrAction, ICtrState> = new ReducersUtils()

export const defaultState: ICtrState = {
  currentTime: 0,
  scale: Settings.time_scale,
  scrollTime: 0,
  totalTime: 0,
  timelineStatus: TIMELINE_STATUS.STOP,
  layers: [],
  maxEnd: Number.MIN_VALUE,
  layerMax: [],
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
      ...state,
    }
  },
  [CtrCons.TOTAL_TIME_SET]: (state: ICtrState, payload: any) => {
    state.totalTime = payload
    return {
      ...state,
    }
  },
  [CtrCons.TIMELINE_STATUS_SET]: (state: ICtrState, payload: any) => {
    state.timelineStatus = payload
    return {
      ...state,
    }
  },
  [CtrCons.LAYERS_SET]: (state: ICtrState, payload: any) => {
    state.layers = payload
    return {
      ...state,
    }
  },
  [CtrCons.END_SET]: (state: ICtrState, payload: any) => {
    state.maxEnd = payload.maxEnd
    state.layerMax = payload.layerMax
    return {
      ...state,
    }
  },
})
