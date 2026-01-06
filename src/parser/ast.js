class Program {
    constructor(statements) {
        this.type = "Program";
        this.statements = statements;
    }
}

class AssignStatement {
    constructor({ isGlobal, isFix, name, dataType, value }) {
        this.type = "AssignStatement";
        this.isGlobal = isGlobal;
        this.isFix = isFix;
        this.name = name;
        this.dataType = dataType;
        this.value = value;
    }
}

class StoreStatement {
    constructor({ isGlobal, isFix, name, value }) {
        this.type = "StoreStatement";
        this.isGlobal = isGlobal;
        this.isFix = isFix;
        this.name = name;
        this.value = value;
    }
}

class UpdateStatement {
    constructor({ name, value }) {
        this.type = "UpdateStatement";
        this.name = name;
        this.value = value;
    }
}

class BinaryExpression {
    constructor(left, operator, right) {
        this.type = "BinaryExpression";
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

class Identifier {
    constructor(name) {
        this.type = "Identifier";
        this.name = name;
    }
}

class Literal {
    constructor(value) {
        this.type = "Literal";
        this.value = value;
    }
}

class IfStatement {
    constructor(condition, body, altBody) {
        this.type = "IfStatement";
        this.condition = condition;
        this.body = body;
        this.altBody = altBody;
    }
}

class FunctionDeclaration {
    constructor(name, params, body) {
        this.type = "FunctionDeclaration";
        this.name = name;
        this.params = params;
        this.body = body;
    }
}

class ReturnStatement {
    constructor(value) {
        this.type = "ReturnStatement";
        this.value = value;
    }
}

class ArrayLiteral {
    constructor(elements) {
        this.type = "ArrayLiteral";
        this.elements = elements;
    }
}

class ArrayAccess {
    constructor(array, index) {
        this.type = "ArrayAccess";
        this.array = array;
        this.index = index;
    }
}

class CallExpression {
    constructor(name, args) {
        this.type = "CallExpression";
        this.name = name;
        this.args = args;
    }
}

class RepeatUntil {
    constructor(condition, body) {
        this.type = "RepeatUntil";
        this.condition = condition;
        this.body = body;
    }
}

class ShowStatement {
    constructor(value) {
        this.type = "ShowStatement";
        this.value = value;
    }
}

class ErrorStatement {
    constructor(value) {
        this.type = "ErrorStatement";
        this.value = value;
    }
}

class SkipStatement {
    constructor() {
        this.type = "SkipStatement";
    }
}

class HaltStatement {
    constructor() {
        this.type = "HaltStatement";
    }
}

class RepeatFor {
    constructor(varName, start, end, step, body, arrayName = null) {
        this.type = "RepeatFor";
        this.varName = varName;
        this.start = start;
        this.end = end;
        this.step = step;
        this.body = body;
        this.arrayName = arrayName;
    }
}

class RawJSBlock {
    constructor(code) {
        this.type = "RawJSBlock";
        this.code = code;
    }
}

class InputExpression {
    constructor() {
        this.type = "InputExpression";
    }
}

class MethodCall {
    constructor(targetType, target, methodName, args) {
        this.type = "MethodCall";
        this.targetType = targetType;
        this.target = target;
        this.methodName = methodName;
        this.args = args;
    }
}

class LambdaExpression {
    constructor(params, body) {
        this.type = "LambdaExpression";
        this.params = params;
        this.body = body;
    }
}

export {
    Program,
    AssignStatement,
    StoreStatement,
    UpdateStatement,
    BinaryExpression,
    Identifier,
    Literal,
    IfStatement,
    FunctionDeclaration,
    ReturnStatement,
    ArrayLiteral,
    ArrayAccess,
    CallExpression,
    RepeatUntil,
    ShowStatement,
    ErrorStatement,
    SkipStatement,
    HaltStatement,
    RepeatFor,
    RawJSBlock,
    InputExpression,
    MethodCall,
    LambdaExpression
};
