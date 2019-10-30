class BaseObject {
  constructor() {
    this.INTEGER_OBJ = "INTEGER"
    this.BOOLEAN_OBJ = "BOOLEAN"
    this.NULL_OBJ = "NULL"
    this.ERROR_OBJ = "Error"
    this.RETURN_VALUE_OBJECT = "Return"
    this.FUNCTION_LITERAL = "FunctionLiteral"
    this.FUNCTION_CALL = "FunctionCall"
    this.STRING_OBJ = "String"
    this.ARRAY_OBJ = "Array"
    this.HASH_OBJ = "Hash"
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

class StringObj extends BaseObject {
  constructor(props) {
    super(props)
    this.value = props.value
  }

  type () {
    return this.STRING_OBJ
  }

  inspect () {
    return `content of string is: ${this.value}`
  }
}

class ArrayObj extends BaseObject {
  constructor(props) {
    super(props)
    this.elements = props.elements
  }

  type () {
    return this.ARRAY_OBJ
  }

  inspect () {
    let s = "["
    for (let i = 0, len = this.elements.length; i < len; i++) {
      s += this.elements[i].inspect()
      s += (i < len - 1) ? "," : ""
    }
    s += "]"
    return s
  }
}

// 哈希对象
class Hash extends BaseObject {
  constructor(props) {
    super(props)
    this.keys = props.keys
    this.values = props.values
  }

  type () {
    return this.HASH_OBJ
  }

  inspect () {
    let s = "{"
    for (let i = 0, len = this.keys.length; i < len; i++) {
      s += `${this.keys[i].inspect()}:${this.values[i].inspect()}`
      s += (i < len - 1) ? "," : ""
    }
    s += "}"
    return s
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

class ReturnValues extends BaseObject {
  constructor(props) {
    super(props)
    this.valueObject = props.value
  }

  type () {
    return this.RETURN_VALUE_OBJECT
  }

  inspect () {
    this.msg = `return with : ${this.valueObject.inspect()}`
    return this.msg
  }
}

// 函数符号对象
class FunctionLiteral extends BaseObject {
  constructor(props) {
    super(props)
    this.token = props.token  // 对应关键字fn
    this.parameters = props.identifiers
    this.blockStatement = props.blockStatement
  }

  type () {
    return this.FUNCTION_LITERAL
  }

  inspect () {
    let s = "fn("
    for (let i = 0, len = this.parameters.length; i < len; i++) {
      s += this.parameters[i].tokenLiteral
      s += (i < len - 1) ? ',' : ''
    }
    s += `){\n${this.blockStatement.tokenLiteral}\n}`
    return s
  }
}

// 函数执行时对象
class FunctionCall extends BaseObject {
  constructor(props) {
    super(props)
    this.identifiers = props.identifiers
    this.blockStatement = props.blockStatement
    this.enviroment = undefined // 执行时环境
  }
}

// 变量执行环境
class Enviroment {
  constructor() {
    this.map = {}
    this.outer = undefined  // 外部环境
  }

  get (name) {
    let obj = this.map[name]
    if (obj !== undefined) {
      return obj
    }
    //在当前绑定环境找不到变量时，通过回溯查找外层绑定环境是否有给定变量
    if (this.outer !== undefined) {
      obj = this.outer.get(name)
    }

    return obj
  }

  set (name, obj) {
    this.map[name] = obj
  }
}

class MonkeyEvaluator {
  constructor(props) {
    this.enviroment = new Enviroment()
  }
  // 执行函数
  evaluate (node) {
    const props = {}
    switch (node.type) {
      case "program":
        return this.evalProgram(node)
      case "String":
        props.value = node.tokenLiteral
        const str = new StringObj(props)
        console.log(str.inspect())
        return str
      case "ArrayLiteral":
        const elements = this.evalExpressions(node.elements)
        if (elements.length === 1 && this.isError(elements[0])) {
          return elements[0]
        }
        props.elements = elements
        return new ArrayObj(props)
      case "Identifier":
        console.log("variable name is: ", node.tokenLiteral)
        const value = this.evalIdentifier(node, this.enviroment)
        console.log("it is binding value is ", value.inspect())
        return value
      case "Integer":
        console.log("Integer with value:", node.value)
        props.value = node.value
        return new IntegerObj(props)
      case "Boolean":
        props.value = node.value
        console.log("Boolean with value:", node.value)
        return new BooleanObj(props)
      case "HashLiteral":
        return this.evalHashLiteral(node)
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
      case "ReturnStatement":
        props.value = this.evaluate(node.expression)
        if (this.isError(props.value)) {
          return props.value
        }
        const ReturnObj = new ReturnValues(props)
        console.log(ReturnObj.inspect())
        return ReturnObj
      case "LetStatement":
        const val = this.evaluate(node.value)
        if (this.isError(val)) {
          return val
        }
        this.enviroment.set(node.name.tokenLiteral, val)
        return val
      case "IndexExpression":
        const left = this.evaluate(node.left)
        if (this.isError(left)) {
          return left
        }
        const index = this.evaluate(node.index)
        if (this.isError(index)) {
          return index
        }

        const IndexObj = this.evalIndexExpression(left, index)
        if (IndexObj !== null) {
          console.log("the index value is :", index.value, " with content: ", IndexObj.inspect())
        }
        return IndexObj
      case "FunctionLiteral":
        props.token = node.token
        props.identifiers = node.parameters
        props.blockStatement = node.body

        const funLiteral = new FunctionLiteral(props)
        console.log(`define a funtion ${funLiteral.inspect()}`)
        // 返回函数调用对象以供调用
        const funObj = new FunctionCall(props)
        //为函数调用创建新的绑定环境
        funObj.enviroment = this.newEnclosedEnvironment(this.enviroment)
        return funObj
      case "CallExpression":
        console.log("execute a function with content: ",
          node.function.tokenLiteral)

        // 把参数解析提前，以便len函数解析
        console.log("evalute function call params:")
        const args = this.evalExpressions(node.arguments)
        if (args.length === 1 && this.isError(args[0])) {
          return args[0]
        }

        const functionCall = this.evaluate(node.function)
        if (this.isError(functionCall)) {
          // 找不到该函数则到内部函数中找
          return this.builtins(node.function.tokenLiteral, args)
        }

        // 打印处理后的参数
        for (var i = 0; i < args.length; i++) {
          console.log(args[i].inspect())
        }

        // 执行函数前保留当前绑定环境
        const oldEnviroment = this.enviroment

        //设置新的变量绑定环境
        this.enviroment = functionCall.enviroment
        //将输入参数名称与传入值在新环境中绑定
        for (let i = 0; i < functionCall.identifiers.length; i++) {
          const name = functionCall.identifiers[i].tokenLiteral
          const val = args[i]
          this.enviroment.set(name, val)
        }
        //执行函数体内代码
        const result = this.evaluate(functionCall.blockStatement)
        //执行完函数后，里面恢复原有绑定环境
        this.enviroment = oldEnviroment
        if (result.type() === result.RETURN_VALUE_OBJECT) {
          console.log("function call return with :",
            result.valueObject.inspect())
          return result.valueObject
        }

        return result
      default:
        return new NullObj({})
    }
  }

  // 程序执行的主入口，解决代码嵌套执行问题
  evalProgram (program) {
    let result
    for (let i = 0; i < program.statements.length; i++) {
      result = this.evaluate(program.statements[i])

      // 为return值则直接返回
      if (result.type() === result.RETURN_VALUE_OBJECT) {
        return result.valueObject
      }

      if (result.type() === result.NULL_OBJ) {
        return result
      }

      if (result.type() === result.ERROR_OBJ) {
        console.log(result.msg)
        return result
      }
    }

    return result
  }

  // 执行参数中的表达式
  evalExpressions (exps) {
    const result = []
    for (let i = 0; i < exps.length; i++) {
      const evaluated = this.evaluate(exps[i])
      if (this.isError(evaluated)) {
        return evaluated
      }
      result[i] = evaluated
    }
    return result
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

    // 左右类型不匹配则报错
    if (left.type() !== right.type()) {
      return this.newError(`type mismatch: ${left.type()} and ${right.type()}`)
    }

    if (left.type() === left.INTEGER_OBJ &&
      right.type() === right.INTEGER_OBJ) {
      return this.evalIntegerInfixExpression(
        operator, left, right)
    }

    // 增加字符串相加操作
    if (left.type() === left.STRING_OBJ && right.type() === right.STRING_OBJ) {
      return this.evalStringInfixExpression(operator,
        left, right)
    }

    const props = {}
    if (operator === '==') {
      props.value = (left.vaule === right.value)
      console.log("result on boolean operation of ", operator, " is ", props.value)
      return new BooleanObj(props)
    } else if (operator === "!=") {
      props.value = (left.value !== right.value)
      console.log("result on boolean operation of ", operator, " is ", props.value)
      return new BooleanObj(props)
    }

    return this.newError("unknown operator: " + operator)
  }

  // 执行字符串相加
  evalStringInfixExpression (operaotr, left, right) {
    if (operaotr !== "+") {
      return this.newError("unknown operator for string operation")
    }

    const leftVal = left.value,
      rightVal = right.value
    const props = {
      value: leftVal + rightVal
    }
    console.log("reuslt of string add is: ", props.value)
    return new StringObj(props)
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
        return this.newError("unknown operator for Integer")
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

    // 有错误则终止
    if (this.isError(condition)) {
      return condition
    }

    if (this.isTruthy(condition)) {
      console.log("condition in if holds, exec statements in if block")
      // 为真则执行if代码
      return this.evaluate(ifNode.consequence)
    } else if (ifNode.alternative != null) {
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
    let result
    for (let i = 0; i < node.statements.length; i++) {
      result = this.evaluate(node.statements[i])
      // 防止嵌套if不执行报错
      if (result === null) {
        continue
      }

      if (result.type() === result.RETURN_VALUE_OBJECT || result.type() === result.ERROR_OBJ) {
        // 遇到返回语句或错误则直接终止循环并返回
        return result
      }
    }
    return result
  }

  // 执行变量
  evalIdentifier (node, env) {
    const val = env.get(node.tokenLiteral)
    if (val === undefined) {
      return this.newError(`identifier no found: ${node.name}`)
    }
    return val
  }

  evalHashLiteral (node) {
    /*
      先递归的解析哈希表的key，然后解析它的value,对于如下类型的哈希表代码
      let add = fn (x, y) { return x+y};
      let byOne = fn (z) { return z+1;}
      {add(1,2) : byOne(3)}
      编译器先执行add(1,2)得到3，然后执行byOne(3)得到4
    */
    const props = {
      keys: [],
      values: []
    }

    for (let i = 0; i < node.keys.length; i++) {
      //  执行键名表达式
      const key = this.evaluate(node.keys[i])
      if (this.isError(key)) {
        return key
      }

      // 查询是否合法键名
      if (this.hashable(key) !== true) {
        return new this.Error("unhashable type:" +
          key.type())
      }

      // 执行键值表达式
      const value = this.evaluate(node.values[i])
      if (this.isError(value)) {
        return value
      }

      props.keys.push(key)
      props.values.push(value)
    }

    const hashObj = new Hash(props)
    console.log("eval hash object: ", hashObj.inspect())
    return hashObj
  }

  // 合法hash键名表
  hashable (node) {
    if (node.type() === node.INTEGER_OBJ ||
      node.type() === node.STRING_OBJ ||
      node.type() === node.BOOLEAN_OBJ) {
      return true
    }

    return false
  }

  // 执行下标运算
  evalIndexExpression (left, index) {
    if (left.type() === left.ARRAY_OBJ &&
      index.type() === index.INTEGER_OBJ) {
      return this.evalArrayIndexExpression(left, index)
    } else if (left.type() === left.HASH_OBJ) {
      return this.evalHashIndexExpression(left, index)
    } else {
      return this.newError("array index error or hash error")
    }
  }

  // 数组下标运算
  evalArrayIndexExpression (array, index) {
    const idx = index.value
    const max = array.elements.length - 1
    // 数组越界
    if (idx < 0 || idx > max) {
      return null
    }

    return array.elements[idx]
  }

  // hash键名取值运算
  evalHashIndexExpression (hash, index) {
    if (!this.hashable(index)) {
      return new this.Error("unhashable type: " + index.type())
    }

    for (let i = 0; i < hash.keys.length; i++) {
      if (hash.keys[i].value === index.value) {
        console.log("return hash value :",
          hash.values[i].value)
        return hash.values[i]
      }
    }

    return null
  }

  // 内部API
  builtins (name, args) {
    const props = {}
    switch (name) {
      case "first":
        if (args.length !== 1) {
          return this.newError("Wrong number of arguments when calling first")
        }
        if (args[0].type() !== args[0].ARRAY_OBJ) {
          return this.newError("arguments of first must be ARRAY")
        }
        if (args[0].elements.length > 0) {
          console.log("the first element of array is :",
            args[0].elements[0].inspect())
          return args[0].elements[0]
        }
        return null
      case "rest":
        if (args.length !== 1) {
          return this.newError("Wrong number of arguments when calling rest")
        }
        if (args[0].type() !== args[0].ARRAY_OBJ) {
          return this.newError("arguments of first must be ARRAY")
        }
        if (args[0].elements.length > 1) {
          //去掉第一个元素
          props.elements = args[0].elements.slice(1)
          const obj = new ArrayObj(props)
          console.log("rest return: ", obj.inspect())
          return obj
        }
        return null
      case "append":
        if (args.length !== 2) {
          return this.newError("Wrong number of arguments when calling append")
        }
        if (args[0].type() !== args[0].ARRAY_OBJ) {
          return this.newError("arguments of first must be ARRAY")
        }
        props.elements = args[0].elements.slice()
        props.elements.push(args[1])
        const obj = new ArrayObj(props)
        console.log("new array after calling append is: ",
          obj.inspect())
        return obj
      case "len":
        if (args.length !== 1) {
          // 参数个数为1
          return this.newError("Wrong number of arguments when calling len")
        }
        switch (args[0].type()) {
          case args[0].STRING_OBJ:
            props.value = args[0].value.length
            const obj = new IntegerObj(props)
            console.log("API len return: ", obj.inspect())
            return obj
          case args[0].ARRAY_OBJ:
            props.value = args[0].elements.length
            console.log("len of array ", args[0].inspect(), " is ", props.value)
            return new IntegerObj(props)
          default:
            return this.newError("unknown parameter")
        }
      default:
        return this.newError("unknown function call")
    }
  }

  // 创建新环境并绑定外层环境
  newEnclosedEnvironment (outerEnv) {
    const env = new Enviroment()
    env.outer = outerEnv
    return env
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

  newError (msg) {
    const props = {
      errMsg: msg
    }
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