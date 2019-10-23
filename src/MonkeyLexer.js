class Token {
  // 词法类型编号，词法标识符，行号
  constructor(type, literal, lineNumber) {
    this.tokenType = type
    this.literal = literal
    this.lineNumber = lineNumber
  }

  getType () {
    return this.tokenType
  }

  getLiteral () {
    return this.literal
  }

  getLineNumber () {
    return this.lineNumber
  }
}

// 词法解析器
class MonkeyLexer {
  // sourceCode代码文本
  constructor(sourceCode) {
    this.initTokenType()
    this.initKeywords()
    this.sourceCode = sourceCode
    this.positon = 0
    this.readPosition = 0
    this.lineCount = 0
    this.ch = ''  // 当前读取字符
    this.observer = null
    this.observerContext = null
  }

  initTokenType () {
    this.ILLEGAL = -2 // 非法字符
    this.EOF = -1 // 结束符
    this.LET = 0 // let关键字
    this.IDENTIFIER = 1 // 标识符
    this.EQUAL_SIGN = 2 // 等号
    this.PLUS_SIGN = 3 // 加号
    this.INTEGER = 4 // 整数
    this.SEMICOLON = 5 // 分号
    this.IF = 6 // if
    this.ELSE = 7 // else
  }

  initKeywords () {
    this.keyWordMap = []
    this.keyWordMap["let"] = new Token(this.LET, "let", 0)
    this.keyWordMap["if"] = new Token(this.IF, "if", 0)
    this.keyWordMap["ELSE"] = new Token(this.ELSE, "else", 0)
  }

  // 返回代码关键字对象
  getKeyWords () {
    return this.keyWordMap
  }

  // 观察者
  setLexingObserver (o, context) {
    if (o !== null && o !== undefined) {
      this.observer = o
      this.observerContext = context
    }
  }

  // 通知观察者
  notifyObserver (token) {
    this.observer.notifyTokenCreation(token, this.observerContext, this.positon - 1, this.readPosition)
  }

  // 读取字符，每次读取一个
  readChar () {
    if (this.readPosition >= this.sourceCode.length) {
      this.ch = -1
    } else {
      this.ch = this.sourceCode[this.readPosition]
    }
    this.readPosition++
  }

  // 忽略空格和换行
  skipWhiteSpaceAndNewLine () {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\u00a0') {
      if (this.ch === '\t' || this.ch === '\n') {
        this.lineCount++
      }
      this.readChar()
    }
  }

  nextToken () {
    let tok
    this.skipWhiteSpaceAndNewLine()
    const lineCount = this.lineCount
    let needReadChar = true
    this.positon = this.readPosition

    switch (this.ch) {
      case '=':
        tok = new Token(this.EQUAL_SIGN, "=", lineCount)
        break
      case ';':
        tok = new Token(this.SEMICOLON, ";", lineCount)
        break
      case '+':
        tok = new Token(this.PLUS_SIGN, "+", lineCount)
        break
      case -1:
        tok = new Token(this.EOF, "", lineCount)
        break
      default:
        let res = this.readIdentifier()
        if (res !== false) {
          if (this.keyWordMap[res] !== undefined) {
            tok = this.keyWordMap[res]
          } else {
            tok = new Token(this.IDENTIFIER, res, lineCount)
          }
        } else {
          res = this.readNumber()
          if (res !== false) {
            tok = new Token(this.INTEGER, res, lineCount)
          }
        }

        if (res === false) {
          tok = undefined
        }
        needReadChar = false
    }

    if (needReadChar === true) {
      this.readChar()
    }

    if (tok !== undefined) {
      this.notifyObserver(tok)
    }

    return tok
  }

  isLetter (ch) {
    return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || (ch === '_')
  }

  readIdentifier () {
    let identifier = ""
    while (this.isLetter(this.ch)) {
      identifier += this.ch
      this.readChar()
    }

    if (identifier.length > 0) {
      return identifier
    } else {
      return false
    }
  }

  idDigit (ch) {
    return '0' <= ch && ch <= '9'
  }

  readNumber () {
    let number = ""
    while (this.idDigit(this.ch)) {
      number += this.ch
      this.readChar()
    }
    if (number.length > 0) {
      return number
    } else {
      return false
    }
  }

  // 主函数
  lexing () {
    this.readChar()
    let tokens = []
    let token = this.nextToken()
    while (token !== undefined && token.getType() !== this.EOF) {
      console.log(token)
      tokens.push(token)
      token = this.nextToken()
    }
  }
}

export default MonkeyLexer