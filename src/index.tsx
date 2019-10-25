/**
 * @class ExampleComponent
 */

import * as React from 'react'
// import styles from './styles.css'
import Timeline from './timeline'
import { IRawData } from './IInterface'

export type Props = { text: string }

const data: IRawData = {
  layers: [{
    name: 'text',
    timeStamps: [{
      startTime: 0,
      duration: 2,
    }, {
      startTime: 2,
      duration: 3,
    }],
  }, {
    name: 'example',
    timeStamps: [{
      startTime: 3,
      duration: 1,
    }],
  }]
}

export default class ExampleComponent extends React.Component<Props> {
  componentDidMount() {
    new Timeline({
      containerId: 'timeline',
      data,
    })
  }

  render() {
    return (
      <div id='timeline' />
    )
  }
}
