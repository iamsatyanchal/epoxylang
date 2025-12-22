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
        while (this.current && /[0-9]/.test(this.current)) {
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

            if (/[0-9]/.test(this.current)) return this.readNumber();
            if (/[a-zA-Z_]/.test(this.current)) return this.readWord();
            if (`'"\``.includes(this.current)) return this.readString();

            // double-char operators
            const twoChar = this.current + this.peek();
            if (twoChar === "==") { this.advance(); this.advance(); return new Token(TokenType.EQEQ); }
            if (twoChar === "!=") { this.advance(); this.advance(); return new Token(TokenType.NOTEQ); }
            if (twoChar === ">=") { this.advance(); this.advance(); return new Token(TokenType.GTE); }
            if (twoChar === "<=") { this.advance(); this.advance(); return new Token(TokenType.LTE); }

            // single-char
            const single = {
                "=": TokenType.EQUAL,
                "+": TokenType.PLUS,
                "-": TokenType.MINUS,
                "*": TokenType.STAR,
                "/": TokenType.SLASH,
                ">": TokenType.GT,
                "<": TokenType.LT,
                "{": TokenType.LBRACE,
                "}": TokenType.RBRACE,
                "[": TokenType.LBRACKET,
                "]": TokenType.RBRACKET,
                ";": TokenType.SEMICOLON,
                ",": TokenType.COMMA
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