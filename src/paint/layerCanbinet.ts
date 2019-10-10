import DataStore from '../lib/data-store'
import Dispatcher from '../lib/dispatcher'
import Settings from '../default'
import Layer from './layer'

const buttonStyle = {
  width: '22px',
  height: '22px',
  padding: '2px'
}

const opButtonStyles = {
  width: '32px',
  padding: '3px 4px 3px 4px'
}

export default class LayerCabinet {
  private data: DataStore
  private dispatcher: Dispatcher
  
  constructor(data: DataStore, dispatcher: Dispatcher) {
    this.data = data
    this.dispatcher = dispatcher
  }
}