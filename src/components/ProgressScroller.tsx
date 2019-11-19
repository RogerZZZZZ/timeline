import * as React from 'react'
import injectStyle from 'react-jss'
import { Stage, Layer, Rect } from 'react-konva'
import { useMappedState, useDispatch } from 'redux-react-hook'
import { ctrState } from '../reducers/state'
import { CtrCons } from '../actions'
import dragWrapper from '../lib/drag'
import Theme from '../theme'

interface IProps {
  classes: any
  width: number
  height: number
}

let draggingOffset = null
const MARGIN = 2

const ProgressScroller = (props: IProps) => {
  const { width } = props
  const dispatch = useDispatch()
  const { totalTime, scale, scrollTime } = useMappedState(ctrState)
  const [scrollLeft, setScrollLeft] = React.useState(0)
  const [gripLen, setGripLen] = React.useState(0)
  const [w, setW] = React.useState(width - 2 * MARGIN)
  const scroller = React.useRef(null)

  React.useEffect(() => {
    scroller.current.getBoundingClientRect = () => {
      return {
        left: scroller.current.attrs.x,
        right: scroller.current.attrs.y,
      }
    }
    dragWrapper(scroller.current, /** mousedown*/() => {
      draggingOffset = scrollLeft
      console.log('adha', draggingOffset)
    }, /** mousemove */ (e: any) => {
      if (draggingOffset !== null) {
        if (gripLen + scrollLeft <= w) {
          const left = Math.max(0, (draggingOffset + e.dx) / w * totalTime)
          console.log('left', left, draggingOffset, e.dx)
          dispatch({
            type: CtrCons.SCROLL_TIME_SET,
            payload: left,
          })
        }
      }
    }, /** mouseup */ () => {
      draggingOffset = null
    })
  }, [])

  React.useEffect(() => {
    setW(width - 2 * MARGIN)
  }, [width])

  React.useEffect(() => {
    console.log('scroll', scrollTime)
    const totalTimePixels = totalTime * scale
    const k = w / totalTimePixels
    const len = w * k
    const left = scrollTime / totalTime * w
    console.log('akjsdhashd', left, w, len)
    if (left + len <= w) {
      setGripLen(len)
      setScrollLeft(left)
      console.log('leftleft', left)
    } else {
      setGripLen(len)
      setScrollLeft(w - len)
    }
  }, [scrollTime, scale, w, totalTime])

  return (
    <Stage
      width={width}
      height={20}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          stroke={Theme.b}
          width={width}
          height={20}
        />
        <Rect
          ref={scroller}
          x={scrollLeft + MARGIN}
          y={MARGIN}
          width={gripLen}
          height={20 - 2 * MARGIN}
          fill={Theme.b}
          stroke={Theme.c}
        />
      </Layer>
    </Stage>
  )
}

export default injectStyle({

})(ProgressScroller)
