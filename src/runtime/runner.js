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
    // remove this before reading yrr `_of_epoxy_lang_dont_use_this_name` idk why but i love playing XD
    const typeCheckingRuntime = `
const __epoxy_types___of_epoxy_lang_dont_use_this_name = {};
const __epoxy_function_types___of_epoxy_lang_dont_use_this_name = {};
function __epoxy_normalizeType___of_epoxy_lang_dont_use_this_name(type) {
    if (type === "int" || type === "double") return "number";
    if (type === "bool" || type === "boolean") return "bool";
    return type;
}
function __epoxy_store___of_epoxy_lang_dont_use_this_name(name, value, type) {
    if (type) {
        __epoxy_types___of_epoxy_lang_dont_use_this_name[name] = __epoxy_normalizeType___of_epoxy_lang_dont_use_this_name(type);
    }
    // value parameter is ignored - only used for type registration
}
function __epoxy_update___of_epoxy_lang_dont_use_this_name(name, value) {
    if (__epoxy_types___of_epoxy_lang_dont_use_this_name[name]) {
        const expectedType = __epoxy_types___of_epoxy_lang_dont_use_this_name[name];
        const actualType = __epoxy_getType___of_epoxy_lang_dont_use_this_name(value);
        if (actualType !== expectedType) {
            throw new TypeError(
                \`Type mismatch: Cannot assign \${actualType} to variable '\${name}' of type \${expectedType}\`
            );
        }
    }
    return value;
}
function __epoxy_getType___of_epoxy_lang_dont_use_this_name(value) {
    if (Array.isArray(value)) return "array";
    const jsType = typeof value;
    if (jsType === "number") return "number";
    if (jsType === "boolean") return "bool";
    return jsType;
}
function __epoxy_register_function___of_epoxy_lang_dont_use_this_name(name, returnType) {
    if (returnType) {
        __epoxy_function_types___of_epoxy_lang_dont_use_this_name[name] = __epoxy_normalizeType___of_epoxy_lang_dont_use_this_name(returnType);
    }
}
function __epoxy_validate_return___of_epoxy_lang_dont_use_this_name(funcName, returnValue) {
    if (__epoxy_function_types___of_epoxy_lang_dont_use_this_name[funcName]) {
        const expectedType = __epoxy_function_types___of_epoxy_lang_dont_use_this_name[funcName];
        const actualType = __epoxy_getType___of_epoxy_lang_dont_use_this_name(returnValue);
        if (actualType !== expectedType) {
            throw new TypeError(
                \`Function '\${funcName}' return type mismatch: expected \${expectedType}, got \${actualType}\`
            );
        }
    }
    return returnValue;
}
function __epoxy_validate_store___of_epoxy_lang_dont_use_this_name(funcName, value, expectedType) {
    // If variable has a type.. validate it bro
    if (expectedType) {
        const normalizedExpected = __epoxy_normalizeType___of_epoxy_lang_dont_use_this_name(expectedType);
        // If function has a declared return type.. check it matches :)
        if (__epoxy_function_types___of_epoxy_lang_dont_use_this_name[funcName]) {
            const funcReturnType = __epoxy_function_types___of_epoxy_lang_dont_use_this_name[funcName];
            if (funcReturnType !== normalizedExpected) {
                throw new TypeError(
                    \`Type mismatch: Cannot store function '\${funcName}' (returns \${funcReturnType}) into variable of type \${normalizedExpected}\`
                );
            }
        } else {
            // Function has no declared type but variable does.. kya bakchodi hai yrr check actual value type fkk it
            const actualType = __epoxy_getType___of_epoxy_lang_dont_use_this_name(value);
            if (actualType !== normalizedExpected) {
                throw new TypeError(
                    \`Type mismatch: Cannot store value of type \${actualType} from function '\${funcName}' into variable of type \${normalizedExpected}\`
                );
            }
        }
    }
    return value;
}`;
    const importinglangfuncs = `const promptSync_of_epoxy_lang_dont_use_this_name = require("prompt-sync");
const input_of_epoxy_lang_dont_use_this_name = promptSync_of_epoxy_lang_dont_use_this_name();
function smartConvert_of_epoxy_lang_dont_use_this_name(input) { try { return JSON.parse(input); } catch (e) { return input; } }`
    const finalcode_input = `
    ${typeCheckingRuntime}
    ${importinglangfuncs}
    ${js}`;
    const finalcode_noinput = `
    ${typeCheckingRuntime}
    ${js}`;
    const thisisthecode = js.includes("smartConvert_of_epoxy_lang_dont_use_this_name(input_of_epoxy_lang_dont_use_this_name())")
        ? finalcode_input
        : finalcode_noinput;
    //console.log(thisisthecode);
    return eval(thisisthecode);
}

export { tokenizeAll, compile, run };
