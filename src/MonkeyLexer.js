class Token {
  // 词法类型编号，词法标识符，行号
  constructor(type, literal, lineNumber) {
    this.tokenType = type
    this.literal = literal
    this.lineNumber = lineNumber
  }

  type () {
    return this.tokenType
  }

  literal () {
    return this.literal
  }

  lineNumber () {
    return this.lineNumber
  }
}

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
  }

  initTokenType () {
    this.ILLGAL = -2
    this.EOF = -1
    this.LET = 0
    this.IDENTIFIER = 1
    this.EQUAL_SIGN = 2
    this.PLUS_SIGN = 3
    this.INTEGER = 4
    this.SEMICOLON = 5
    this.IF = 6
    this.ELSE = 7
  }

  initKeywords () {
    this.keyWordMap = []
    this.keyWordMap["let"] = new Token(this.LET, "let", 0)
    this.keyWordMap["if"] = new Token(this.IF, "if", 0)
    this.keyWordMap["ELSE"] = new Token(this.ELSE, "else", 0)
  }

  // 读取字符，每次读取一个
  readChar () {
    if (this.readPosition >= this.sourceCode.length) {
      this.ch = 0
    } else {
      this.ch = this.sourceCode[this.readPosition]
    }
    this.positon = this.readPosition
    this.readPosition++
  }

  // 忽略空格和换行
  skipWhiteSpaceAndNewLine () {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n') {
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
      case 0:
        tok = new Token(this.EOF, "", lineCount)
        break
      default:
        let res = this.readIdentifier()
        if (res !== false) {
          if(this.keyWordMap[res]!==undefined){
            tok=this.keyWordMap[res]
          }else{
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
    }
    this.readChar()
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
    while (token.type() !== this.EOF) {
      console.log(token)
      tokens.push(token)
      token = this.nextToken()
    }
  }
}

export default MonkeyLexer