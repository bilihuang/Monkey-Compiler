/* eslint-disable no-useless-constructor */
import React, { Component } from 'react'
import * as bootstrap from 'react-bootstrap'
import MonkeyLexer from './MonkeyLexer'

class MonkeyCompilerIDE extends Component {

  constructor(props) {
    super(props)
    this.onLexingClick=this.onLexingClick.bind(this)
    this.state={
      textAreaValue:''
    }
  }

  onLexingClick () {
    this.lexer = new MonkeyLexer(this._textAreaControl.value)
    this.lexer.lexing()
  }

  render () {
    let textAreaStyle = {
      height: 480
    }
    return (
      <bootstrap.Panel bsStyle="success">
        <bootstrap.Panel.Heading>Monkey Compiler</bootstrap.Panel.Heading>
        <bootstrap.Panel.Body>
          <bootstrap.FormControl
            componentClass="textarea"
            style={textAreaStyle} 
            placeholder="Enter your code" 
            inputRef={
            ref => { this._textAreaControl = ref }
          }></bootstrap.FormControl>
          <bootstrap.Button bsStyle="primary" style={{ marginTop: 15 }} onClick={this.onLexingClick}>
            Lexing
          </bootstrap.Button>
        </bootstrap.Panel.Body>
      </bootstrap.Panel>
    )
  }
}

export default MonkeyCompilerIDE