import { ILayer, IRawData } from './IInterface'
import DataStore from './lib/dataStore'
import Dispatcher from './lib/dispatcher'
import TimelinePanel from './paint/panel'
import LayerPanel from './paint/layerCanbinet'
import ScrollBar from './paint/ui_scrollbar'
import Settings from './default'
import { findTimeInLayer, style, calculateDuration } from './lib/utils'
import Theme from './theme'

const header_styles = {
  position: 'absolute',
  top: '0px',
  width: '100%',
  height: '22px',
  lineHeight: '22px',
  overflow: 'hidden'
};

interface ITimelineConfig {
  containerId: string
  data: IRawData
}

export default class TimeLine {
  private data: DataStore
  private dispatcher: Dispatcher
  private timelinePanel: TimelinePanel
  private layers: any
  private scrollBar: ScrollBar
  private startPlay: number | null
  private isPlaying: boolean = false
  private playedFrom: number
  // private needResize = true
  private containerDiv: HTMLDivElement
  private layerPanel: LayerPanel
  private paneDiv: HTMLDivElement
  private paneTitleDiv: HTMLDivElement
  private topRightBarDiv: HTMLDivElement

  constructor(config: ITimelineConfig) {
    const hostContainer = document.getElementById(config.containerId)
    if (!hostContainer) {
      console.log('containerId does not find any dom')
      return;
    }
    this.data = new DataStore()
    this.dispatcher = this.initDispatcher()
    this.loadData(config.data)
    calculateDuration(config.data.layers, this.data)

    this.timelinePanel = new TimelinePanel(this.data, this.dispatcher)
    this.layerPanel = new LayerPanel(this.data, this.dispatcher)

    this.layers = this.data.get('layers').value
    this.scrollBar = new ScrollBar(10, 200)

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

    this.topRightBarDiv = document.createElement('div')
    style(this.topRightBarDiv, header_styles, {
      textAlign: 'right'
    })

    this.paneTitleDiv.appendChild(this.topRightBarDiv)
    this.paneDiv.appendChild(this.containerDiv)
    this.paneDiv.appendChild(this.paneTitleDiv)

    this.containerDiv.appendChild(this.layerPanel.dom)
    this.containerDiv.appendChild(this.timelinePanel.dom)

    this.paint()
    this.updateState()

    hostContainer.appendChild(this.paneDiv)
  }

  public addLayer(layer: ILayer) {
    this.layers.push(layer)
    this.data.get('layers').value = this.layers
    calculateDuration(this.layers, this.data)
    this.updateState()
    this.layerPanel.rangeUpdate()
  }

  private loadData(data: any) {
    this.data.setJSON(data)
    if (this.data.getValue('ui') === undefined) {
      this.data.setValue('ui', {
        currentTime: 0,
				totalTime: Settings.default_length,
				scrollTime: 0,
				timeScale: this.data.get('ui:timeScale').value || Settings.time_scale,
      })
    }
  }

