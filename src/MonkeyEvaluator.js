class BaseObject {
  constructor() {
    this.INTEGER_OBJ = "INTEGER"
    this.BOOLEAN_OBJ = "BOOLEAN"
    this.NULL_OBJ = "NULL"
    this.ERROR_OBJ = "Error"
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
      default:
        return null
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