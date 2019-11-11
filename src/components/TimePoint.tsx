import * as React from 'react'
import injectStyle from 'react-jss'
import { Shape } from 'react-konva'
import Settings from '../default'
import Theme from '../theme'

interface IProps {
  x: number
  y: number
  classes: any
}

const UITimePoint = (props: IProps) => {
  const { x, y } = props
  const { DIAMOND_SIZE } = Settings

  return(
    <Shape
      sceneFunc={(ctx, shape) => {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + DIAMOND_SIZE / 2, y + DIAMOND_SIZE / 2)
        ctx.lineTo(x, y + DIAMOND_SIZE)
        ctx.lineTo(x - DIAMOND_SIZE / 2, y + DIAMOND_SIZE / 2)
        ctx.closePath()
        ctx.fillStrokeShape(shape)
      }}
      fill={Theme.c}
    />
  )
}

export default injectStyle({
})(UITimePoint)
