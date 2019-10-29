class Node {
  constructor() {
    this.tokenLiteral = ""
    this.type = ""
  }

  getLiteral () {
    return this.tokenLiteral
  }
}

// 语句类
class Statement extends Node {
  constructor() {
    super()
    this.type = "Statement"
  }
  statementNode () {
    return this
  }
}

// 表达式类
class Expression extends Node {
  constructor(props) {
    super(props)
    this.type = "Expression"
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
    this.type = "Identifier"
  }
}

// let语句
class LetStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.name = props.identifier
    this.value = props.expression
    this.type = "LetStatement"
    this.tokenLiteral = `This is a Let statement, left is an identifier:${props.identifier.getLiteral()}, right side is value of ${this.value.getLiteral()}. `
  }
}

// return语句
class ReturnStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.expression = props.expression
    this.type = "ReturnStatement"
    this.tokenLiteral = `return with ${this.expression.getLiteral()}`
  }
}

// 算术表达式语句
class ExpressionStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.expression = props.expression
    this.type = "ExpressionStatement"
    this.tokenLiteral = `expression: ${this.expression.getLiteral()}`
  }
}

// 整数字面量
class IntegerLiteral extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.value = props.value
    this.type = "Integer"
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
    this.type = "PrefixExpression"
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
    this.type = "InfixExpression"
    this.tokenLiteral = `(${this.left.getLiteral()} ${this.operator} ${this.right.getLiteral()})`
  }
}

// 布尔值表达式
class BooleanLiteral extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.value = props.value
    this.type = "Boolean"
    this.tokenLiteral = `Boolean token with value of ${this.value}`
  }
}

// 字符串
class StringLiteral extends Node {
  constructor(props) {
    super(props)
    this.token = props.token
    this.tokenLiteral = props.token.getLiteral()
    this.type = "String"
  }
}

// 数组
class ArrayLiteral extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.elements = props.elements  // 数组元素列表
    this.type = "ArrayLiteral"
    let s = ""
    for (let i = 0, len = this.elements.length; i < len; i++) {
      s += this.elements[i].getLiteral()
      s += (i !== len - 1) ? ", " : ""
    }
    this.tokenLiteral = s
  }
}

// 数组下标运算表达式
class IndexExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.left = props.left  // [前的表达式，可以是变量名，数组，函数调用
    this.index = props.index //可以是数字常量，变量，函数调用 
    this.tokenLiteral = `([${this.left.getLiteral()}][${this.index.getLiteral()}])`
    this.type = "IndexExpression"
  }
}

// if语句
class IfExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.condition = props.condition // if条件判断的内容
    this.consequence = props.consequence // if第一个花括号里的代码块
    this.alternative = props.alternative // else里的内容
    this.type = "IfExpression"
    this.tokenLiteral = `if expression width condtion: ${this.condition.getLiteral()}\n statements in if block are: ${this.consequence.getLiteral()}` + (this.alternative ? `\n statements in else block are: ${this.alternative.getLiteral()}` : '')
  }
}

// 解析{}中的代码块
class BlockStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.statements = props.statements
    this.type = "blockStatement"
    let s = ""
    for (let i = 0; i < this.statements.length; i++) {
      s += this.statements[i].getLiteral()
    }
    this.tokenLiteral = s
  }
}

// 函数
class FunctionLiteral extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.parameters = props.parameters
    this.body = props.body // 代码块内容
    this.type = "FunctionLiteral"
    let s = 'It is a nameless function, input parameters are: ('
    for (let i = 0, len = this.parameters.length; i < len; i++) {
      s += this.parameters[i].getLiteral()
      s += (i !== len - 1) ? ", " : ")\n"
    }
    s += `statements in function body are : {${this.body.getLiteral()}}`
    this.tokenLiteral = s
  }
}

