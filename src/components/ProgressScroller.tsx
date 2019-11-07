import * as React from 'react'
import injectStyle from 'react-jss'
import { Stage, Layer, Rect } from 'react-konva'
import { useMappedState, useDispatch } from 'redux-react-hook'
import { ctrState } from '../reducers/state'
import { KonvaEventObject } from 'konva/types/Node'
import { CtrCons } from '../actions'

interface IProps {
  classes: any
  width: number
  height: number
}

const ProgressScroller = (props: IProps) => {
  const MARGIN = 15
  const { width, height } = props
  const dispatch = useDispatch()
  let draggingOffset: number | null = 0
  const { totalTime, scale, scrollTime } = useMappedState(ctrState)
  const [scrollLeft, setScrollLeft] = React.useState(0)
  const [gripLen, setGripLen] = React.useState(0)
  const [w, setW] = React.useState(width - 2 * MARGIN)

  React.useEffect(() => {
    setW(width - 2 * MARGIN)
  }, [width])

  React.useEffect(() => {
    const totalTimePixels = totalTime * scale
    const k = w / totalTimePixels
    const len = w * k
    const left = scrollTime / totalTime * w
    if (left + len <= w) {
      setGripLen(len)
      setScrollLeft(left)
    } else {
      setGripLen(len)
      setScrollLeft(w - len)
    }
  }, [scrollTime])

  const onDown = (e: KonvaEventObject<MouseEvent>) => {
    draggingOffset = scrollLeft
    const t = (e.target.offsetX() - MARGIN) / w * totalTime
    dispatch({
      type: CtrCons.TIME_SET,
      payload: t,
    })
  }

  const onMove = (e: KonvaEventObject<MouseEvent>) => {
    if (draggingOffset !== null) {
      if (gripLen + scrollLeft <= w) {
        dispatch({
          type: CtrCons.SCROLL_TIME_SET,
          payload: (draggingOffset + e.target.x()) / w * totalTime
        })
      }
    }
  }

  const onUp = () => {
    draggingOffset = null
  }

  return (
    <Stage>
      <Layer>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
        />
        <Rect
          x={scrollLeft}
          y={0}
          width={gripLen}
          height={16}
          onMouseMove={onMove}
          onMouseDown={onDown}
          onMouseUp={onUp}
        />
      </Layer>
    </Stage>
  )
}

export default injectStyle({

})(ProgressScroller)
