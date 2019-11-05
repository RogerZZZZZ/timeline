import * as React from 'react'
import injectStyle from 'react-jss'
import { Layer } from 'react-konva'
import Settings from './default'

interface IProps {
  classes: any
}

const Timeline = (props: IProps) => {
  console.log(props)

  return (
    <span>1</span>
  )
}

export default injectStyle({
  headerStyles: {
    position: 'absolute',
    top: '0px',
    width: '100%',
    height: '22px',
    lineHeight: '22px',
    overflow: 'hidden'
  }
})(Timeline)
