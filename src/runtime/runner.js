import { Lexer } from "../lexer/lexer.js";
import { TokenType } from "../lexer/tokens.js";
import { Parser } from "../parser/parser.js";
import { JSCodeGenerator } from "../generator/jsgenerator.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function tokenizeAll(code) {
    const lexer = new Lexer(code);
    const tokens = [];
    let t;
    do {
        t = lexer.getNextToken();
        tokens.push(t);
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

    const finalcode_input = `
const promptSync_of_epoxy_lang_dont_use_this_name = require("prompt-sync");
const input_of_epoxy_lang_dont_use_this_name = promptSync_of_epoxy_lang_dont_use_this_name();
${js}
`;

    const thisisthecode = js.includes("input_of_epoxy_lang_dont_use_this_name()")
        ? finalcode_input
        : js;

    return eval(thisisthecode);
}

export { tokenizeAll, compile, run };