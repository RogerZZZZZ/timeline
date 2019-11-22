import * as React from 'react'
import injectStyle from 'react-jss'
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva'
import Settings from '../default'
import Theme from '../theme'
import { useMappedState, useDispatch } from 'redux-react-hook'
import { ctrState } from '../reducers/state'
import ProgressScroller from './ProgressScroller'
import TimePoint from './TimePoint'
import { ILayer } from '../IInterface'
import { KonvaEventObject } from 'konva/types/Node'
import Konva from 'konva'
import { CtrCons } from '../actions'
import { formatTimeRuler } from '../lib/utils'

interface IProps {
  classes: any
}

const TIME_SCROLLER_HEIGHT = 35
const LEFT_GUTTER = 20
const MARKER_TRACK_HEIGHT = 25
const DEFAULT_OFFSET = 2

const Panel = ({ classes }: IProps) => {
  const dispatch = useDispatch()
  const { layers, scrollTime, scale } = useMappedState(ctrState)
  const [tickMark, setTickMark] = React.useState(Settings.time_scale / 60)
  let [frameRects, setFrameRects] = React.useState([] as any[])
  let [timePoints, setTimePoints] = React.useState([] as any[])
  let scrollHeight = Settings.height - TIME_SCROLLER_HEIGHT

  React.useEffect(() => {
    console.log('00000000----', scale)
    setTickMark(scale / 60)
  }, [scale])

  React.useEffect(() => {
    frameRects = []
    timePoints = []
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i]
      const values = layer.timeStamps
      const y = i * Settings.LINE_HEIGHT
      for (let j = 0; j < values.length; j++) {
        const frame = values[j]
        const x1 = timeToX(frame.startTime)
        const x2 = timeToX(frame.startTime + frame.duration)
        const y1 = y + 2
        const y2 = y + Settings.LINE_HEIGHT - 2

        frameRects.push({
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
        })

        timePoints.push({
          x: x1,
          y,
        })
      }
    }
    setFrameRects(frameRects)
    setTimePoints(timePoints)
  }, [layers, tickMark])

  const xToTime = (x: number) => {
    const units = scale / (tickMark * 10)
    return scrollTime + ((x - LEFT_GUTTER) / units | 0) / (tickMark * 10)
  }

  const timeToX = (s: number) => {
    let ds = s - scrollTime
    ds *= scale
    ds += LEFT_GUTTER
    return ds
  }

  const setCurrentTime = (e: KonvaEventObject<MouseEvent>) => {
    dispatch({
      type: CtrCons.TIME_SET,
      payload: xToTime(e.target.offsetX())
    })
  }

  const renderLayerLine = React.useMemo(() => {
    return Array.from({ length: layers.length + 1 }).map((_val: any, idx: number) => {
      const y = ~~(idx * Settings.LINE_HEIGHT) - 0.5 + Settings.LINE_HEIGHT
      return (
        <Line
          points={[0, y, Settings.width, y]}
          stroke={Theme.b}
        />
      )
    })
  }, [layers])

  const renderFrames = React.useMemo(() => {
    return frameRects.map((frame: any) => {
      return (
        <Rect
          x={frame.x}
          y={frame.y}
          fill={Konva.Util.getRandomColor()}
          width={frame.width}
          height={frame.height}
        />
      )
    })
  }, [frameRects])

  const renderPoints = React.useMemo(() => {
    return timePoints.map((points: any) => {
      return (
        <TimePoint
          x={points.x}
          y={points.y}
        />
      )
    })
  }, [timePoints])

  const renderRuler = React.useMemo(() => {
    const units = scale / tickMark
    const count = (Settings.width - LEFT_GUTTER) * 10 / units
    return Array.from({length: count}, (v, i) => i).map(idx => {
      if (idx % 10 === 0) {
        const tIdx = idx / 10
        const x = tIdx * units + LEFT_GUTTER
          return (
            <Line
              points={[x, 0, x, Settings.height]}
              stroke={Theme.c}
            />
          )
      }

      if (idx % 5 === 0) {
        const tIdx = idx / 5
        const x = tIdx * units / 2 + LEFT_GUTTER
        return (
          <Line
            points={[x, MARKER_TRACK_HEIGHT, x, MARKER_TRACK_HEIGHT - 14]}
            stroke={Theme.c}
          />
        )
      }
      const x = idx * units / 10 + LEFT_GUTTER
      return (
        <Line
          points={[x, MARKER_TRACK_HEIGHT, x, MARKER_TRACK_HEIGHT - 10]}
          stroke={Theme.c}
        />
      )
    })
  }, [tickMark])

  const renderRulerText = React.useMemo(() => {
    const units = scale / tickMark
    const count = (Settings.width - LEFT_GUTTER) / units
    return Array.from({length: count}, (v, i) => i).map(idx => {
      const x = idx * units + LEFT_GUTTER
      return (
        <Text
          x={x}
          y={0}
          text={formatTimeRuler(
            (idx * units) / scale + scrollTime
          )}
          align="center"
        />
      )
    })

  }, [scrollTime, tickMark])

  return (
    <div style={{
      width: Settings.width,
      height: (Settings.height - TIME_SCROLLER_HEIGHT),
    }}>
      <Stage
        onMouseMove={setCurrentTime}
        onMouseUp={setCurrentTime}
        width={Settings.width}
        height={(Settings.height - TIME_SCROLLER_HEIGHT)}
        fill={Theme.a}
      >
        <Layer
          x={0}
          y={2}
          width={Settings.width}
          height={scrollHeight}>
            {renderRuler}
            {renderRulerText}
            {renderLayerLine}
            <Group
              x={-(scrollTime * scale)}
              y={Settings.LINE_HEIGHT}
              >
              {renderFrames}
              {renderPoints}
            </Group>
        </Layer>
      </Stage>

      <ProgressScroller width={Settings.width} height={TIME_SCROLLER_HEIGHT} />
    </div>
  )
}

export default injectStyle({
  progressScroller: {
    position: 'absolute',
    top: '0px',
    left: '10px',
  },
  panelCanvas: {
    top: TIME_SCROLLER_HEIGHT + 'px',
    left: '0px',
  }
})(Panel)
