class Program {
    constructor(statements) {
        this.type = "Program";
        this.statements = statements;
    }
}

class AssignStatement {
    constructor({ isGlobal, name, dataType, value }) {
        this.type = "AssignStatement";
        this.isGlobal = isGlobal;
        this.name = name;
        this.dataType = dataType; //null allowed
        this.value = value;
    }
}

class StoreStatement {
    constructor({ name, value }) {
        this.type = "StoreStatement";
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

class RepeatFor {
    constructor(varName, start, end, step, body) {
        this.type = "RepeatFor";
        this.varName = varName;
        this.start = start;
        this.end = end;
        this.step = step;
        this.body = body;
    }
}

export {
    Program,
    AssignStatement,
    StoreStatement,
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
    RepeatFor
};
