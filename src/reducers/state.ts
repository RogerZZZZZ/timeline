import { RootState } from './index'

export const ctrState = (state: RootState) => ({
  currentTime: state.ctr.currentTime,
  scale: state.ctr.scale,
  scrollTime: state.ctr.scrollTime,
  totalTime: state.ctr.totalTime,
  timelineStatus: state.ctr.timelineStatus,
  layers: state.ctr.layers,
  maxEnd: state.ctr.maxEnd,
  layerMax: state.ctr.layerMax,
})
