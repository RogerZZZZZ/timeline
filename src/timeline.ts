import DataStore from './lib/data-store'
import Dispatcher from './lib/dispatcher'
import TimelinePanel from './paint/panel'
import LayerPanel from './paint/layerCanbinet'
import ScrollBar from './paint/scrollbar'
import Settings from './default'
import { findTimeInLayer, style, timeAtLayer } from './lib/utils'
import Theme from './theme'

const header_styles = {
  position: 'absolute',
  top: '0px',
  width: '100%',
  height: '22px',
  lineHeight: '22px',
  overflow: 'hidden'
};

const button_styles = {
  width: '20px',
  height: '20px',
  padding: '2px',
  marginRight: '2px'
};

class LayerProp {
  private name: string
  private values: any = []
  private _value = 0
  private _color: string

  constructor(name: string) {
    this.name = name
    this._color = `#${(Math.random() * 0xffffff | 0 ).toString(16)}`
  }
}

export default class TimeLine {
  private data: DataStore
  private dispatcher: Dispatcher
  private timelinePanel: TimelinePanel
  private layers: any
  private scrollBar: ScrollBar
  private startPlay: number | null
  private playedFrom: number
  private needResize = true
  private containerDiv: HTMLDivElement
  private layerPanel: LayerPanel
  private paneDiv: HTMLDivElement
  private paneTitleDiv: HTMLDivElement
  private titleBarDiv: HTMLSpanElement
  private topRightBarDiv: HTMLDivElement
  private root: any

  constructor() {
    this.data = new DataStore()
    this.dispatcher = this.initDispatcher()

    this.timelinePanel = new TimelinePanel(this.data, this.dispatcher)
    this.layerPanel = new LayerPanel(this.data, this.dispatcher)

    this.layers = this.data.get('layers').value
    this.scrollBar = new ScrollBar(200, 100)

    this.containerDiv = document.createElement('div')
    this.containerDiv.style.cssText = 'position: absolute;'
    this.containerDiv.style.top = '22px'

    this.paneDiv = document.createElement('div')
    style(this.paneDiv, {
      position: 'fixed',
      top: '20px',
      left: '20px',
      margin: 0,
      border: '1px solid ' + Theme.a,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: Theme.a,
      color: Theme.d,
      zIndex: 999,
      fontFamily: 'monospace',
      fontSize: '12px'
    })

    this.paneTitleDiv = document.createElement('div')
    style(this.paneTitleDiv, header_styles, {
      borderBottom: '1px solid ' + Theme.b,
      textAlign: 'center',
    })

    this.titleBarDiv = document.createElement('span')
    this.titleBarDiv.innerHTML = 'Timeline'
    this.paneTitleDiv.appendChild(this.titleBarDiv)

    this.topRightBarDiv = document.createElement('div')
    style(this.topRightBarDiv, header_styles, {
      textAlign: 'right'
    })

    this.paneTitleDiv.appendChild(this.topRightBarDiv)
    this.paneDiv.appendChild(this.containerDiv)
    this.paneDiv.appendChild(this.paneTitleDiv)

    this.root = document.createElement('timeliner')
    document.body.appendChild(this.root)
    if (this.root.createShadowRoot) this.root = this.root.createShadowRoot()

    this.root.appendChild(this.paneDiv)
    this.containerDiv.appendChild(this.layerPanel.dom)
    this.containerDiv.appendChild(this.timelinePanel.dom)
    this.containerDiv.appendChild(this.scrollBar.dom)

    this.scrollBar.onScrollEvents.push((type: string, scrollTo: number) => {
      switch(type) {
        case 'scrollto':
          this.layerPanel.scrollTo(scrollTo)
          this.timelinePanel.scrollTo(scrollTo)
          break;
        default:
          break;
      }
    })

    this.paint()
  }

