const TokenType = {
    // keywords
    ASSIGN: "ASSIGN",
    ALL: "ALL",
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

    // datatypes
    TYPE: "TYPE",

    // literals
    NUMBER: "NUMBER",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    NULL: "NULL",
    UNDEFINED: "UNDEFINED",

    IDENTIFIER: "IDENTIFIER",

    // operators
    EQUAL: "EQUAL",
    PLUS: "PLUS",
    MINUS: "MINUS",
    STAR: "STAR",
    SLASH: "SLASH",
    GT: "GT",
    LT: "LT",
    GTE: "GTE",
    LTE: "LTE",
    EQEQ: "EQEQ",
    NOTEQ: "NOTEQ",

    // symbols
    LBRACE: "LBRACE",
    RBRACE: "RBRACE",
    LBRACKET: "LBRACKET",
    RBRACKET: "RBRACKET",
    SEMICOLON: "SEMICOLON",
    COMMA: "COMMA",

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
};

const TYPES = [
    "string",
    "int",
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
    GT: ">",
    LT: "<",
    GTE: ">=",
    LTE: "<=",
    EQEQ: "===",
    NOTEQ: "!==",
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
