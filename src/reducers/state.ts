import { RootState } from './index'

export const ctrState = (state: RootState) => ({
  currentTime: state.ctr.currentTime,
  scale: state.ctr.scale,
})
