const TokenType = {
    // keywords
    ASSIGN: "ASSIGN",
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
    SNAFU: "SNAFU",
    SKIP: "SKIP",
    HALT: "HALT",
    METHOD: "METHOD",

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
    assign: TokenType.ASSIGN,
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
    snafu: TokenType.SNAFU,
    skip: TokenType.SKIP,
    halt: TokenType.HALT,
    method: TokenType.METHOD,
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
