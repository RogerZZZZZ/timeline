import * as React from 'react'
import injectStyle from 'react-jss'
import { Stage, Layer, Rect, Line } from 'react-konva/lib/ReactKonvaCore'
import Settings from '../default'
import Theme from '../theme'
import { useMappedState, useDispatch } from 'redux-react-hook'
import { ctrState } from '../reducers/state'
import ProgressScroller from './ProgressScroller'
import TimePoint from './TimePoint'
import { ILayer } from '../IInterface'
import { KonvaEventObject } from 'konva/types/Node'
import { CtrCons } from '../actions'

interface IProps {
  classes: any
}

const TIME_SCROLLER_HEIGHT = 35
const LEFT_GUTTER = 20

const Panel = ({ classes }: IProps) => {
  const dispatch = useDispatch()
  const dpr = window.devicePixelRatio
  const { layers, scrollTime, scale } = useMappedState(ctrState)
  const [tickMark, setTickMark] = React.useState(Settings.time_scale / 60)
  const [frameRects, setFrameRects] = React.useState([] as any[])
  const [timePoints, setTimePoints] = React.useState([] as any[])

  let timeScale = Settings.time_scale
  // let scrollHeight = Settings.height - TIME_SCROLLER_HEIGHT

  React.useEffect(() => {
    if (timeScale !== scale) {
      timeScale = scale
      setTickMark(timeScale)
    }
  }, [scale])

  React.useEffect(() => {
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i]
      const values = layer.timeStamps
      const y = i * Settings.LINE_HEIGHT

      for (let j = 0; j < values.length; j++) {
        const frame = values[j]
        const x = timeToX(frame.startTime)
        const x2 = timeToX(frame.startTime + frame.duration)
        const y1 = y + 2
        const y2 = y + Settings.LINE_HEIGHT - 2

        frameRects.push({
          x,
          y: y1,
          width: x2 - x,
          height: y2 - y1,
        })

        timePoints.push({
          x,
          y,
        })
      }
    }
    setFrameRects(frameRects)
    setTimePoints(timePoints)
  }, [layers])

  const xToTime = (x: number) => {
    const units = timeScale / tickMark * 10
    return scrollTime + ((x - LEFT_GUTTER) / units | 0) / tickMark * 10
  }

  const timeToX = (s: number) => {
    let ds = s - scrollTime
    ds *= timeScale
    ds += LEFT_GUTTER
    return ds
  }

  const setCurrentTime = (e: KonvaEventObject<MouseEvent>) => {
    dispatch({
      type: CtrCons.TIME_SET,
      payload: xToTime(e.target.offsetX())
    })
  }

  const renderLayerLine = () => {
    return layers.map((_layer: ILayer, idx: number) => {
      const y = ~~(idx * Settings.LINE_HEIGHT) - 0.5
      return (
        <Line
          x={0}
          y={y}
          points={[0, y, Settings.width, y]}
          stroke={Theme.b}
        />
      )
    })
  }

  const renderFrames = () => {
    return frameRects.map((frame: any) => {
      return (
        <Rect
          x={frame.x}
          y={frame.y}
          width={frame.width}
          height={frame.height}
        />
      )
    })
  }

  const renderPoints = () => {
    return timePoints.map((points: any) => {
      return (
        <TimePoint
          x={points.x}
          y={points.y}
        />
      )
    })
  }

  // const renderRuler = () => {
  //   let units = scale / tickMark
  //   const offsetUnits = (scrollTime * scale) & units
  //   const count = (Settings.width - LEFT_GUTTER + offsetUnits) / units
  //   for (let i = 0; i < count; i++) {

  //   }
  // }

  return (
    <div>
      <Stage className={classes.panelCanvas}
        onMouseMove={setCurrentTime}
        onMouseUp={setCurrentTime}
        style={{
          width: Settings.width * dpr,
          height: (Settings.height - TIME_SCROLLER_HEIGHT) * dpr,
        }}
        scale={{
          x: scale,
          y: scale,
        }}
        fill={Theme.a}
      >
        <Layer>
          {renderLayerLine()}
          {renderFrames()}
          {renderPoints()}
        </Layer>
      </Stage>

      <ProgressScroller width={Settings.width} height={TIME_SCROLLER_HEIGHT} />
    </div>
  )
}

export default injectStyle({
  container: {

  },
  progressScroller: {
    position: 'absolute',
    top: '0px',
    left: '10px',
  },
  panelCanvas: {
    position: 'absolute',
    top: TIME_SCROLLER_HEIGHT + 'px',
    left: '0px',
  }
})(Panel)
