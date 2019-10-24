/* eslint-disable no-useless-constructor */
import React, { Component } from 'react'
import * as bootstrap from 'react-bootstrap'
import MonkeyLexer from './MonkeyLexer'
import MonkeyCompilerEditer from './MonkeyCompilerEditer'

class MonkeyCompilerIDE extends Component {

  constructor(props) {
    super(props)
    // 先创建一个空的解释器实例以方便创建编辑器实例时将keyWords传入
    this.lexer = new MonkeyLexer("")
    this.onLexingClick = this.onLexingClick.bind(this)
  }

  onLexingClick () {
    this.lexer = new MonkeyLexer(this.inputInstance.getContent())
    this.lexer.lexing()
  }

  render () {
    return (
      <bootstrap.Panel bsStyle="success">
        <bootstrap.Panel.Heading>Monkey Compiler</bootstrap.Panel.Heading>
        <bootstrap.Panel.Body>
          <MonkeyCompilerEditer
            ref={ref => { this.inputInstance = ref }}
            keyWords={this.lexer.getKeyWords()}
          />
          <bootstrap.Button bsStyle="primary" style={{ marginTop: 15 }} onClick={this.onLexingClick}>
            编译
          </bootstrap.Button>
        </bootstrap.Panel.Body>
      </bootstrap.Panel>
    )
  }
}

export default MonkeyCompilerIDE