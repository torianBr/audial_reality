import React, { Component } from 'react'

import { each, pull } from 'lodash'

const initWebGL = canvas => {
  // Try to grab the standard context. If it fails, fallback to experimental.
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.') //eslint-disable-line no-alert
  }
  
  return gl
}

export default class Scene extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount() {
    const gl = initWebGL(this.canvas)

    this.gl = gl
    this.childDraws = []

    
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // Clear the color as well as the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST)
    
    this.draw()

    this.setState({
      glLoaded: true
    })
  }

  getChildContext() {
    return { 
      gl: this.gl, 
      registerChildDraw: fn => this.registerChildDraw(fn),
      unregisterChildDraw: fn => this.unregisterChildDraw(fn)
    }
  }

  draw() {
    const gl = this.gl

    gl.enable(gl.DEPTH_TEST)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, this.props.width, this.props.height)

    each(this.childDraws, draw => draw(this.gl))

    const error = gl.getError()
    if (error !== 0)
      console.log('error:', error)

    window.requestAnimationFrame(() => this.draw())
  }

  registerChildDraw(fn) {
    this.childDraws.push(fn)
  }

  unregisterChildDraw(fn) {
    pull(this.childDraws, fn)
  }

  render() {
    return (
      <div>
        <canvas width={this.props.width} height={this.props.height} ref={canvas => { this.canvas = canvas }} />
        {this.state.glLoaded && this.props.children}
      </div>
    )
  }
}

Scene.childContextTypes = {
  gl: React.PropTypes.object,
  registerChildDraw: React.PropTypes.func,
  unregisterChildDraw: React.PropTypes.func.isRequired
}


