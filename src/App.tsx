import * as React from 'react'
import { IRawData } from './IInterface'
import injectStyle from 'react-jss'
// import { Stage, Layer } from 'react-konva'
import { ctrState } from './reducers/state'
import { TIMELINE_STATUS } from './default'
import { useMappedState, useDispatch } from 'redux-react-hook'
import { CtrCons } from './actions'
import Theme from './theme'
import ActionBar from './components/ActionBar'
import Panel from './components/Panel'

interface IProps {
  classes: any,
  data: IRawData,
}

const Timeline = ({ classes, data }: IProps) => {
  const dispatch = useDispatch()
  let isPlaying = false
  let startPlay: any = null
  const { maxEnd, currentTime, timelineStatus } = useMappedState(ctrState)

  React.useEffect(() => {
    if (timelineStatus === TIMELINE_STATUS.PLAYING) {
      startPlaying()
    } else if (timelineStatus === TIMELINE_STATUS.PAUSE) {
      pausePlaying()
    }
  }, [timelineStatus])

  React.useEffect(() => {
    initData(data)
  }, [])

  const initData = (data: IRawData) => {
    dispatch({
      type: CtrCons.LAYERS_SET,
      payload: data.layers || [],
    })

    let max: number = 0
    const layerMaxs = []
    for (let i = 0; i < data.layers.length; i++) {
      const times = data.layers[i].timeStamps
      let layerMax = Number.MIN_VALUE
      for (let j = 0; j < times.length; j++) {
        const time = times[j]
        const end = time.startTime + time.duration
        layerMax = layerMax > end ? layerMax : end
        max = max > end ? max : end
      }
      layerMaxs.push(layerMax)
    }
    dispatch({
      type: CtrCons.END_SET,
      payload: {
        maxEnd: max,
        layerMax: layerMaxs,
      }
    })

    paint()
  }

  const setCurrentTime = (time: number) => {
    const t = Math.min(Math.max(0, time), maxEnd)
    dispatch({
      type: CtrCons.TIME_SET,
      payload: t,
    })
    if (isPlaying) {
      startPlay = performance.now() - time * 1000
    }
  }

  const startPlaying = () => {
    if (!isPlaying && startPlay === maxEnd) {
      setCurrentTime(0)
    }
    startPlay = performance.now() - currentTime * 1000
    isPlaying = true
  }

  const pausePlaying = () => {
    isPlaying = false
  }

  const paint = () => {
    requestAnimationFrame(paint)

    if (isPlaying && startPlay) {
      let t = (performance.now() - startPlay) / 1000
      if (t >= maxEnd) {
        startPlay = maxEnd
        isPlaying = false
        t = maxEnd
      }
      setCurrentTime(t)
    }
  }

  return (
    <div className={classes.pane}>
      <div className={classes.container}>
        <ActionBar />
        <Panel />
      </div>

      <div className={`${classes.paneTitle} ${classes.headerStyles}`}>
        <div className={`${classes.headerStyles} ${classes.topRightBar}`}>

        </div>
      </div>
    </div>
  )
}

export default injectStyle({
  container: {
    position: 'absolute',
    top: '22px',
  },
  headerStyles: {
    position: 'absolute',
    top: '0px',
    width: '100%',
    height: '22px',
    lineHeight: '22px',
    overflow: 'hidden'
  },
  pane: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    margin: 0,
    border: '1px solid ' + Theme.a,
    padding: 0,
    backgroundColor: Theme.a,
    color: Theme.d,
    zIndex: 999,
    fontFamily: 'monospace',
    fontSize: '12px'
  },
  paneTitle: {
    borderBottom: '1px solid ' + Theme.b,
    textAlign: 'center',
  },
  topRightBar: {
    textAlign: 'right',
  }
})(Timeline)
