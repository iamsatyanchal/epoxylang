import { TokenType, Token, KEYWORDS, TYPES } from "./tokens.js";

class Lexer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
        this.current = input[0];
    }

    advance() {
        this.pos++;
        this.current = this.pos < this.input.length ? this.input[this.pos] : null;
    }

    peek() {
        return this.pos + 1 < this.input.length ? this.input[this.pos + 1] : null;
    }

    skipWhitespace() {
        while (this.current && /\s/.test(this.current)) {
            this.advance();
        }
    }

    readNumber() {
        let num = "";
        let hasDecimal = false;

        while (this.current && (/[0-9]/.test(this.current) || (this.current === "." && !hasDecimal))) {
            if (this.current === ".") {
                hasDecimal = true;
            }
            num += this.current;
            this.advance();
        }
        return new Token(TokenType.NUMBER, Number(num));
    }

    readWord() {
        let word = "";
        while (this.current && /[a-zA-Z_]/.test(this.current)) {
            word += this.current;
            this.advance();
        }

        if (KEYWORDS[word]) {
            return new Token(KEYWORDS[word], word);
        }

        if (TYPES.includes(word)) {
            return new Token(TokenType.TYPE, word);
        }

        if (word === "true" || word === "false") {
            return new Token(TokenType.BOOLEAN, word === "true");
        }

        if (word === "null") {
            return new Token(TokenType.NULL, null);
        }

        if (word === "undefined") {
            return new Token(TokenType.UNDEFINED, undefined);
        }

        return new Token(TokenType.IDENTIFIER, word);
    }

    readString() {
        const quote = this.current;
        let value = "";
        this.advance();

        while (this.current && this.current !== quote) {
            value += this.current;
            this.advance();
        }

        if (this.current !== quote) {
            throw new Error("Unterminated string");
        }

        this.advance();

        return new Token(TokenType.STRING, value, {
            quoteType: quote
        });
    }

    readJSBlock() {
        // We're at '@', check if next chars are 'js~'
        this.advance(); // skip '@'

        // Read 'js'
        if (this.current !== 'j') {
            throw new Error("Expected 'js' after '@'");
        }
        this.advance();

        if (this.current !== 's') {
            throw new Error("Expected 'js' after '@'");
        }
        this.advance();

        // Skip any whitespace before ~
        this.skipWhitespace();
        if (this.current !== ':') {
            throw new Error("Expected ':' after '@js'");
        }
        this.advance();

        if (this.current !== '~') {
            throw new Error("Expected '~' after '@js'");
        }
        this.advance(); // skip opening '~'

        // Capture everything until closing '~'
        let code = "";

        while (this.current && this.current !== '~' && this.peek !== ':') {
            code += this.current;
            this.advance();
        }

        if (this.current !== '~' && this.peek !== ':') {
            throw new Error("Unterminated @js block - missing closing '~:'");
        }

        this.advance(); // skip closing '~'
        this.advance(); // skip closing ':'

        return new Token(TokenType.JSBLOCK, code);
    }

    getNextToken() {
        while (this.current) {
            if (/\s/.test(this.current)) {
                this.skipWhitespace();
                continue;
            }

            // comment
            if (this.current === "$") {
                while (this.current && this.current !== "\n") {
                    this.advance();
                }
                continue;
            }

            // @js blocks for raw JavaScript
            if (this.current === "@") return this.readJSBlock();

            if (/[0-9]/.test(this.current)) return this.readNumber();
            if (/[a-zA-Z_]/.test(this.current)) return this.readWord();
            if (`'"\``.includes(this.current)) return this.readString();

            // :input special syntax
            if (this.current === ":" && this.peek() === "i") {
                // Check if it's ":input"
                const saved = this.pos;
                this.advance(); // skip ':'
                let word = "";
                while (this.current && /[a-zA-Z_]/.test(this.current)) {
                    word += this.current;
                    this.advance();
                }
                if (word === "input") {
                    return new Token(TokenType.INPUT);
                }
                // Not :input, restore position
                this.pos = saved;
                this.current = this.input[this.pos];
                // If not :input, fall through to handle : as COLON token
            }

            // three-char operators (check BEFORE two-char!)
            const peek1 = this.peek();
            const peek2 = this.pos + 2 < this.input.length ? this.input[this.pos + 2] : null;
            const threeChar = this.current + peek1 + peek2;
            if (threeChar === "===") { this.advance(); this.advance(); this.advance(); return new Token(TokenType.EQEQEQ); }
            if (threeChar === "!==") { this.advance(); this.advance(); this.advance(); return new Token(TokenType.NOTEQEQ); }

            // double-char operators
            const twoChar = this.current + this.peek();
            if (twoChar === "==") { this.advance(); this.advance(); return new Token(TokenType.EQEQ); }
            if (twoChar === "!=") { this.advance(); this.advance(); return new Token(TokenType.NOTEQ); }
            if (twoChar === ">=") { this.advance(); this.advance(); return new Token(TokenType.GTE); }
            if (twoChar === "<=") { this.advance(); this.advance(); return new Token(TokenType.LTE); }
            if (twoChar === "->") { this.advance(); this.advance(); return new Token(TokenType.ARROW); }

            // single-char
            const single = {
                "=": TokenType.EQUAL,
                "+": TokenType.PLUS,
                "-": TokenType.MINUS,
                "*": TokenType.STAR,
                "/": TokenType.SLASH,
                "%": TokenType.MODULO,
                ">": TokenType.GT,
                "<": TokenType.LT,
                "{": TokenType.LBRACE,
                "}": TokenType.RBRACE,
                "[": TokenType.LBRACKET,
                "]": TokenType.RBRACKET,
                "(": TokenType.LPAREN,
                ")": TokenType.RPAREN,
                ";": TokenType.SEMICOLON,
                ",": TokenType.COMMA,
                ".": TokenType.DOT,
                ":": TokenType.COLON
            };

            if (single[this.current]) {
                const t = single[this.current];
                this.advance();
                return new Token(t);
            }

            throw new Error("Unknown character: " + this.current);
        }

        return new Token(TokenType.EOF);
    }
}

export { Lexer };