import * as React from 'react'
import injectStyle from 'react-jss'
import Settings from '../default'
import Theme from '../theme'

interface IProps {
  classes: any
  finish?: boolean
  name: string
}

export default injectStyle({
  labelStyle: {
    fontSize: '10px',
    width: '60px',
    height: (Settings.LINE_HEIGHT - 1) + 'px',
    lineHeight: (Settings.LINE_HEIGHT - 1) + 'px',
    margin: 0,
    float: 'left',
    textAlign: 'center',
  },
  progressHint: {
    fontSize: '10px',
    width: '60px',
    height: (Settings.LINE_HEIGHT - 1) + 'px',
    lineHeight: (Settings.LINE_HEIGHT - 1) + 'px',
    margin: 0,
    float: 'right',
    textAlign: 'center',
  },
  container: {
    textAlign: 'left',
    margin: '0px 0px 0px 5px',
    borderBottom: '1px solid ' + Theme.b,
    top: 0,
    left: 0,
    height: (Settings.LINE_HEIGHT - 1) + 'px',
    color: Theme.c,
  },
})(({ classes, finish = false, name }: IProps) => {
  return (
    <div className={classes.container}>
      <span className={classes.labelStyle}>{name}</span>
      <span className={classes.progressHint}>
        {finish ? 'finish' : 'playing'}
      </span>
    </div>
  )
})
