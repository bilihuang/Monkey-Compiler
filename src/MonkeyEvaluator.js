class BaseObject {
  constructor() {
    this.INTEGER_OBJ = "INTEGER"
    this.BOOLEAN_OBJ = "BOOLEAN"
    this.NULL_OBJ = "NULL"
    this.ERROR_OBJ = "Error"
    this.RETURN_VALUE_OBJECT = "Return"
  }

  type () { return null }

  inspect () { return null }
}

class IntegerObj extends BaseObject {
  constructor(props) {
    super(props)
    this.value = props.value
  }

  inspect () {
    return `integer with value: ${this.value}`
  }

  type () {
    return this.INTEGER_OBJ
  }
}

class BooleanObj extends BaseObject {
  constructor(props) {
    super(props)
    this.value = props.value
  }

  type () {
    return this.BOOLEAN_OBJ
  }

  inspect () {
    return `boolean with value: ${this.value}`
  }
}

class NullObj extends BaseObject {
  constructor(props) {
    super()
  }

  type () {
    return this.NULL_OBJ
  }

  inspect () {
    return "null"
  }
}

class ErrorObj extends BaseObject {
  constructor(props) {
    super(props)
    this.msg = props.errMsg
  }

  type () {
    return this.ERROR_OBJ
  }

  inspect () {
    return this.msg
  }
}

class MonkeyEvaluator {
  // 执行函数
  evaluate (node) {
    const props = {}
    switch (node.type) {
      case "Integer":
        console.log("Integer with value:", node.value)
        props.value = node.value
        return new IntegerObj(props)
      case "Boolean":
        props.value = node.value
        console.log("Boolean with value:", node.value)
        return new BooleanObj(props)
      case "ExpressionStatement":
        return this.evaluate(node.expression)
      case "PrefixExpression":
        const right = this.evaluate(node.right)
        if (this.isError(right)) {
          return right
        }
        const obj = this.evalPrefixExpression(node.operator, right)
        console.log("eval prefix expression: ", obj.inspect())
        return obj
      case "InfixExpression":
        const infixLeft = this.evaluate(node.left)
        const infixRight = this.evaluate(node.right)
        return this.evalInfixExpression(node.operator, infixLeft, infixRight)
      case "IfExpression":
        return this.evalIfExpression(node)
      case "blockStatement":
        return this.evalStatements(node)
      default:
        return new NullObj({})
    }
  }

  // 执行前序表达式
  evalPrefixExpression (operator, right) {
    switch (operator) {
      case "!":
        return this.evalBangOperatorExpression(right)
      case "-":
        return this.evalMinusPrefixOperatorExpression(right)
      default:
        return this.newError("unknown operator:", operator, right.type())
    }
  }

  // 执行逻辑非表达式
  evalBangOperatorExpression (right) {
    const props = {}
    if (right.type() === right.BOOLEAN_OBJ) {
      props.value = !right.value
    }

    if (right.type() === right.INTEGER_OBJ) {
      if (right.value === 0) {
        props.value = true
      } else {
        props.value = false
      }
    }

    if (right.type() === right.NULL_OBJ) {
      props.value = true
    }

    return new BooleanObj(props)
  }

  // 执行负数表达式
  evalMinusPrefixOperatorExpression (right) {
    if (right.type() !== right.INTEGER_OBJ) {
      return this.newError("unknown operaotr:- ", right.type())
    }

    const props = {}
    props.value = -right.value
    return new IntegerObj(props)
  }

  // 执行中序表达式
  evalInfixExpression (operator, left, right) {
    if (left.type() === left.INTEGER_OBJ &&
      right.type() === right.INTEGER_OBJ) {
      return this.evalIntegerInfixExpression(
        operator, left, right)
    }

    return null
  }

  // 执行中序表达式中的运算
  evalIntegerInfixExpression (operator, left, right) {
    const leftVal = left.value,
      rightVal = right.value,
      props = {}
    let resultType = "integer"

    switch (operator) {
      case "+":
        props.value = leftVal + rightVal
        break;
      case "-":
        props.value = leftVal - rightVal
        break;
      case "*":
        props.value = leftVal * rightVal
        break;
      case "/":
        props.value = leftVal / rightVal
        break;
      case "==":
        resultType = "boolean"
        props.value = (leftVal === rightVal)
        break;
      case "!=":
        resultType = "boolean"
        props.value = (leftVal !== rightVal)
        break
      case ">":
        resultType = "boolean"
        props.value = (leftVal > rightVal)
        break
      case "<":
        resultType = "boolean"
        props.value = (leftVal < rightVal)
        break
      default:
        return null
    }

    console.log("eval infix expression result is: ",
      props.value)
    let result
    if (resultType === "integer") {
      result = new IntegerObj(props)
    } else if (resultType === "boolean") {
      result = new BooleanObj(props)
    }

    return result
  }

  // 执行if&else代码块
  evalIfExpression (ifNode) {
    console.log("begin to eval if statment")
    // 执行条件代码
    const condition = this.evaluate(ifNode.condition)

    if (this.isTruthy(condition)) {
      console.log("condition in if holds, exec statements in if block")
      // 为真则执行if代码
      return this.evaluate(ifNode.consequence)
    } else if (ifNode.alternative !== null) {
      console.log("condition in if no holds, exec statements in else block")
      // 为假则执行else代码
      return this.evaluate(ifNode.alternative)
    } else {
      // 条件为假但无else代码
      console.log("condition in if no holds, exec nothing!")
      return null
    }
  }

  // 执行代码块中语句
  evalStatements (node) {
    let result = null
    for (let i = 0; i < node.statements.length; i++) {
      result = this.evaluate(node.statements[i])
      if (result.type() === result.RETURN_VALUE_OBJECT || result.type() === result.ERROR_OBJ) {
        // 遇到返回语句或错误则直接终止循环并返回
        return result
      }
    }
    return result
  }

  // 判断条件代码的是否为真值
  isTruthy (condition) {
    if (condition.type() === condition.INTEGER_OBJ) {
      // 不为0则返回真值
      if (condition.value !== 0) {
        return true
      }
      return false
    }

    // 为布尔值直接返回
    if (condition.type() === condition.BOOLEAN_OBJ) {
      return condition.value
    }

    // 为null返回假值
    if (condition.type() === condition.NULL_OBJ) {
      return false
    }

    return true
  }

  newError (msg, type) {
    const props = {}
    props.errMsg = msg + type
    return new ErrorObj(props)
  }

  isError (obj) {
    if (obj !== null) {
      return obj.type() === obj.ERROR_OBJ
    }

    return false
  }
}

export default MonkeyEvaluator