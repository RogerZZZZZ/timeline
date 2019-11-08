import * as React from 'react'
import injectStyle from 'react-jss'
import Settings, { TIMELINE_STATUS } from '../default'
// import { Button, Slider } from 'antd'
import { useMappedState, useDispatch } from 'redux-react-hook'
// import { SliderValue } from 'antd/lib/slider'
import { CtrCons } from '../actions'
import { ctrState } from '../reducers/state'

interface IProps {
  classes: any
}

const ActionBar = ({ classes }: IProps) => {
  const dispatch = useDispatch()
  const { timelineStatus } = useMappedState(ctrState)
  const defaultScale = 9

  React.useEffect(() => {
    // scaleChange(defaultScale)
  }, [])

  // const scaleChange = (value: any) => {
  //   dispatch({
  //     type: CtrCons.SCALE_SET,
  //     payload: value
  //   })
  // }

  const togglePlay = () => {
    if (timelineStatus === TIMELINE_STATUS.PLAYING) {
      dispatchPlayStatus(TIMELINE_STATUS.PAUSE)
    } else {
      dispatchPlayStatus(TIMELINE_STATUS.PLAYING)
    }
  }

  const stopPlaying = () => {
    dispatchPlayStatus(TIMELINE_STATUS.STOP)
  }

  const dispatchPlayStatus = (status: TIMELINE_STATUS) => {
    dispatch({
      type: CtrCons.TIMELINE_STATUS_SET,
      payload: status,
    })
  }

  // const playIcon = () => {
  //   return timelineStatus === TIMELINE_STATUS.PLAYING
  //     ? 'play'
  //     : 'pause'
  // }

  return (
    <div className={classes.container}>
      <div className={classes.layerScroll}>

      </div>

      <div className={classes.topDivStyle}>
        <button onClick={togglePlay}>play</button>
        <button onClick={stopPlaying}>stop</button>
        {/* <Button icon={playIcon()} onClick={togglePlay} />
        <Button icon='stop' onClick={stopPlaying} />
        <Slider
          className={classes.rangeInput}
          defaultValue={defaultScale}
          max={15}
          min={3}
          step={1}
          onChange={(value: SliderValue) => scaleChange(value)}/> */}
      </div>
    </div>
  )
}

export default injectStyle({
  rangeInput: {
    width: '90px',
    margin: '0px',
    marginLeft: '2px',
    marginRight: '2px',
  },
  buttonStyle: {
    width: '22px',
    height: '22px',
    padding: '2px',
    marginTop: '2px',
  },
  topDivStyle: {
    margin: '0px',
    top: '0px',
    left: '0px',
    height: Settings.MARKER_TRACK_HEIGHT + 'px',
  },
  layerScroll: {
    position: 'absolute',
    top: Settings.MARKER_TRACK_HEIGHT + 'px',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
})(ActionBar)
