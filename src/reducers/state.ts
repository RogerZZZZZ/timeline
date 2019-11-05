import { RootState } from './index'

export const ctrState = (state: RootState) => ({
  currentTime: state.ctr.currentTime,
  scale: state.ctr.scale,
  scrollTime: state.ctr.scrollTime,
  totalTime: state.ctr.totalTime,
})
