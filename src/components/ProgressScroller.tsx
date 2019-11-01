import * as React from 'react'
import { useState } from 'react'
import injectStyle from 'react-jss'
import { Layer, Rect } from 'react-konva'
import DataStore from '../lib/dataStore'
import Dispatcher from '../lib/dispatcher'

interface IProps {
  classes: any
  data: DataStore
  dispatcher: Dispatcher
  width: number
  height: number
}

const ProgressScroller = (props: IProps) => {
  const { data, dispatcher } = props
  const totalTime = data.get('ui:totalTime').value
  const scrollTime = data.get('ui:scrollTime').value
  const scale = data.get('ui:timeScale').value
  const [scrollLeft, setScrollLeft] = useState(0)
  const [gripLen, setGripLen] = useState(0)

  return (
    <Layer>
      <Rect
        x={0}
        y={0}
        width={props.width}
        height={props.height}
      />
      <Rect
      />
    </Layer>
  )
}

export default injectStyle({

})(ProgressScroller)
