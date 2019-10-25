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

// return语句
class ReturnStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.expression = props.expression
    this.tokenLiteral = `return with ${this.expression.getLiteral()}`
  }
}

// 算术表达式语句
class ExpressionStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.expression = props.expression
    this.tokenLiteral = `expression: ${this.expression.getLiteral()}`
  }
}

// 整数字面量
class IntegerLiteral extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.value = props.value
    this.tokenLiteral = `Integer value is: ${this.token.getLiteral()}`
  }
}

// 前序表达式
class PrefixExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.operator = props.operator
    this.right = props.expression
    this.tokenLiteral = `(${this.operator} ${this.right.getLiteral()})`
  }
}

// 中序表达式
class InfixExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.left = props.leftExpression
    this.operator = props.operator
    this.right = props.rightExpression
    this.tokenLiteral = `(${this.left.getLiteral()} ${this.operator} ${this.right.getLiteral()})`
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

    // 保存对应的前序表达式解析方法
    this.prefixParseFns = {
      [this.lexer.IDENTIFIER]: this.parseIdentifier,
      [this.lexer.INTEGER]: this.parseIntegerLiteral,
      [this.lexer.BANG_SIGN]: this.parsePrefixExpression,
      [this.lexer.MINUS_SIGN]: this.parsePrefixExpression
    }

    // 中序表达式解析方法
    this.infixParseFns = {
      [this.lexer.PLUS_SIGN]: this.parseInfixExpression,
      [this.lexer.MINUS_SIGN]: this.parseInfixExpression,
      [this.lexer.SLASH]: this.parseInfixExpression,
      [this.lexer.ASTERISK]: this.parseInfixExpression,
      [this.lexer.EQ]: this.parseInfixExpression,
      [this.lexer.NOT_EQ]: this.parseInfixExpression,
      [this.lexer.LT]: this.parseInfixExpression,
      [this.lexer.GT]: this.parseInfixExpression,
      [this.lexer.PLUS_SIGN]: this.parseInfixExpression
    }

    // 算术表达式优先级 6最高
    this.LOWEST = 0
    this.EQUALS = 1  // ==
    this.LESSGREATER = 2 // < or >
    this.SUM = 3
    this.PRODUCT = 4
    this.PREFIX = 5 //-X or !X
    this.CALL = 6  //myFunction(X)

    // 存储运算符优先级
    this.precedencesMap = {
      [this.lexer.EQ]: this.EQUALS,
      [this.lexer.NOT_EQ]: this.EQUALS,
      [this.lexer.LT]: this.LESSGREATER,
      [this.lexer.GT]: this.LESSGREATER,
      [this.lexer.PLUS_SIGN]: this.SUM,
      [this.lexer.MINUS_SIGN]: this.SUM,
      [this.lexer.SLASH]: this.PRODUCT,
      [this.lexer.ASTERISK]: this.PRODUCT,
      [this.lexer.LEFT_PARENT]: this.CALL
    }

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
      case this.lexer.RETURN:
        return this.parseReturnStatement()
      default:
        return this.parseExpressionStatement()
    }
  }

  // 解析表达式
  parseExpression (precedence) {
    let prefix = this.prefixParseFns[this.curToken.getType()]
    if (prefix === null) {
      console.log(`no parsing function found for token ${
        this.curToken.getLiteral()}`)
      return null
    }

    let leftExp = prefix(this)
    if (this.peekTokenIs(this.lexer.SEMICOLON) !== true && precedence < this.peekPrecedence()) {
      let infix = this.infixParseFns[this.peekToken.getType()]
      if (infix === null) {
        return leftExp
      }

      this.nextToken()
      leftExp = infix(this, leftExp)
    }

    return leftExp
  }

  // 解析标识符
  parseIdentifier (caller) {
    return caller.createIdentifier()
  }

  // 解析整数字面量
  parseIntegerLiteral (caller) {
    const intProps = {
      token: caller.curToken,
      value: parseInt(caller.curToken.getLiteral())
    }

    if (isNaN(intProps.value)) {
      console.log("could not parse token as integer")
      return null
    }

    return new IntegerLiteral(intProps)
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

    props.identifier = this.createIdentifier()

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

    if (!this.expectPeek(this.lexer.SEMICOLON)) {
      return null
    }

    const letStatement = new LetStatement(props)
    return letStatement
  }

  // 解析return语句
  parseReturnStatement () {
    let props = {
      token: this.curToken
    }

    if (!this.expectPeek(this.lexer.INTEGER)) {
      return null
    }

    let exprProps = {
      token: this.curToken
    }
    props.expression = new Expression(exprProps)

    if (!this.expectPeek(this.lexer.SEMICOLON)) {
      return null
    }

    return new ReturnStatement(props)
  }

  // 解析算术表达式语句
  parseExpressionStatement () {
    let props = {
      token: this.curToken,
      expression: this.parseExpression(this.LOWEST)
    }

    const stmt = new ExpressionStatement(props)
    if (this.peekTokenIs(this.lexer.SEMICOLON)) {
      this.nextToken()
    }

    return stmt
  }

  // 解析前序表达式
  parsePrefixExpression (caller) {
    let props = {
      token: caller.curToken,
      operator: caller.curToken.getLiteral()
    }

    caller.nextToken()
    props.expression = caller.parseExpression(caller.PREFIX)

    return new PrefixExpression(props)
  }

  // 解析中序表达式
  parseInfixExpression (caller, left) {
    const props = {
      leftExpression: left,
      token: caller.curToken,
      operator: caller.curToken.getLiteral()
    }

    let precedence = caller.curPrecedence()
    caller.nextToken()
    props.rightExpression = caller.parseExpression(precedence)
    return new InfixExpression(props)
  }

  createIdentifier () {
    const identProps = {
      token: this.curToken,
      value: this.curToken.getLiteral()
    }
    return new Identifier(identProps)
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
      console.log(this.peekError(tokenType))
      return false
    }
  }

  // 查找下一运算符优先级
  peekPrecedence () {
    const p = this.precedencesMap[this.peekToken.getType()]
    if (p !== undefined) {
      return p
    }
    return this.LOWEST
  }

  // 查找当前运算符优先级
  curPrecedence () {
    const p = this.precedencesMap[this.curToken.getType()]
    if (p !== undefined) {
      return p
    }

    return this.LOWEST
  }

  peekError (type) {
    let s = `expected next token to be ${this.lexer.getLiteralByTokenType(type)}`
    return s
  }
}

export default MonkeyCompilerParser
