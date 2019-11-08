import * as React from 'react'
import Timeline from './App'
import { IRawData } from './IInterface'
import { PersistGate } from 'redux-persist/integration/react'
import { StoreContext } from 'redux-react-hook'
import reduxPersist from './redux-persist'

const store = reduxPersist.getStore()
const persistor = reduxPersist.getPersistor()

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
  constructor(props: Props) {
    super(props)
  }

  render() {
    return (
      <div>
        <StoreContext.Provider value={store}>
          <PersistGate persistor={persistor}>
            <Timeline data={data} />
          </PersistGate>
        </StoreContext.Provider>
      </div>
    )
  }
}
