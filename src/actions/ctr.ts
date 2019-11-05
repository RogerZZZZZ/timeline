import { CtrCons } from './index'
import { createAction } from 'typesafe-actions'

export const timeSet = createAction<string, any>(CtrCons.TIME_SET, resolve => {
  return (payload: any) => resolve(payload)
})

export const scaleSet = createAction<string, any>(CtrCons.SCALE_SET, resolve => {
  return (payload: any) => resolve(payload)
})

export const scrollTimeSet = createAction<string, any>(CtrCons.SCROLL_TIME_SET, resolve => {
  return (payload: any) => resolve(payload)
})

export const totalTImeSet = createAction<string, any>(CtrCons.TOTAL_TIME_SET, resolve => {
  return (payload: any) => resolve(payload)
})
