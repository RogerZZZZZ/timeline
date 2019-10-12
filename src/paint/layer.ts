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
  private keyframeButton: HTMLButtonElement
  private dispatcher: Dispatcher
  private layer: ILayer
  private state: any

  constructor(layer: ILayer, dispatcher: Dispatcher) {
    this.dispatcher = dispatcher
    this.layer = layer

    this.dom = document.createElement('div')
    this.label = document.createElement('span')

    this.label.style.cssText = 'font-size: 10px; width: 60px; margin: 0; float: right; text-align: right;'

    const height = Settings.LINE_HEIGHT - 1
    this.keyframeButton = document.createElement('button')
    this.keyframeButton.innerHTML = '&#9672;'; // '&diams;' &#9671; 9679 9670 9672
    this.keyframeButton.style.cssText = 'background: none; font-size: 12px; padding: 0px; font-family: monospace; float: right; width: 20px; height: ' + height + 'px; border-style:none; outline: none;'; //  border-style:inset;

    this.keyframeButton.addEventListener('click', () => {
      dispatcher.fire('keyframe', layer, this.state.get('_value').value);
    });

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
    this.dom.appendChild(this.keyframeButton)

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
    this.keyframeButton.style.color = Theme.b
    const o = timeAtLayer(this.layer, s)

    if (!o) return

    if (o.keyframe) {
      this.keyframeButton.style.color = Theme.c
    }

    this.state.get('_value').value = o.value
    this.dispatcher.fire('target.notify', this.layer.name, o.value)
  }

  public setState(l: any, s: any) {
    this.label = l
    this.state = s

    const tmpValue = this.state.get('_value')
    if (tmpValue.value === undefined) {
      tmpValue.value = 0
    }

    this.label.textContent = this.state.get('name').value
  }
}