  private initDispatcher() {
    const dispatcher = new Dispatcher()

    dispatcher.on('keyframe', (layer: any, value: any) => {
      const t = this.data.get('ui:currentTime').value
      const v = findTimeInLayer(layer, t)

      if (typeof(v) === 'number') {
        layer.values.splice(v, 0, {
          time: t,
          value: value,
          _color: '#' + (Math.random() * 0xffffff | 0).toString(16),
        })
      } else {
        layer.values.splice(v.index, 1)
      }
      this.repaintAll()
    })

    dispatcher.on('value.change', (layer: any, value: any, dontSize: boolean) => {
      if (layer._mute) return

      const t = this.data.get('ui:currentTime').value
      const v = findTimeInLayer(layer, t)

      if (typeof(v) === 'number') {
        layer.values.splice(v, 0, {
          time: t,
          value: value,
          _color: '#' + (Math.random() * 0xffffff | 0).toString(16)
        });
      } else {
        v.object.value = value
      }

      this.repaintAll()
    })

    dispatcher.on('action:solo', (layer: any, solo: any) => {
      layer._solo = solo;

      console.log(layer, solo);

      // When a track is solo-ed, playback only changes values
      // of that layer.
    });

    dispatcher.on('action:mute', (layer: any, mute: boolean) => {
      layer._mute = mute;

      // When a track is mute, playback does not play
      // frames of those muted layers.

      // also feels like hidden feature in photoshop

      // when values are updated, eg. from slider,
      // no tweens will be created.
      // we can decide also to "lock in" layers
      // no changes to tween will be made etc.
    });

    //TODO
    dispatcher.on('ease', (layer: any, ease_type: string) => {
      // var t = this.data.get('ui:currentTime').value;
      // var v = utils.timeAtLayer(layer, t);
      // if (v && v.entry) {
      //   v.entry.tween  = ease_type;
      // }

      // // undo_manager.save(new UndoState(data, 'Add Ease'));
      // this.repaintAll();
    });

    dispatcher.on('controls.toggle_play', () => {
      if (this.startPlay) {
        this.pausePlaying()
      } else {
        this.startPlaying()
      }
    })

    dispatcher.on('controls.restart_play', () => {
      if (!this.startPlay) {
        this.startPlaying()
      }

      this.setCurrentTime(this.playedFrom)
    })

    dispatcher.on('controls.play', this.startPlaying)
    dispatcher.on('controls.pause', this.pausePlaying)

    dispatcher.on('controls.stop', () => {
      if (this.startPlay !== null) this.pausePlaying()

      // layer_panel.setCon
    })

    dispatcher.on('time.update', this.setCurrentTime)

    dispatcher.on('update.scrollTime', (v: number) => {
      this.data.get('ui:scrollTime').value = Math.max(0, v)
      this.repaintAll()
    })

    dispatcher.on('target.notify', (name: string, value: any) => {
      // TODO target
    })

    dispatcher.on('update.scale', (v: any) => {
      this.data.get('ui:timeScale').value = v;

      this.timelinePanel.repaint();
    });

    return dispatcher
  }

  public setCurrentTime(value: number) {
    this.data.get('ui:currentTime').value = Math.max(0, value)

    if (this.startPlay) {
      this.startPlay = performance.now() - value * 1000
    }
    this.repaintAll()
  }

  public startPlaying() {
    this.startPlay = performance.now() - this.data.get('ui:currentTime').value * 1000

  }

  public pausePlaying() {
    this.startPlay = null
  }

  public repaintAll() {
    const contentHeight = this.layers.length * Settings.LINE_HEIGHT
    this.scrollBar.setLength(Settings.TIMELINE_SCROLL_HEIGHT / contentHeight)

    this.layerPanel.repaint()
    this.timelinePanel.repaint()
  }

  public paint() {
    requestAnimationFrame(this.paint)

    if (this.startPlay) {
      const t = (performance.now() - this.startPlay) / 1000
      this.setCurrentTime(t)

      if (t > this.data.get('ui:totalTime').value) {
        this.startPlay = performance.now()
      }
    }

    if (this.needResize) {
      this.containerDiv.style.width = Settings.width + 'px'
      this.containerDiv.style.height = Settings.height + 'px'

      this.restyle(this.layerPanel.dom, this.timelinePanel.dom)

      this.timelinePanel.resize()
      this.repaintAll()
      this.needResize = false
      this.dispatcher.fire('resize')
    }

    this.timelinePanel.paint()
  }

  public restyle(left: HTMLElement, right: HTMLElement) {
    left.style.cssText = 'position: absolute; left: 0px; top: 0px; height: ' + Settings.height + 'px;'
    style(left, {
      overflow: 'hidden'
    })
    left.style.width = Settings.LEFT_PANE_WIDTH + 'px'

    right.style.position = 'absolute'
    right.style.top = '0px'
    right.style.left = Settings.LEFT_PANE_WIDTH + 'px'
  }

  public addLayer(name: string) {
    const layer = new LayerProp(name)
    this.layers.push(layer)
    this.layerPanel.setState(this.data.get('layers'))
  }

  public resize(width: number, height: number) {
    // TODO
  }

  public setTarget(t: any) {
    this.timelinePanel = t
  }

  public getValueRange(ranges: number, interval: number) {
    const i = interval || 0.15
    const r = ranges || 2
    const t = this.data.get('ui:currentTime').value
    const values = []
    for (let u = -r; u <= r; u++) {
      const o = {}
      for (let j = 0; j < this.layers.length; j++) {
        const layer = this.layers[j]
        const m: any = timeAtLayer(layer, t + u * i)
        o[layer.name] = m.value
      }
      values.push(o)
    }
    return values
  }
}

