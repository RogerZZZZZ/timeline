/**
 * @class ExampleComponent
 */

import * as React from 'react'
import styles from './styles.css'
import Timeline from './timeline'

export type Props = { text: string }

export default class ExampleComponent extends React.Component<Props> {
  componentDidMount() {
    new Timeline({
      containerId: 'timeline'
    })
  }

  render() {
    const {
      text
    } = this.props

    return (
      <div className={styles.test}>
        Example Component: {text}
        <div id='timeline' />
      </div>
    )
  }
}
