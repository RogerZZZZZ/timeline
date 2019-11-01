/**
 * @class ExampleComponent
 */

import * as React from 'react'
// import styles from './styles.css'
import Timeline from './timeline'
import { IRawData, ILayer } from './IInterface'

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

const newData: ILayer = {
  name: 'new layer',
  timeStamps: [{
    startTime: 4,
    duration: 5,
  }],
}

export default class ExampleComponent extends React.Component<Props> {
  private timeline: Timeline

  constructor(props: Props) {
    super(props)
    this.handleAddAction = this.handleAddAction.bind(this)
  }

  componentDidMount() {
    this.timeline = new Timeline({
      containerId: 'timeline',
      data,
    })
  }

  handleAddAction() {
    this.timeline.addLayer(newData)
  }

  render() {
    return (
      <div>
        <div id='timeline' />
        <button onClick={this.handleAddAction}>add new layer</button>
      </div>
    )
  }
}