// 函数调用
class CallExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.function = props.function  // 调用函数
    this.arguments = props.arguments //调用时传入的参数
    this.type = "CallExpression"
    let s = `It is a function call : ${this.function.getLiteral()}\n It is input parameters are: (`
    for (let i = 0, len = this.arguments.length; i < len; i++) {
      s += this.arguments[i].getLiteral()
      s += (i !== len - 1) ? ", " : ")"
    }
    this.tokenLiteral = s
  }
}

class Program {
  constructor() {
    this.statements = []
    this.type = "program"
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
      [this.lexer.MINUS_SIGN]: this.parsePrefixExpression,
      [this.lexer.TRUE]: this.parseBoolean,
      [this.lexer.FALSE]: this.parseBoolean,
      [this.lexer.LEFT_PARENT]: this.parseGroupedExpression,
      [this.lexer.IF]: this.parseIfExpression,
      [this.lexer.FUNCTION]: this.parseFunctionLiteral,
      [this.lexer.STRING]: this.parseStringLiteral,
      [this.lexer.LEFT_BRACKET]: this.parseArrayLiteral
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
      [this.lexer.LEFT_PARENT]: this.parseCallExpression,
      [this.lexer.LEFT_BRACKET]: this.parseIndexExpression
    }

    // 算术表达式优先级 6最高
    this.LOWEST = 0
    this.EQUALS = 1  // ==
    this.LESSGREATER = 2 // < or >
    this.SUM = 3
    this.PRODUCT = 4
    this.PREFIX = 5 //-X or !X
    this.CALL = 6  //myFunction(X)
    this.INDEX = 7 //数组下标运算优先级最高

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
      [this.lexer.LEFT_PARENT]: this.CALL,
      [this.lexer.LEFT_BRACKET]: this.INDEX
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
    if (!prefix) {
      console.log(`no parsing function found for token ${
        this.curToken.getLiteral()}`)
      return null
    }

