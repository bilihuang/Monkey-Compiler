class Node {
  constructor() {
    this.tokenLiteral = ""
  }

  getLiteral () {
    return this.tokenLiteral
  }
}

// 语句类
class Statement extends Node {
  statementNode () {
    return this
  }
}

// 表达式类
class Expression extends Node {
  constructor(props) {
    super(props)
    this.tokenLiteral = props.token.getLiteral()
  }

  expressionNode () {
    return this
  }
}

// 标识符
class Identifier extends Statement {
  constructor(props) {
    super(props)
    this.tokenLiteral = props.token.getLiteral()
    this.token = props.token
    this.value = ""
  }
}

// let语句
class LetStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.name = props.identifier
    this.value = props.expression
    this.tokenLiteral = `This is a Let statement, left is an identifier:${props.identifier.getLiteral()} right size is value of ${this.value.getLiteral()}`
  }
}

class Program {
  constructor() {
    this.statements = []
  }

  getLiteral () {
    if (this.statements.length) {
      return this.statements[0].tokenLiteral()
    } else {
      return ""
    }
  }
}

class MonkeyCompilerParser {
  constructor(lexer) {
    this.lexer = lexer // 词法解析器
    this.lexer.lexing()
    this.tokenPos = 0 // 表示当前正在处理的token的位置
    this.curToken = null // 当前token
    this.peekToken = null // 下一token
    // 调用两次以获取下一token
    this.nextToken()
    this.nextToken()
    this.program = new Program()
  }

  // 读取token
  nextToken () {
    /*
      一次必须读入两个token,这样我们才了解当前解析代码的意图
      例如假设当前解析的代码是 5; 那么peekToken就对应的就是
      分号，这样解析器就知道当前解析的代码表示一个整数
    */
    this.curToken = this.peekToken
    this.peekToken = this.lexer.tokens[this.tokenPos]
    this.tokenPos++
  }

  // 解析代码
  parseProgram () {
    while (this.curToken.getType() !== this.lexer.EOF) {
      const stmt = this.parseStatement()
      if (stmt !== null) {
        this.program.statements.push(stmt)
      }
      this.nextToken()
    }
    return this.program
  }

  // 解析语句
  parseStatement () {
    switch (this.curToken.getType()) {
      case this.lexer.LET:
        return this.parseLetStatement()
      default:
        return null
    }
  }

  // 解析let语句
  parseLetStatement () {
    let props = {
      token: this.curToken
    }

    // 下一token类型必须是identifier
    if (!this.expectPeek(this.lexer.IDENTIFIER)) {
      return null
    }

    let identProps = {
      token: this.curToken,
      value: this.curToken.getLiteral()
    }
    props.identifier = new Identifier(identProps)

    if (!this.expectPeek(this.lexer.ASSIGN_SIGN)) {
      return null
    }

    if (!this.expectPeek(this.lexer.INTEGER)) {
      return null
    }

    let exprProps = {
      token: this.curToken
    }
    props.expression = new Expression(exprProps)

    const letStatement = new LetStatement(props)
    return letStatement
  }

  // 判断当前token类型与传入类型是否相等
  curTokenIs (tokenType) {
    return this.curToken.getType() === tokenType
  }

  // 判断下一token类型与传入类型是否相等
  peekTokenIs (tokenType) {
    return this.peekToken.getType() === tokenType
  }

  // 判断token类型是不是所期望的类型
  expectPeek (tokenType) {
    if (this.peekTokenIs(tokenType)) {
      this.nextToken()
      return true
    } else {
      return false
    }
  }
}

export default MonkeyCompilerParser
