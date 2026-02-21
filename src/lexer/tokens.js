const TokenType = {
    // keywords
    ALL: "ALL",
    FIX: "FIX",
    UPDATE: "UPDATE",
    STORE: "STORE",
    MAKE: "MAKE",
    CALL: "CALL",
    GIVE: "GIVE",
    CHECK: "CHECK",
    ALT: "ALT",
    REPEAT: "REPEAT",
    UNTIL: "UNTIL",
    IN: "IN",
    TO: "TO",
    OR: "OR",
    AND: "AND",
    AS: "AS",
    SHOW: "SHOW",
    ERROR: "ERROR",
    PANIC: "PANIC",
    SKIP: "SKIP",
    HALT: "HALT",
    METHOD: "METHOD",
    FOR: "FOR",

    // datatypes
    TYPE: "TYPE",

    // literals
    NUMBER: "NUMBER",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    NULL: "NULL",
    UNDEFINED: "UNDEFINED",
    INPUT: "INPUT",

    IDENTIFIER: "IDENTIFIER",

    // raw javascript
    JSBLOCK: "JSBLOCK",

    // operators
    EQUAL: "EQUAL",
    PLUS: "PLUS",
    MINUS: "MINUS",
    STAR: "STAR",
    POWER: "POWER",
    SLASH: "SLASH",
    MODULO: "MODULO",
    GT: "GT",
    LT: "LT",
    GTE: "GTE",
    LTE: "LTE",
    EQEQ: "EQEQ",
    EQEQEQ: "EQEQEQ",
    NOTEQ: "NOTEQ",
    NOTEQEQ: "NOTEQEQ",
    ARROW: "ARROW",

    // symbols
    LBRACE: "LBRACE",
    RBRACE: "RBRACE",
    LBRACKET: "LBRACKET",
    RBRACKET: "RBRACKET",
    LPAREN: "LPAREN",
    RPAREN: "RPAREN",
    SEMICOLON: "SEMICOLON",
    COMMA: "COMMA",
    DOT: "DOT",
    COLON: "COLON",
    PIPE: "PIPE",

    EOF: "EOF"
};

class Token {
    constructor(type, value = null, meta = {}) {
        this.type = type;
        this.value = value;
        this.meta = meta;
    }
}

const KEYWORDS = {
    all: TokenType.ALL,
    fix: TokenType.FIX,
    update: TokenType.UPDATE,
    store: TokenType.STORE,
    make: TokenType.MAKE,
    call: TokenType.CALL,
    give: TokenType.GIVE,
    check: TokenType.CHECK,
    alt: TokenType.ALT,
    repeat: TokenType.REPEAT,
    until: TokenType.UNTIL,
    in: TokenType.IN,
    to: TokenType.TO,
    or: TokenType.OR,
    and: TokenType.AND,
    as: TokenType.AS,
    show: TokenType.SHOW,
    error: TokenType.ERROR,
    panic: TokenType.PANIC,
    skip: TokenType.SKIP,
    halt: TokenType.HALT,
    method: TokenType.METHOD,
    for: TokenType.FOR,
};

const TYPES = [
    "string",
    "int",
    "double",
    "bool",
    "array",
    "null",
    "undefined",
    "object"
];

const OP_MAP = {
    PLUS: "+",
    MINUS: "-",
    STAR: "*",
    POWER: "**",
    SLASH: "/",
    MODULO: "%",
    GT: ">",
    LT: "<",
    GTE: ">=",
    LTE: "<=",
    EQEQ: "==",
    EQEQEQ: "===",
    NOTEQ: "!=",
    NOTEQEQ: "!==",
    AND: "&&",
    OR: "||"
};

export {
    TokenType,
    Token,
    KEYWORDS,
    TYPES,
    OP_MAP
};
