import React, { Component } from 'react'
import rangy from 'rangy'
import MonkeyLexer from './MonkeyLexer'

class MonkeyCompilerEditer extends Component {
  constructor(props) {
    super(props)
    this.keyWords = props.keyWords
    this.keyWordClass = 'keyword'
    this.keyWordElementArray = [] // 关键字元素数组
    this.discardedElementsArray = []
    this.onDivContentChange = this.onDivContentChange.bind(this)
    // rangy.init()
  }

  render () {
    let textAreaStyle = {
      height: 480,
      border: "1px solid black"
    }

    return (
      <div
        style={textAreaStyle}
        onKeyUp={this.onDivContentChange}
        ref={ref => { this.divInstance = ref }}
        contentEditable
      >
      </div>
    )
  }

  // 获取文本内容
  getContent () {
    return this.divInstance.innerText
  }

  changeNode (n) {
    // 深度优先查找，找到嵌套在最里层的文本
    const f = n.childNodes
    f.forEach(item => this.changeNode(item))
    // for (let c in f) {
    //   this.changeNode(f[c])
    // }

    if (n.data) {
      console.log(n.parentNode.innerHTML)
      this.lastBegin = 0
      n.keyWordCount = 0
      const lexer = new MonkeyLexer(n.data)
      // 设置观察者
      lexer.setLexingObserver(this, n)
      lexer.lexing()
    }
  }

  notifyTokenCreation (token, elementNode, begin, end) {
    if (this.keyWords[token.getLiteral()] !== undefined) {
      let e = {
        node: elementNode,
        begin,
        end,
        token
      }
      elementNode.keyWordCount++
      this.keyWordElementArray.push(e)
    }
  }

  // 关键字高亮,将关键字加上span并变绿色，关键字之间的内容转换为文本节点并替换空格，并将所有新的内容插入到原文本前
  highLightKeyWord (token, elementNode, begin, end) {
    let strBefore = elementNode.data.substr(this.lastBegin, begin - this.lastBegin)
    strBefore = this.changeSpaceToNBSP(strBefore)

    const textNode = document.createTextNode(strBefore)
    const parentNode = elementNode.parentNode
    parentNode.insertBefore(textNode, elementNode)

    // 在原关键字前插入新的高亮后的关键字
    let span = document.createElement('span')
    span.style.color = 'red'
    span.classList.add(this.keyWordClass)
    span.appendChild(document.createTextNode(token.getLiteral()))
    parentNode.insertBefore(span, elementNode)

    this.lastBegin = end - 1
    elementNode.keyWordCount--
    console.log(this.divInstance.innerHTML)
  }

  highLightSyntax () {
    for (let i = 0; i < this.keyWordElementArray.length; i++) {
      let e = this.keyWordElementArray[i]
      this.currentElement = e.node
      this.highLightKeyWord(e.token, e.node, e.begin, e.end)

      if (this.currentElement.keyWordCount === 0) {
        let end = this.currentElement.data.length
        let lastText = this.currentElement.data.substr(this.lastBegin, end)
        lastText = this.changeSpaceToNBSP(lastText)

        let parent = this.currentElement.parentNode
        let lastNode = document.createTextNode(lastText)
        // 在原文本前插入关键字之后的文本
        parent.insertBefore(lastNode, this.currentElement)
        // 移除原本的文本内容
        parent.removeChild(this.currentElement)
      }
    }
    this.keyWordElementArray = []
  }

  // 把空格转换成Unicode空格编码
  changeSpaceToNBSP (str) {
    let s = ""
    for (let i = 0; i < str.length; i++) {
      if (str[i] === ' ') {
        s += '\u00a0'
      } else {
        s += str[i]
      }
    }
    return s
  }

  // 编辑框内容改变时做预处理，
  onDivContentChange (evt) {
    if (evt.key === 'Enter' || evt.key === '') {
      return
    }

    // 记录光标位置
    let bookmark
    if (evt.key !== 'Enter') {
      bookmark = rangy.getSelection().getBookmark(this.divInstance)
    }

    // 将原有的span标签恢复成text以便后续合并
    let spans = document.getElementsByClassName(this.keyWordClass)
    while (spans.length) {
      let p = spans[0].parentNode
      let t = document.createTextNode(spans[0].innerText)
      p.insertBefore(t, spans[0])
      p.removeChild(spans[0])
    }

    // 把所有相邻的textNode合并成一个,防止出现如llet的解析问题
    this.divInstance.normalize()
    this.changeNode(this.divInstance)
    this.highLightSyntax()

    // 恢复光标位置
    if (evt.key !== 'Enter') {
      rangy.getSelection().moveToBookmark(bookmark)
    }
  }
}

export default MonkeyCompilerEditer
