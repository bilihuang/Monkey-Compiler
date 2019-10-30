import React, { Component } from 'react'
import rangy from 'rangy'
import MonkeyLexer from './MonkeyLexer'
import * as bootstrap from 'react-bootstrap'

class MonkeyCompilerEditer extends Component {
  constructor(props) {
    super(props)
    this.keyWords = props.keyWords
    this.keyWordClass = 'keyword'
    this.keyWordElementArray = [] // 关键字元素数组
    this.lineSpanNode = 'LineSpan'
    this.lineNodeClass = 'line'
    this.identifierClass = 'Identifier'
    this.identifierElementArray = [] // 标识符元素数组
    this.textNodeArray = [] // 文本节点数组
    this.spanToTokenMap = {}
    this.keyToIngore = ["Enter", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

    this.state = {
      popover: false,
      popoverStyle: {
        placement: "right",
        positionLeft: -100,
        positionTop: -100,
        title: "",
        content: ""
      }
    }

    // this.initLineNumberStyle()

    this.onDivContentChange = this.onDivContentChange.bind(this)
    this.showPopover = this.showPopover.bind(this)
    this.handleIdentifierOnMouseOver = this.handleIdentifierOnMouseOver.bind(this)
    this.handleIdentifierOnMouseOut = this.handleIdentifierOnMouseOut.bind(this)
    // rangy.init()
  }

  render () {
    const textAreaStyle = {
      height: 480,
      padding: "5px",
      border: "1px solid black",
      borderRadius: "5px"
    }

    return (
      <div>
        <div
          style={textAreaStyle}
          onKeyUp={this.onDivContentChange}
          ref={ref => { this.divInstance = ref }}
          contentEditable
        >
        </div>
        {this.showPopover()}
      </div>
    )
  }

  // 初始化行号样式
  initLineNumberStyle () {
    let ruleClass = `span.${this.lineSpanNode}:before`
    let rule = 'counter-increment: line;content: counter(line);display: inline-block;'
    rule += 'border-right: 1px solid #ddd;padding: 0 .5em;'
    rule += 'margin-right: .5em;color: #666;'
    rule += 'pointer-events:all;'
    document.styleSheets[1].addRule(ruleClass, rule)
  }

  // 展示取词信息弹框
  showPopover () {
    const { popover, popoverStyle } = this.state
    if (popover) {
      return (
        <bootstrap.Popover
          placement={popoverStyle.placement}
          positionLeft={popoverStyle.positionLeft}
          positionTop={popoverStyle.positionTop}
          title={popoverStyle.title}
          id="identifier-show">
          {popoverStyle.content}
        </bootstrap.Popover>
      )
    } else {
      return
    }
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
      // console.log(n.parentNode.innerHTML)
      this.lastBegin = 0
      n.keyWordCount = 0
      n.identifierCount = 0
      const lexer = new MonkeyLexer(n.data)
      this.lexer = lexer
      // 设置观察者
      lexer.setLexingObserver(this, n)
      lexer.lexing()
    }
  }

  notifyTokenCreation (token, elementNode, begin, end) {
    let e = {
      node: elementNode,
      begin,
      end,
      token
    }
    if (this.keyWords[token.getLiteral()] !== undefined) {
      elementNode.keyWordCount++
      this.keyWordElementArray.push(e)
    }

    if (elementNode.keyWordCount === 0 && token.getType() === this.lexer.IDENTIFIER) {
      elementNode.identifierCount++
      this.identifierElementArray.push(e)
    }
  }

  // 关键字高亮,将关键字加上span并变绿色，关键字之间的内容转换为文本节点并替换空格，并将所有新的内容插入到原文本前
  highLightKeyWord (token, elementNode, begin, end) {
    let strBefore = elementNode.data.substr(this.lastBegin, begin - this.lastBegin)
    strBefore = this.changeSpaceToNBSP(strBefore)

    const textNode = document.createTextNode(strBefore)
    const parentNode = elementNode.parentNode
    parentNode.insertBefore(textNode, elementNode)

    this.textNodeArray.push(textNode)

    // 在原关键字前插入新的高亮后的关键字
    let span = document.createElement('span')
    span.style.color = '#FF4500'
    span.classList.add(this.keyWordClass)
    span.appendChild(document.createTextNode(token.getLiteral()))
    parentNode.insertBefore(span, elementNode)

    this.lastBegin = end - 1
    elementNode.keyWordCount--
    // console.log(this.divInstance.innerHTML)
  }

