import { Lexer } from "../lexer/lexer.js";
import { TokenType } from "../lexer/tokens.js";
import { Parser } from "../parser/parser.js";
import { JSCodeGenerator } from "../generator/jsGenerator.js";

function tokenizeAll(code) {
    const lexer = new Lexer(code);
    const tokens = [];
    let t;
    do {
        t = lexer.getNextToken();
        tokens.push(t);
        //console.log(t);
    } while (t.type !== TokenType.EOF);
    return tokens;
}

function compile(code) {
    const tokens = tokenizeAll(code);
    const ast = new Parser(tokens).parseProgram();
    return new JSCodeGenerator().generate(ast);
}

function run(code) {
    const js = compile(code);
    return eval(js);
}

export { tokenizeAll, compile, run };
