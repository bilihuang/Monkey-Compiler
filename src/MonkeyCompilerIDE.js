import React, { Component } from 'react'
import * as bootstrap from 'react-bootstrap'
import MonkeyLexer from './MonkeyLexer'
import MonkeyCompilerEditer from './MonkeyCompilerEditer'
import MonkeyCompilerParser from './MonkeyCompilerParser'
import MonkeyEvaluator from './MonkeyEvaluator'

class MonkeyCompilerIDE extends Component {

  constructor(props) {
    super(props)
    // 先创建一个空的解释器实例以方便创建编辑器实例时将keyWords传入
    this.lexer = new MonkeyLexer("")
    this.evaluator = new MonkeyEvaluator()
    this.onLexingClick = this.onLexingClick.bind(this)
  }

  onLexingClick () {
    this.lexer = new MonkeyLexer(this.inputInstance.getContent())
    this.parser = new MonkeyCompilerParser(this.lexer)
    this.parser.parseProgram()
    this.program = this.parser.program
    // for (let i = 0; i < this.program.statements.length; i++) {
    //   console.log(this.program.statements[i].getLiteral())
    //   // 执行代码
    //   this.evaluator.evaluate(this.program.statements[i])
    // }
    this.evaluator.evaluate(this.program)
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