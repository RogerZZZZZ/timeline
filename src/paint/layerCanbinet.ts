import DataStore from '../lib/dataStore'
import Dispatcher from '../lib/dispatcher'
import Settings from '../default'
import Layer from './layer'
import UIButton from './ui_button'
import { style } from '../lib/utils'

const buttonStyle = {
  width: '22px',
  height: '22px',
  padding: '2px',
  marginTop: '2px',
}

export default class LayerCabinet {
  private data: DataStore
  private dispatcher: Dispatcher
  private containerDiv: HTMLDivElement
  private topDiv: HTMLDivElement
  private layerScrollDiv: HTMLDivElement
  private rangeInput: HTMLInputElement
  private playing = false
  private draggingRange = 0
  private playButton: UIButton
  private stopButton: UIButton
  private layerStore: any
  private layerUis: Layer[] = []
  private unusedLayer: Layer[] = []

  constructor(data: DataStore, dispatcher: Dispatcher) {
    this.data = data
    this.dispatcher = dispatcher

    this.layerStore = this.data.get('layers')

    this.containerDiv = document.createElement('div')
    this.topDiv = document.createElement('div')
    this.topDiv.style.cssText = 'margin: 0px; top: 0; left: 0; height: ' + Settings.MARKER_TRACK_HEIGHT + 'px'

    this.layerScrollDiv = document.createElement('div')
    style(this.layerScrollDiv, {
      position: 'absolute',
      top: Settings.MARKER_TRACK_HEIGHT + 'px',
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden'
    })

    this.containerDiv.appendChild(this.layerScrollDiv)

    this.playButton = new UIButton(16, 'play', 'play', dispatcher)
    style(this.playButton.dom, buttonStyle)
    this.playButton.onClick((e: any) => {
      e.preventDefault()
      dispatcher.fire('controls.toggle_play')
    })

    this.stopButton = new UIButton(16, 'stop', 'stop', dispatcher)
    style(this.stopButton.dom, buttonStyle)
    this.stopButton.onClick((e: any) => {
      e.preventDefault()
      dispatcher.fire('controls.stop')
    })

    this.rangeInput = document.createElement('input')
    this.rangeInput.type = 'range'
    this.rangeInput.min = '3'
    this.rangeInput.value = '9'
    this.rangeInput.max = '15'
    this.rangeInput.step = '1'

    style(this.rangeInput, {
      width: '90px',
      margin: '0px',
      marginLeft: '2px',
      marginRight: '2px',
    })

    this.rangeInput.addEventListener('mousedown', () => {
      this.draggingRange = 1
    })

    this.rangeInput.addEventListener('mouseup', () => {
      this.draggingRange = 0
      this.rangeUpdate()
    })

    this.rangeInput.addEventListener('mousemove', () => {
      if (!this.draggingRange) return
      this.rangeUpdate()
    })

    this.containerDiv.appendChild(this.topDiv)
    this.topDiv.appendChild(this.playButton.dom)
    this.topDiv.appendChild(this.stopButton.dom)
    this.topDiv.appendChild(this.rangeInput)
    this.setState(this.layerStore)

    this.rangeUpdate()
  }

  public scrollTo(x: number) {
    this.layerScrollDiv.scrollTop = x * (this.layerScrollDiv.scrollHeight - this.layerScrollDiv.clientHeight)
  }

  public repaint() {
    const layers = this.layerStore.value

    for (let i = this.layerUis.length; i-- > 0;) {
      if (i >= layers.length) {
        this.layerUis[i].dom.style.display = 'none'
        const popLayer = this.layerUis.pop()
        if (popLayer) this.unusedLayer.push(popLayer)
        continue
      }
      this.layerUis[i].setState(this.layerStore.get(i))
    }
  }

  public setControlStatus(v: any) {
    this.playing = v
    if (this.playing) {
      this.playButton.setIcon('pause')
      this.playButton.setTip('pause')
    } else {
      this.playButton.setIcon('play')
      this.playButton.setTip('play')
    }
  }

  public setState(state: any) {
    this.layerStore = state
    const layers = this.layerStore.value
    for (let i = 0; i < layers.length; i++) {
      if (!this.layerUis[i]) {
        if (this.unusedLayer.length) {
          const layerUi = this.unusedLayer.pop()
          if (layerUi) {
            layerUi.dom.style.display = 'block'
            this.layerUis.push(layerUi)
          }
        } else {
          const layerUi = new Layer()
          this.layerScrollDiv.appendChild(layerUi.dom)
          this.layerUis.push(layerUi)
        }
      }
    }
  }

  private rangeUpdate() {
    if (Number(this.rangeInput.value) > 0.9) {
      this.dispatcher.fire('update.scale', Number(this.rangeInput.value) / 10)
    }
  }

  get dom() {
    return this.containerDiv
  }
}