    let leftExp = prefix(this)
    while (this.peekTokenIs(this.lexer.SEMICOLON) !== true && precedence < this.peekPrecedence()) {
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
      value: parseInt(caller.curToken.getLiteral(), 10)
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

    // let exprProps = {
    //   token: this.curToken
    // }
    this.nextToken()
    props.expression = this.parseExpression(this.LOWEST)

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

    // let exprProps = {
    //   token: this.curToken
    // }
    this.nextToken()
    props.expression = this.parseExpression(this.LOWEST)

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

  // 解析布尔值
  parseBoolean (caller) {
    const props = {
      token: caller.curToken,
      value: caller.curTokenIs(caller.lexer.TRUE)
    }
    return new BooleanLiteral(props)
  }

  // 解析字符串
  parseStringLiteral (caller) {
    const props = {
      token: caller.curToken
    }
    return new StringLiteral(props)
  }

  // 解析组合表达式
  parseGroupedExpression (caller) {
    caller.nextToken()
    const exp = caller.parseExpression(caller.LOWEST)
    if (caller.expectPeek(caller.lexer.RIGHT_PARENT)
      !== true) {
      return null
    }

    return exp
  }

  // 解析if表达式
  parseIfExpression (caller) {
    const props = {
      token: caller.curToken
    }

    if (caller.expectPeek(caller.lexer.LEFT_PARENT) !== true) {
      return null
    }

    caller.nextToken()
    props.condition = caller.parseExpression(caller.LOWEST)

    if (caller.expectPeek(caller.lexer.RIGHT_PARENT) !== true) {
      return null
    }

    if (caller.expectPeek(caller.lexer.LEFT_BRACE) !== true) {
      return null
    }

    props.consequence = caller.parseBlockStatement(caller)

    if (caller.peekTokenIs(caller.lexer.ELSE) === true) {
      caller.nextToken()
      if (caller.expectPeek(caller.lexer.LEFT_BRACE) !== true) {
        return null
      }
      props.alternative = caller.parseBlockStatement(caller)
    }

    return new IfExpression(props)
  }

  // 解析if语句和else语句中代码块
  parseBlockStatement (caller) {
    const props = {
      token: caller.curToken,
      statements: []
    }

    caller.nextToken()

    while (caller.curTokenIs(caller.lexer.RIGHT_BRACE) !== true) {
      const stmt = caller.parseStatement()
      if (stmt !== null) {
        props.statements.push(stmt)
      }

      caller.nextToken()
    }
    return new BlockStatement(props)
  }

  // 解析函数
  parseFunctionLiteral (caller) {
    const props = {
      token: caller.curToken
    }

    // 无左括号则错误
    if (caller.expectPeek(caller.lexer.LEFT_PARENT) !== true) {
      return null
    }

    // 解析参数
    props.parameters = caller.parseFunctionParameters(caller)

    // 无左{错误
    if (caller.expectPeek(caller.lexer.LEFT_BRACE) !== true) {
      return null
    }

    // 函数内部代码
    props.body = caller.parseBlockStatement(caller)

    return new FunctionLiteral(props)
  }

  // 解析函数参数
  parseFunctionParameters (caller) {
    let parameters = []

    // 是右括号则无参数
    if (caller.peekTokenIs(caller.lexer.RIGHT_PARENT)) {
      caller.nextToken()
      return parameters
    }

    caller.nextToken()

    const idenProp = {
      token: caller.curToken
    }
    parameters.push(new Identifier(idenProp))

    // 循环获取参数
    while (caller.peekTokenIs(caller.lexer.COMMA)) {
      caller.nextToken()
      caller.nextToken()
      const ident = {
        token: caller.curToken
      }
      parameters.push(new Identifier(ident))
    }

    // 无右括号报错
    if (caller.expectPeek(caller.lexer.RIGHT_PARENT) !==
      true) {
      return null
    }

    return parameters
  }

  // 解析函数调用
  parseCallExpression (caller, func) {
    const props = {
      token: caller.curToken,
      function: func,
      arguments: caller.parseCallArguments(caller)
    }

    return new CallExpression(props)
  }

  // 解析函数调用参数
  parseCallArguments (caller) {
    const args = []
    if (caller.peekTokenIs(caller.lexer.RIGHT_PARENT)) {
      caller.nextToken()
      return args
    }

    caller.nextToken()
    // 参数可能是算术表达式
    args.push(caller.parseExpression(caller.LOWEST))

    while (caller.peekTokenIs(caller.lexer.COMMA)) {
      caller.nextToken()
      caller.nextToken()
      args.push(caller.parseExpression(caller.LOWEST))
    }

    if (caller.expectPeek(caller.lexer.RIGHT_PARENT) !== true) {
      return null
    }

    return args
  }

  // 解析数组
  parseArrayLiteral (caller) {
    const props = {
      token: caller.curToken,
      elements: caller.parseExpressionList(caller.lexer.RIGHT_BRACKET)
    }
    const obj = new ArrayLiteral(props)
    console.log("parsing array result: ", obj.getLiteral())
    return obj
  }

  // 解析数组中的每个元素
  parseExpressionList (end) {
    const list = []
    if (this.peekTokenIs(end)) {
      this.nextToken()
      return list
    }

    this.nextToken()
    list.push(this.parseExpression(this.LOWEST))

    while (this.peekTokenIs(this.lexer.COMMA)) {
      this.nextToken()  // 越过,
      this.nextToken()
      list.push(this.parseExpression(this.LOWEST))
    }

    if (!this.expectPeek(end)) {
      return null
    }

    return list
  }

  // 解析数组下标运算表达式
  parseIndexExpression (caller, left) {
    const props = {
      token: caller.curToken,
      left: left
    }
    caller.nextToken()
    props.index = caller.parseExpression(caller.LOWEST)
    if (!caller.expectPeek(caller.lexer.RIGHT_BRACKET)) {
      return null
    }

    const obj = new IndexExpression(props)
    console.log("array indexing: ", obj.getLiteral())
    return obj
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
