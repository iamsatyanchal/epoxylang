import { TokenType } from "../lexer/tokens.js";
import {
    Program,
    AssignStatement,
    StoreStatement,
    UpdateStatement,
    BinaryExpression,
    Identifier,
    Literal,
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
} from "./ast.js";

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    current() {
        return this.tokens[this.pos];
    }

    eat(type) {
        if (this.current().type === type) {
            this.pos++;
        }
        else {
            throw new Error(
                `Expected ${type} but got ${this.current().type}`
            );
        }
    }

    peekType(offset = 1) {
        const token = this.tokens[this.pos + offset];
        return token ? token.type : null;
    }

    validateStoreString(token) {
        const text = token.value;

        // if contains 'call' outside [ ]
        const illegalCallOutsideBox = /(^|[^\[])\bcall\b/.test(text);
        const boxedCall = /\[.*\bcall\b.*\]/.test(text);

        if (illegalCallOutsideBox && !boxedCall) {
            throw new Error(
                "store: function calls must be inside [ ] interpolation"
            );
        }
    }

    parseProgram() {
        const statements = [];
        while (this.current().type !== TokenType.EOF) {
            statements.push(this.parseStatement());
        }
        return new Program(statements);
    }


    parseStatement() {
        const t = this.current().type;

        // Handle assign with optional all/fix prefix
        if (t === TokenType.ALL || t === TokenType.FIX || t === TokenType.ASSIGN) {
            // Check if it's assign (could be "assign", "all assign", or "fix assign")
            if (t === TokenType.ASSIGN) return this.parseAssign();
            if (this.peekType() === TokenType.ASSIGN) return this.parseAssign();
        }

        // Handle store with optional all/fix prefix
        if (t === TokenType.ALL || t === TokenType.FIX || t === TokenType.STORE) {
            // Check if it's store (could be "store", "all store", or "fix store")
            if (t === TokenType.STORE) return this.parseStore();
            if (this.peekType() === TokenType.STORE) return this.parseStore();
        }

        if (t === TokenType.UPDATE) return this.parseUpdate();
        if (t === TokenType.JSBLOCK) return this.parseJSBlock();
        if (t === TokenType.CHECK) return this.parseCheck();
        if (t === TokenType.MAKE) return this.parseMake();
        if (t === TokenType.CALL) return this.parseCall();
        if (t === TokenType.GIVE) return this.parseGive();
        if (t === TokenType.REPEAT && this.peekType() === TokenType.LBRACKET) return this.parseRepeatFor();
        if (t === TokenType.REPEAT) return this.parseRepeatUntil();
        if (t === TokenType.SHOW) return this.parseShow();
        if (t === TokenType.ERROR || t === TokenType.SNAFU) return this.parseError();
        if (t === TokenType.SKIP) return this.parseSkip();
        if (t === TokenType.HALT) return this.parseHalt();
        if (t === TokenType.METHOD) return this.parseMethodCall();

        throw new Error("Unknown statement: " + t);
    }


    parseAssign() {
        let isGlobal = false;
        let isFix = false;

        // Check for 'all' or 'fix' prefix
        if (this.current().type === TokenType.ALL) {
            isGlobal = true;
            this.eat(TokenType.ALL);
        } else if (this.current().type === TokenType.FIX) {
            isFix = true;
            this.eat(TokenType.FIX);
        }

        this.eat(TokenType.ASSIGN);

        const name = this.current().value;
        this.eat(TokenType.IDENTIFIER);

        let dataType = null;
        if (this.current().type === TokenType.AS) {
            this.eat(TokenType.AS);
            dataType = this.current().value;
            this.eat(TokenType.TYPE);
        }

        // Check if this is a declaration without assignment
        if (this.current().type === TokenType.SEMICOLON) {
            // Declaration only: assign name as type;
            if (!dataType) {
                throw new Error(
                    "assign: datatype required when declaring variable without value"
                );
            }
            this.eat(TokenType.SEMICOLON);
            return new AssignStatement({
                isGlobal,
                isFix,
                name,
                dataType,
                value: null
            });
        }

        this.eat(TokenType.EQUAL);
        const value = this.parseExpression();

        // enforce rule
        if (value.type === "CallExpression" && !dataType) {
            throw new Error(
                "assign: datatype required when assigning function call result"
            );
        }
        if (value.type === "ArrayLiteral" && dataType !== "array") {
            throw new Error("assign: array literal requires 'as array'");
        }

        this.eat(TokenType.SEMICOLON);

        return new AssignStatement({
            isGlobal,
            isFix,
            name,
            dataType,
            value
        });
    }

    parseStore() {
        let isGlobal = false;
        let isFix = false;

        // Check for 'all' or 'fix' prefix
        if (this.current().type === TokenType.ALL) {
            isGlobal = true;
            this.eat(TokenType.ALL);
        } else if (this.current().type === TokenType.FIX) {
            isFix = true;
            this.eat(TokenType.FIX);
        }

        this.eat(TokenType.STORE);
        const name = this.current().value;
        this.eat(TokenType.IDENTIFIER);
        this.eat(TokenType.EQUAL);

        const str = this.current();
        if (str.type !== TokenType.STRING || str.meta.quoteType !== "`") {
            throw new Error("store requires backtick string only");
        }

        this.validateStoreString(str);

        this.eat(TokenType.STRING);
        this.eat(TokenType.SEMICOLON);

        return new StoreStatement({ isGlobal, isFix, name, value: str.value });
    }

    parseUpdate() {
        this.eat(TokenType.UPDATE);
        const name = this.current().value;
        this.eat(TokenType.IDENTIFIER);
        this.eat(TokenType.EQUAL);
        const value = this.parseExpression();
        this.eat(TokenType.SEMICOLON);

        return new UpdateStatement({ name, value });
    }

    parseJSBlock() {
        const code = this.current().value;
        this.eat(TokenType.JSBLOCK);
        return new RawJSBlock(code);
    }

    parseValue() {
        const token = this.current();

        if (
            token.type === TokenType.NUMBER ||
            token.type === TokenType.STRING ||
            token.type === TokenType.BOOLEAN ||
            token.type === TokenType.NULL ||
            token.type === TokenType.UNDEFINED ||
            token.type === TokenType.IDENTIFIER
        ) {
            this.pos++;
            return token;
        }

        throw new Error(`Invalid value: ${token.type}`);
    }

    parsePrimary() {
        const tok = this.current();

        // Handle unary minus for negative numbers
        if (tok.type === TokenType.MINUS) {
            this.eat(TokenType.MINUS);
            const expr = this.parsePrimary();
            // If it's a literal number, negate it directly
            if (expr.type === "Literal" && typeof expr.value === "number") {
                return new Literal(-expr.value);
            }
            // Otherwise create a binary expression: 0 - expr
            return new BinaryExpression(new Literal(0), TokenType.MINUS, expr);
        }

        // Handle unary plus (just ignore it)
        if (tok.type === TokenType.PLUS) {
            this.eat(TokenType.PLUS);
            return this.parsePrimary();
        }

        // Parentheses for precedence
        if (tok.type === TokenType.LPAREN) {
            this.eat(TokenType.LPAREN);
            const expr = this.parseExpression();
            this.eat(TokenType.RPAREN);
            return expr;
        }

        // literals
        if (
            tok.type === TokenType.NUMBER ||
            tok.type === TokenType.STRING ||
            tok.type === TokenType.BOOLEAN ||
            tok.type === TokenType.NULL ||
            tok.type === TokenType.UNDEFINED
        ) {
            this.pos++;
            return new Literal(tok.value);
        }

        // :input special value
        if (tok.type === TokenType.INPUT) {
            this.pos++;
            return new InputExpression();
        }

        // call expression or lambda
        if (tok.type === TokenType.CALL) {
            this.eat(TokenType.CALL);

            // Check if this is a lambda: call [param] -> body
            if (this.current().type === TokenType.LBRACKET) {
                this.eat(TokenType.LBRACKET);

                // Parse parameters
                const params = [];
                if (this.current().type !== TokenType.RBRACKET) {
                    params.push(this.current().value);
                    this.eat(TokenType.IDENTIFIER);

                    while (this.current().type === TokenType.COMMA) {
                        this.eat(TokenType.COMMA);
                        params.push(this.current().value);
                        this.eat(TokenType.IDENTIFIER);
                    }
                }

                this.eat(TokenType.RBRACKET);

                // Check for arrow
                if (this.current().type === TokenType.ARROW) {
                    this.eat(TokenType.ARROW);
                    const body = this.parseExpression();
                    return new LambdaExpression(params, body);
                }
            }

            // Regular function call: call functionName[args]
            const name = this.current().value;
            this.eat(TokenType.IDENTIFIER);

            this.eat(TokenType.LBRACKET);
            const args = [];

            if (this.current().type !== TokenType.RBRACKET) {
                args.push(this.parseExpression());
                while (this.current().type === TokenType.COMMA) {
                    this.eat(TokenType.COMMA);
                    args.push(this.parseExpression());
                }
            }

            this.eat(TokenType.RBRACKET);

            return new CallExpression(name, args);
        }

        // array literal
        if (this.current().type === TokenType.LBRACE) {
            this.eat(TokenType.LBRACE);

            const elements = [];
            if (this.current().type !== TokenType.RBRACE) {
                elements.push(this.parseExpression());

                while (this.current().type === TokenType.COMMA) {
                    this.eat(TokenType.COMMA);
                    elements.push(this.parseExpression());
                }
            }

            this.eat(TokenType.RBRACE);
            return new ArrayLiteral(elements);
        }


        // identifier
        if (tok.type === TokenType.IDENTIFIER) {
            this.pos++;
            let node = new Identifier(tok.value);

            // array access: test{index}
            if (this.current().type === TokenType.LBRACE) {
                this.eat(TokenType.LBRACE);
                const index = this.parseExpression();
                this.eat(TokenType.RBRACE);
                node = new ArrayAccess(node, index);
            }

            return node;
        }

        // method call as expression
        if (tok.type === TokenType.METHOD) {
            this.eat(TokenType.METHOD);
            this.eat(TokenType.COLON);

            // Get the target type (array or string)
            const targetType = this.current().value;
            this.eat(TokenType.TYPE);

            // Get the target variable
            const target = this.current().value;
            this.eat(TokenType.IDENTIFIER);

            this.eat(TokenType.DOT);

            // Get the method name
            const methodName = this.current().value;
            this.eat(TokenType.IDENTIFIER);

            // Parse arguments in brackets
            this.eat(TokenType.LBRACKET);
            const args = [];

            if (this.current().type !== TokenType.RBRACKET) {
                args.push(this.parseExpression());
                while (this.current().type === TokenType.COMMA) {
                    this.eat(TokenType.COMMA);
                    args.push(this.parseExpression());
                }
            }

            this.eat(TokenType.RBRACKET);

            return new MethodCall(targetType, target, methodName, args);
        }

        throw new Error("Invalid primary expression: " + tok.type);
    }

    parseFactor() {
        let node = this.parsePrimary();

        while (
            this.current().type === TokenType.STAR ||
            this.current().type === TokenType.SLASH ||
            this.current().type === TokenType.MODULO
        ) {
            const op = this.current().type;
            this.pos++;
            const right = this.parsePrimary();
            node = new BinaryExpression(node, op, right);
        }

        return node;
    }

    parseTerm() {
        let node = this.parseFactor();

        while (
            this.current().type === TokenType.PLUS ||
            this.current().type === TokenType.MINUS
        ) {
            const op = this.current().type;
            this.pos++;
            const right = this.parseFactor();
            node = new BinaryExpression(node, op, right);
        }

        return node;
    }

    parseComparison() {
        let node = this.parseTerm();

        while (
            [
                TokenType.GT, TokenType.LT,
                TokenType.GTE, TokenType.LTE,
                TokenType.EQEQ, TokenType.NOTEQ,
                TokenType.EQEQEQ, TokenType.NOTEQEQ
            ].includes(this.current().type)
        ) {
            const op = this.current().type;
            this.pos++;
            const right = this.parseTerm();
            node = new BinaryExpression(node, op, right);
        }

        return node;
    }

    parseCheck() {
        this.eat(TokenType.CHECK);
        this.eat(TokenType.LBRACKET);
        const condition = this.parseExpression();
        this.eat(TokenType.RBRACKET);

        this.eat(TokenType.LBRACE);
        const body = [];
        while (this.current().type !== TokenType.RBRACE) {
            body.push(this.parseStatement());
        }
        this.eat(TokenType.RBRACE);

        const orChecks = [];
        while (this.current().type === TokenType.OR) {
            this.eat(TokenType.OR);
            this.eat(TokenType.CHECK);
            this.eat(TokenType.LBRACKET);
            const c = this.parseExpression();
            this.eat(TokenType.RBRACKET);

            this.eat(TokenType.LBRACE);
            const b = [];
            while (this.current().type !== TokenType.RBRACE) {
                b.push(this.parseStatement());
            }
            this.eat(TokenType.RBRACE);

            orChecks.push({ condition: c, body: b });
        }

        let altBody = null;
        if (this.current().type === TokenType.ALT) {
            this.eat(TokenType.ALT);
            this.eat(TokenType.LBRACE);
            altBody = [];
            while (this.current().type !== TokenType.RBRACE) {
                altBody.push(this.parseStatement());
            }
            this.eat(TokenType.RBRACE);
        }

        return { type: "IfChain", condition, body, orChecks, altBody };
    }

    parseMake() {
        this.eat(TokenType.MAKE);
        const name = this.current().value;
        this.eat(TokenType.IDENTIFIER);

        this.eat(TokenType.LBRACKET);
        const params = [];
        if (this.current().type !== TokenType.RBRACKET) {
            params.push(this.current().value);
            this.eat(TokenType.IDENTIFIER);

            while (this.current().type === TokenType.COMMA) {
                this.eat(TokenType.COMMA);
                params.push(this.current().value);
                this.eat(TokenType.IDENTIFIER);
            }
        }
        this.eat(TokenType.RBRACKET);

        this.eat(TokenType.LBRACE);

        const body = [];
        while (this.current().type !== TokenType.RBRACE) {
            body.push(this.parseStatement());
        }
        this.eat(TokenType.RBRACE);

        return new FunctionDeclaration(name, params, body);
    }

    parseGive() {
        this.eat(TokenType.GIVE);
        const value = this.parseExpression();
        this.eat(TokenType.SEMICOLON);
        return new ReturnStatement(value);
    }

    parseCall() {
        this.eat(TokenType.CALL);
        const name = this.current().value;
        this.eat(TokenType.IDENTIFIER);

        this.eat(TokenType.LBRACKET);
        const args = [];
        if (this.current().type !== TokenType.RBRACKET) {
            args.push(this.parseExpression());
            while (this.current().type === TokenType.COMMA) {
                this.eat(TokenType.COMMA);
                args.push(this.parseExpression());
            }
        }
        this.eat(TokenType.RBRACKET);
        this.eat(TokenType.SEMICOLON);

        return new CallExpression(name, args);
    }

    parseRepeatUntil() {
        this.eat(TokenType.REPEAT);
        this.eat(TokenType.UNTIL);
        this.eat(TokenType.LBRACKET);

        const condition = this.parseExpression();

        this.eat(TokenType.RBRACKET);
        this.eat(TokenType.LBRACE);

        const body = [];
        while (this.current().type !== TokenType.RBRACE) {
            body.push(this.parseStatement());
        }
        this.eat(TokenType.RBRACE);

        return new RepeatUntil(condition, body);
    }

    parseExpression() {
        return this.parseLogicalOr();
    }

    parseLogicalOr() {
        let node = this.parseLogicalAnd();

        while (this.current().type === TokenType.OR) {
            this.eat(TokenType.OR);
            const right = this.parseLogicalAnd();
            node = new BinaryExpression(node, "OR", right);
        }

        return node;
    }

    parseLogicalAnd() {
        let node = this.parseComparison();

        while (this.current().type === TokenType.AND) {
            this.eat(TokenType.AND);
            const right = this.parseComparison();
            node = new BinaryExpression(node, "AND", right);
        }

        return node;
    }

    parseRepeatFor() {
        this.eat(TokenType.REPEAT);
        this.eat(TokenType.LBRACKET);

        const varName = this.current().value;
        this.eat(TokenType.IDENTIFIER);

        this.eat(TokenType.IN);

        // Check if this is array iteration: repeat[x in arrayName]
        // or numeric range: repeat[i in 0 to 5, 1]
        const firstToken = this.current();

        if (firstToken.type === TokenType.IDENTIFIER && this.peekType(1) === TokenType.RBRACKET) {
            // Array iteration: repeat[x in arrayName]
            const arrayName = firstToken.value;
            this.eat(TokenType.IDENTIFIER);
            this.eat(TokenType.RBRACKET);
            this.eat(TokenType.LBRACE);

            const body = [];
            while (this.current().type !== TokenType.RBRACE) {
                body.push(this.parseStatement());
            }
            this.eat(TokenType.RBRACE);

            return new RepeatFor(varName, null, null, null, body, arrayName);
        } else {
            // Numeric range: repeat[i in 0 to 5, 1]
            const start = this.parseExpression();
            this.eat(TokenType.TO);
            const end = this.parseExpression();

            this.eat(TokenType.COMMA);
            const step = this.parseExpression();

            this.eat(TokenType.RBRACKET);
            this.eat(TokenType.LBRACE);

            const body = [];
            while (this.current().type !== TokenType.RBRACE) {
                body.push(this.parseStatement());
            }
            this.eat(TokenType.RBRACE);

            return new RepeatFor(varName, start, end, step, body);
        }
    }

    parseShow() {
        this.eat(TokenType.SHOW);

        // allow full expressions
        const value = this.parseExpression();

        this.eat(TokenType.SEMICOLON);

        return new ShowStatement(value);
    }

    parseError() {
        // Handle both 'error' and 'snafu' keywords
        if (this.current().type === TokenType.ERROR) {
            this.eat(TokenType.ERROR);
        } else {
            this.eat(TokenType.SNAFU);
        }

        // allow full expressions
        const value = this.parseExpression();

        this.eat(TokenType.SEMICOLON);

        return new ErrorStatement(value);
    }

    parseSkip() {
        this.eat(TokenType.SKIP);
        this.eat(TokenType.SEMICOLON);
        return new SkipStatement();
    }

    parseHalt() {
        this.eat(TokenType.HALT);
        this.eat(TokenType.SEMICOLON);
        return new HaltStatement();
    }

    parseMethodCall() {
        this.eat(TokenType.METHOD);
        this.eat(TokenType.COLON);

        // Get the target type (array or string)
        const targetType = this.current().value;
        this.eat(TokenType.TYPE);

        // Get the target variable
        const target = this.current().value;
        this.eat(TokenType.IDENTIFIER);

        this.eat(TokenType.DOT);

        // Get the method name
        const methodName = this.current().value;
        this.eat(TokenType.IDENTIFIER);

        // Parse arguments in brackets
        this.eat(TokenType.LBRACKET);
        const args = [];

        if (this.current().type !== TokenType.RBRACKET) {
            args.push(this.parseExpression());
            while (this.current().type === TokenType.COMMA) {
                this.eat(TokenType.COMMA);
                args.push(this.parseExpression());
            }
        }

        this.eat(TokenType.RBRACKET);
        this.eat(TokenType.SEMICOLON);

        return new MethodCall(targetType, target, methodName, args);
    }

}

export { Parser };