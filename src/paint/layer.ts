import Theme from '../theme'
import Settings from '../default'
import { style } from '../lib/utils'

export default class LayerView {
  public dom: HTMLDivElement
  private label: HTMLSpanElement
  private progressHint: HTMLSpanElement
  private state: any

  constructor() {
    this.dom = document.createElement('div')
    this.label = document.createElement('span')
    this.progressHint = document.createElement('span')
    this.state = {
      _finish: null,
      status: '',
    }

    style(this.label, {
      fontSize: '10px',
      width: '60px',
      height: (Settings.LINE_HEIGHT - 1) + 'px',
      lineHeight: (Settings.LINE_HEIGHT - 1) + 'px',
      margin: 0,
      float: 'left',
      textAlign: 'center',
    })

    style(this.progressHint, {
      fontSize: '10px',
      width: '60px',
      height: (Settings.LINE_HEIGHT - 1) + 'px',
      lineHeight: (Settings.LINE_HEIGHT - 1) + 'px',
      margin: 0,
      float: 'right',
      textAlign: 'center',
    })

    this.dom.appendChild(this.label)
    this.dom.appendChild(this.progressHint)

    style(this.dom, {
      textAlign: 'left',
      margin: '0px 0px 0px 5px',
      borderBottom: '1px solid ' + Theme.b,
      top: 0,
      left: 0,
      height: (Settings.LINE_HEIGHT - 1) + 'px',
      color: Theme.c,
    })
  }

  public setState(s: any) {
    const newVal = s.value
    if (this.state._finish !== newVal._finish) {
      if (newVal._finish) {
        this.progressHint.textContent = 'finish'
      } else {
        this.progressHint.textContent = 'playing'
      }
    }

    if (this.state.status !== newVal.name) {
      this.label.textContent = newVal.name
    }

    this.state = {
      _finish: newVal._finish,
      status: newVal.name,
    }
  }
}