  private updateState() {
    const layerStore = this.data.get('layers')
    this.layerPanel.setState(layerStore)
    this.timelinePanel.setState(layerStore)
    this.repaintAll()
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
    }, this)

    dispatcher.on('value.change', (layer: any) => {
      if (layer._mute) return

      const t = this.data.get('ui:currentTime').value
      const v = findTimeInLayer(layer, t)

      if (typeof(v) === 'number') {
        layer.values.splice(v, 0, {
          time: t,
          _color: '#' + (Math.random() * 0xffffff | 0).toString(16)
        });
      }

      this.repaintAll()
    }, this)

    dispatcher.on('action:finish', (currentTime: number) => {
      const layerMax = this.data.get('ui:layerMax').value
      for (let i = 0; i < layerMax.length; i++) {
        if (currentTime >= layerMax[i]) {
          this.layers[i]._finish = true
        } else {
          this.layers[i]._finish = false
        }
      }
    }, this)

    dispatcher.on('controls.toggle_play', () => {
      if (this.isPlaying) {
        this.pausePlaying()
      } else {
        this.startPlaying()
      }
    }, this)

    dispatcher.on('controls.restart_play', () => {
      if (!this.isPlaying) {
        this.startPlaying()
      }

      this.setCurrentTime(this.playedFrom)
    }, this)

    dispatcher.on('controls.play', this.startPlaying, this)
    dispatcher.on('controls.pause', this.pausePlaying, this)

    dispatcher.on('controls.stop', () => {
      if (this.isPlaying) this.pausePlaying()
      this.setCurrentTime(0)
    }, this)

    dispatcher.on('time.update', this.setCurrentTime, this)

    dispatcher.on('update.scrollTime', (v: number) => {
      this.data.get('ui:scrollTime').value = Math.max(0, v)
      this.repaintAll()
    }, this)

    dispatcher.on('update.scale', (v: any) => {
      const maxEnd = this.data.get('ui:maxEnd').value
      const timeScale = 60 * (10 / maxEnd)
      this.data.get('ui:timeScale').value = v * timeScale;
      this.timelinePanel.repaint();
    }, this);

    return dispatcher
  }

  public setCurrentTime(value: number) {
    this.data.get('ui:currentTime').value =
      Math.min(Math.max(0, value), this.data.get('ui:maxEnd').value)

    this.dispatcher.fire('action:finish', value)
    if (this.isPlaying) {
      this.startPlay = performance.now() - value * 1000
    }
    this.repaintAll()
  }

  public startPlaying() {
    if (!this.isPlaying && this.startPlay === this.data.get('ui:maxEnd').value) {
      this.setCurrentTime(0)
    }
    this.startPlay = performance.now() - this.data.get('ui:currentTime').value * 1000
    this.isPlaying = true
    this.layerPanel.setControlStatus(true)
  }

  public pausePlaying() {
    this.isPlaying = false
    this.layerPanel.setControlStatus(false)
  }

  public repaintAll() {
    const contentHeight = this.layers.length * Settings.LINE_HEIGHT
    this.scrollBar.setLength(Settings.TIMELINE_SCROLL_HEIGHT / contentHeight)
    this.layerPanel.repaint()
    this.timelinePanel.repaint()
  }

  public paint() {
    requestAnimationFrame(this.paint.bind(this))

    if (this.isPlaying && this.startPlay) {
      let t = (performance.now() - this.startPlay) / 1000

      if (t >= this.data.get('ui:maxEnd').value) {
        this.startPlay = this.data.get('ui:maxEnd').value
        this.isPlaying = false
        this.layerPanel.setControlStatus(false)
        t = this.data.get('ui:maxEnd').value
      }
      this.setCurrentTime(t)
    }

    // if (this.needResize) {
    //   this.containerDiv.style.width = Settings.width + 'px'
    //   this.containerDiv.style.height = Settings.height + 'px'

    //   this.restyle(this.layerPanel.dom, this.timelinePanel.dom)

    //   this.timelinePanel.resize()
    //   this.repaintAll()
    //   this.needResize = false
    //   this.dispatcher.fire('resize')
    // }

    this.timelinePanel.paint()
  }

  // public restyle(left: HTMLElement, right: HTMLElement) {
  //   left.style.cssText = 'position: absolute; left: 0px; top: 0px; height: ' + Settings.height + 'px;'
  //   style(left, {
  //     overflow: 'hidden'
  //   })
  //   left.style.width = Settings.LEFT_PANE_WIDTH + 'px'
  //   right.style.position = 'absolute'
  //   right.style.top = '0px'
  //   right.style.left = Settings.LEFT_PANE_WIDTH + 'px'
  // }

  // public resize(width: number, height: number) {
  //   const w = width - 4
  //   const h = height - 44

  //   Settings.width = w - Settings.LEFT_PANE_WIDTH
  //   Settings.height = h

  //   Settings.TIMELINE_SCROLL_HEIGHT = h - Settings.MARKER_TRACK_HEIGHT
  //   const scrollableHeight = Settings.TIMELINE_SCROLL_HEIGHT
  //   this.scrollBar.setHeight(scrollableHeight - 2)

  //   style(this.scrollBar.dom, {
  //     top: Settings.MARKER_TRACK_HEIGHT + 'px',
  //     left: (w - 16) + 'px'
  //   })
  // }

  public setTarget(t: any) {
    this.timelinePanel = t
  }
}
