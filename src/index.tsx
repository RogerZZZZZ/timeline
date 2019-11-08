/**
 * @class ExampleComponent
 */

import * as React from 'react'
// import Timeline from './timeline'
import Timeline from './App'
import { IRawData } from './IInterface'
import { PersistGate } from 'redux-persist/integration/react'
import { StoreContext } from 'redux-react-hook'
import reduxPersist from './redux-persist'

import 'antd/dist/antd.css'
// import styles from './styles.css'

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

// const newData: ILayer = {
//   name: 'new layer',
//   timeStamps: [{
//     startTime: 4,
//     duration: 5,
//   }],
// }

const store = reduxPersist.getStore()
const persistor = reduxPersist.getPersistor()

export default class ExampleComponent extends React.Component<Props> {
  // private timeline: Timeline

  constructor(props: Props) {
    super(props)
    // this.handleAddAction = this.handleAddAction.bind(this)
  }

  // componentDidMount() {
  //   this.timeline = new Timeline({
  //     containerId: 'timeline',
  //     data,
  //   })
  // }

  // handleAddAction() {
  //   this.timeline.addLayer(newData)
  // }

  render() {
    return (
      <div>
        <StoreContext.Provider value={store}>
          <PersistGate persistor={persistor}>
            {/* <div id='timeline' /> */}
            <Timeline data={data} />
            {/* <button onClick={this.handleAddAction}>add new layer</button> */}
          </PersistGate>
        </StoreContext.Provider>
      </div>
    )
  }
}
