import { ILayer } from '../IInterface'
import Dispatcher from '../lib/dispatcher'
import Theme from '../theme'
import Settings from '../default'
import { style, timeAtLayer } from '../lib/utils'

class ToggleButton {
  private text: string
  private button: HTMLButtonElement
  public pressed: boolean
  public onClick: Function

  constructor(text: string) {
    this.text = text
    this.button = document.createElement('button')
    this.button.textContent = this.text

    style(this.button, {
      fontSize: '12px',
			padding: '1px',
			borderSize: '2px',
			outline: 'none',
			background: '#fff',
    })

    this.pressed = false
    this.button.onclick = () => {
      this.pressed = !this.pressed

      style(this.button, {
        borderStyle: this.pressed ? 'inset' : 'outset',
      })

      if (this.onClick) this.onClick()
    }
  }

  get dom() {
    return this.button
  }
}


export default class LayerView {
  public dom: HTMLDivElement
  private label: HTMLSpanElement
  private dispatcher: Dispatcher
  private layer: ILayer
  private state: any

  constructor(layer: ILayer, dispatcher: Dispatcher) {
    this.dispatcher = dispatcher
    this.layer = layer

    this.dom = document.createElement('div')
    this.label = document.createElement('span')

    style(this.label, {
      fontSize: '10px',
      width: '60px',
      height: (Settings.LINE_HEIGHT - 1) + 'px',
      lineHeight: (Settings.LINE_HEIGHT - 1) + 'px',
      margin: 0,
      float: 'right',
      textAlign: 'center',
    })

    const soloToggle = new ToggleButton('S')
    this.dom.appendChild(soloToggle.dom)

    soloToggle.onClick = () => {
      this.dispatcher.fire('action:solo', layer, soloToggle.pressed)
    }

    const muteToggle = new ToggleButton('M')
    this.dom.appendChild(muteToggle.dom)

    muteToggle.onClick = () => {
      dispatcher.fire('action:mute', layer, muteToggle.pressed)
    }

    this.dom.appendChild(this.label)

    style(this.dom, {
      textAlign: 'left',
      margin: '0px 0px 0px 5px',
      borderBottom: '1px solid ' + Theme.b,
      top: 0,
      left: 0,
      height: (Settings.LINE_HEIGHT - 1 ) + 'px',
      color: Theme.c,
    })
  }

  public repaint(s: any) {
    const o = timeAtLayer(this.layer, s)
    if (!o) return

    this.state.get('_value').value = o.value
  }

  public setState(s: any) {
    this.state = s

    const tmpValue = this.state.get('_value')
    if (tmpValue.value === undefined) {
      tmpValue.value = 0
    }

    this.label.textContent = this.state.get('name').value
    this.repaint(null)
  }
}
