class Token {
  // 词法类型编号，词法字面量，行号
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
    this.position = 0
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
    this.ASSIGN_SIGN = 2 // =
    this.PLUS_SIGN = 3 // +
    this.INTEGER = 4 // 整数
    this.SEMICOLON = 5 // ;
    this.IF = 6 // if 
    this.ELSE = 7 // else
    this.MINUS_SIGN = 8 // -
    this.BANG_SIGN = 9 // !
    this.ASTERISK = 10 // *
    this.SLASH = 11 // /
    this.LT = 12 // <
    this.GT = 13 // >
    this.COMMA = 14 // ,

    this.FUNCTION = 15
    this.TRUE = 16
    this.FALSE = 17
    this.RETURN = 18

    this.LEFT_BRACE = 19 // {}
    this.RIGHT_BRACE = 20 // }
    this.EQ = 21 // ==
    this.NOT_EQ = 22 // !=
    this.LEFT_PARENT = 23 // (
    this.RIGHT_PARENT = 24 // )
  }

  initKeywords () {
    this.keyWordMap = {
      let: new Token(this.LET, "let", 0),
      if: new Token(this.IF, "if", 0),
      else: new Token(this.ELSE, "else", 0),
      fn: new Token(this.FUNCTION, "fn", 0),
      true: new Token(this.TRUE, "true", 0),
      false: new Token(this.FALSE, "false", 0),
      return: new Token(this.RETURN, "return", 0)
    }
  }

  // 通过token类型获取字面量
  getLiteralByTokenType (type) {
    switch (type) {
      case this.EOF:
        return "end of file"
      case this.LET:
        return "let"
      case this.IDENTIFIER:
        return "identifier"
      case this.ASSIGN_SIGN:
        return "assign sign"
      case this.PLUS_SIGN:
        return "plus sign"
      case this.INTEGER:
        return "integer"
      case this.SEMICOLON:
        return "semicolon"
      case this.IF:
        return "if"
      case this.ELSE:
        return "else"
      case this.MINUS_SIGN:
        return "minus sign"
      case this.BANG_SIGN:
        return "!"
      case this.ASTERISK:
        return "*"
      case this.SLASH:
        return "slash"
      case this.LT:
        return "<"
      case this.GT:
        return ">"
      case this.COMMA:
        return ","
      case this.FUNCTION:
        return "fun"
      case this.TRUE:
        return "true"
      case this.FALSE:
        return "fasle"
      case this.RETURN:
        return "return"
      case this.LEFT_BRACE:
        return "{"
      case this.RIGHT_BRACE:
        return "}"
      case this.EQ:
        return "=="
      case this.NOT_EQ:
        return "!="
      case this.LEFT_PARENT:
        return "("
      case this.RIGHT_PARENT:
        return ")"
      default:
        return "unknow token"
    }
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
    if (this.observer !== null) {
      this.observer.notifyTokenCreation(token,
        this.observerContext, this.position - 1,
        this.readPosition)
    }
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

  // 读取下一字符，判断如==的情况
  peekChar () {
    if (this.readPosition >= this.sourceCode.length) {
      return 0
    } else {
      return this.sourceCode[this.readPosition]
    }
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
    this.position = this.readPosition

    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          this.readChar()
          tok = new Token(this.EQ, "==", lineCount)
        } else {
          tok = new Token(this.ASSIGN_SIGN, "=", lineCount)
        }
        break
      case ';':
        tok = new Token(this.SEMICOLON, ";", lineCount)
        break
      case '+':
        tok = new Token(this.PLUS_SIGN, "+", lineCount)
        break
      case '-':
        tok = new Token(this.MINUS_SIGN, "-", lineCount)
        break
      case '!':
        if (this.peekChar() === '=') {
          this.readChar()
          tok = new Token(this.NOT_EQ, "!=", lineCount)
        } else {
          tok = new Token(this.BANG_SIGN, "!", lineCount)
        }
        break
      case '*':
        tok = new Token(this.ASTERISK, "*", lineCount)
        break
      case '/':
        tok = new Token(this.SLASH, "/", lineCount)
        break
      case '<':
        tok = new Token(this.LT, "<", lineCount)
        break
      case '>':
        tok = new Token(this.GT, ">", lineCount)
        break
      case ',':
        tok = new Token(this.COMMA, ",", lineCount)
        break;
      case '{':
        tok = new Token(this.LEFT_BRACE, "{", lineCount)
        break;
      case '}':
        tok = new Token(this.RIGHT_BRACE, "}", lineCount)
        break;
      case '(':
        tok = new Token(this.LEFT_PARENT, "(", lineCount)
        break;
      case ')':
        tok = new Token(this.RIGHT_PARENT, ")", lineCount)
        break;
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
    this.tokens = []
    let token = this.nextToken()
    while (token !== undefined && token.getType() !== this.EOF) {
      console.log(token)
      this.tokens.push(token)
      token = this.nextToken()
    }

    this.tokens.push(token)
  }
}

export default MonkeyLexer