  highLightSyntax () {
    this.textNodeArray = []

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

        // 解析最后一个节点，这样可以为关键字后面的变量字符串设立popover控件
        this.textNodeArray.push(lastNode)
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
    if (this.keyToIngore.indexOf(evt.key) >= 0) {
      return
    }

    // 记录光标位置
    let bookmark
    if (evt.key !== 'Enter') {
      bookmark = rangy.getSelection().getBookmark(this.divInstance)
    }

    let currentLine = this.getCurrentLineNode()
    for (let i = 0; i < currentLine.childNodes.length; i++) {
      if (currentLine.childNodes[i].className === this.keyWordClass || currentLine.childNodes[i].className === this.identifierClass) {
        let child = currentLine.childNodes[i]
        let t = document.createTextNode(child.innerText)
        currentLine.replaceChild(t, child)
      }
    }

    // 把所有相邻的textNode合并成一个,防止出现如llet的解析问题
    currentLine.normalize()

    this.identifierElementArray = []
    // 只将这一行编译处理
    this.changeNode(currentLine)
    this.highLightSyntax()
    this.preparePopoverForIdentifiers()

    // 恢复光标位置
    if (evt.key !== 'Enter') {
      rangy.getSelection().moveToBookmark(bookmark)
    }
  }

  // 获取当前行节点
  getCurrentLineNode () {
    let sel = document.getSelection()

    // 获得光标所在行的node对象
    let nd = sel.anchorNode

    //查看其父节点是否是span,如果不是，
    //我们插入一个span节点用来表示光标所在的行
    let currentLineSpan = null
    let elements = document.getElementsByClassName(this.lineSpanNode)

    for (let i = 0; i < elements.length; i++) {
      let element = elements[i]
      if (element.contains(nd)) {
        currentLineSpan = element
      }
      while (element.classList.length) {
        element.classList.remove(element.classList.item(0))
      }
      element.classList.add(this.lineSpanNode)
      element.classList.add(this.lineNodeClass + i)
    }

    if (currentLineSpan !== null) {
      return currentLineSpan
    }

    //计算一下当前光标所在节点的前面有多少个div节点，
    //前面的div节点数就是光标所在节点的行数
    let divElements = this.divInstance.childNodes;
    let l = 0;
    for (let i = 0; i < divElements.length; i++) {
      if (divElements[i].tagName === 'DIV' &&
        divElements[i].contains(nd)) {
        l = i;
        break;
      }
    }

    let spanNode = document.createElement('span')
    spanNode.classList.add(this.lineSpanNode)
    spanNode.classList.add(this.lineNodeClass + l)

    spanNode.dataset.lineNum = l 

    nd.parentNode.replaceChild(spanNode, nd)
    spanNode.appendChild(nd)
    return spanNode
  }

  // 鼠标移入到变量上事件
  handleIdentifierOnMouseOver (e) {
    e.currentTarget.isOver = true
    let token = e.currentTarget.token
    const popoverStyle = {
      positionLeft: e.clientX + 5,
      positionTop: e.currentTarget.offsetTop - e.currentTarget.offsetHeight,
      title: "Syntax",
      content: `name:${token.getLiteral()} Type:${token.getType()} Line:${e.target.parentNode.classList[1]}`
    }
    this.setState({
      popover: true,
      popoverStyle
    })
  }

  // 鼠标移出变量事件
  handleIdentifierOnMouseOut (e) {
    this.setState({
      popover: false
    })
  }

  // 给变量标识符添加span标签方便屏幕取词实现
  addPopoverSpanToIdentifier (token, elementNode, begin, end) {
    let strBefore = elementNode.data.substr(this.lastBegin, begin - this.lastBegin)
    strBefore = this.changeSpaceToNBSP(strBefore)

    const textNode = document.createTextNode(strBefore)
    const parentNode = elementNode.parentNode
    parentNode.insertBefore(textNode, elementNode)

    let span = document.createElement('span')
    span.onmouseenter = this.handleIdentifierOnMouseOver
    span.onmouseleave = this.handleIdentifierOnMouseOut
    span.classList.add(this.identifierClass)
    span.appendChild(document.createTextNode(token.getLiteral()))
    span.token = token
    parentNode.insertBefore(span, elementNode)
    this.lastBegin = end - 1
    elementNode.identifierCount--
  }

  //该函数的逻辑跟hightLightSyntax类似
  addPopoverByIdentifierArray () {
    for (let i = 0; i < this.identifierElementArray.length; i++) {
      //用 span 将每一个变量包裹起来，这样鼠标挪上去时就可以弹出popover控件
      const e = this.identifierElementArray[i]
      this.currentElement = e.node
      //找到每个IDENTIFIER类型字符串的起始和末尾，给他们添加span标签
      this.addPopoverSpanToIdentifier(e.token, e.node, e.begin, e.end)

      if (this.currentElement.identifierCount === 0) {
        let end = this.currentElement.data.length
        let lastText = this.currentElement.data.substr(this.lastBegin, end)
        lastText = this.changeSpaceToNBSP(lastText)

        let parent = this.currentElement.parentNode
        let lastNode = document.createTextNode(lastText)
        parent.insertBefore(lastNode, this.currentElement)
        parent.removeChild(this.currentElement)
      }
    }
    this.identifierElementArray = []
  }

  // 屏幕取词功能预先处理
  preparePopoverForIdentifiers () {
    if (this.textNodeArray.length) {
      for (let i = 0; i < this.textNodeArray.length; i++) {
        this.changeNode(this.textNodeArray[i])
        this.addPopoverByIdentifierArray()
      }
      this.textNodeArray = []
    } else {
      this.addPopoverByIdentifierArray()
    }
  }
}

export default MonkeyCompilerEditer
