import { OP_MAP, TokenType } from "../lexer/tokens.js";
import { Parser } from "../parser/parser.js";
import { tokenizeAll } from "../runtime/runner.js";

class JSCodeGenerator {
    constructor() {
        this.output = "";
    }

    generate(node) {
        return this.visit(node);
    }

    visit(node) {
        switch (node.type) {
            case "Program":
                return node.statements.map(s => this.visit(s)).join("\n");
            case "AssignStatement":
                return this.visitAssignStatement(node);
            case "UpdateStatement":
                return this.visitUpdateStatement(node);
            case "RawJSBlock":
                return this.visitRawJSBlock(node);
            case "BinaryExpression": return this.visitBinaryExpression(node);
            case "Literal": return this.visitLiteral(node);
            case "Identifier": return this.visitIdentifier(node);
            case "InputExpression": return this.visitInputExpression(node);
            case "StoreStatement": return this.visitStoreStatement(node);
            case "ShowStatement": return this.visitShowStatement(node);
            case "ErrorStatement": return this.visitErrorStatement(node);
            case "SkipStatement": return this.visitSkipStatement(node);
            case "HaltStatement": return this.visitHaltStatement(node);
            case "FunctionDeclaration": return this.visitFunctionDeclaration(node);
            case "ReturnStatement": return this.visitReturnStatement(node);
            case "CallExpression": return this.visitCallExpression(node);
            case "IfChain": return this.visitIfChain(node);
            case "RepeatFor": return this.visitRepeatFor(node);
            case "RepeatUntil": return this.visitRepeatUntil(node);
            case "ArrayLiteral": return this.visitArrayLiteral(node);
            case "ArrayAccess": return this.visitArrayAccess(node);
            case "MethodCall": return this.visitMethodCall(node);
            case "LambdaExpression": return this.visitLambdaExpression(node);
            default:
                throw new Error("Unknown AST node: " + node.type);
        }
    }


    visitAssignStatement(node) {
        // Determine the JavaScript keyword based on mutability flags
        let keyword;
        if (node.isFix) {
            keyword = "const";
        } else if (node.isGlobal) {
            keyword = "var";
        } else {
            keyword = "let";
        }

        // Handle declaration without assignment
        if (node.value === null) {
            return `${keyword} ${node.name};`;
        }

        const value = this.visit(node.value);
        return `${keyword} ${node.name} = ${value};`;
    }

    visitUpdateStatement(node) {
        const value = this.visit(node.value);
        return `${node.name} = ${value};`;
    }

    visitRawJSBlock(node) {
        // Return the raw JavaScript code as-is
        return node.code;
    }

    visitBinaryExpression(node) {
        const left = this.visit(node.left);
        const right = this.visit(node.right);
        const op = OP_MAP[node.operator];
        return `(${left} ${op} ${right})`;
    }


    visitLiteral(node) {
        if (typeof node.value === "string") {
            return JSON.stringify(node.value);
        }
        return String(node.value);
    }

    visitIdentifier(node) {
        return node.name;
    }

    visitInputExpression(node) {
        return "input_of_epoxy_lang_dont_use_this_name()";
    }

    convertInterpolation(text) {
        let result = "";
        let i = 0;

        while (i < text.length) {
            if (text[i] === "[") {
                let depth = 1;
                let expr = "";
                i++; // skip '['

                while (i < text.length && depth > 0) {
                    if (text[i] === "[") depth++;
                    else if (text[i] === "]") depth--;

                    if (depth > 0) expr += text[i];
                    i++;
                }

                if (depth !== 0) {
                    throw new Error("Unmatched [ in store interpolation");
                }

                // parse boxed expression safely
                const jsExpr = this.convertInlineExpression(expr.trim());
                result += "${" + jsExpr + "}";

            } else {
                result += text[i];
                i++;
            }
        }

        return result;
    }


    convertInlineExpression(expr) {
        const tokens = tokenizeAll(expr);
        const parser = new Parser(tokens);
        const ast = parser.parseExpression();

        if (parser.current().type !== TokenType.EOF) {
            throw new Error("Invalid expression inside [ ]");
        }

        return this.visit(ast);
    }


    visitStoreStatement(node) {
        // Determine the JavaScript keyword based on mutability flags
        let keyword;
        if (node.isFix) {
            keyword = "const";
        } else if (node.isGlobal) {
            keyword = "var";
        } else {
            keyword = "let";
        }

        const interpolated = this.convertInterpolation(node.value);
        return `${keyword} ${node.name} = \`${interpolated}\`;`;
    }

    visitShowStatement(node) {
        // Check if the value is a backtick string literal that needs interpolation
        if (node.value.type === "Literal" && typeof node.value.value === "string") {
            // We need to check the original token to see if it was a backtick string
            // Since we don't have access to the token here, we'll handle it differently
            // by creating a template literal if the string contains []
            const str = node.value.value;
            if (str.includes("[") && str.includes("]")) {
                // This might be an interpolated string, convert it
                const interpolated = this.convertInterpolation(str);
                return `console.log(\`${interpolated}\`);`;
            }
        }
        return `console.log(${this.visit(node.value)});`;
    }

    visitErrorStatement(node) {
        // Check if the value is a backtick string literal that needs interpolation
        if (node.value.type === "Literal" && typeof node.value.value === "string") {
            const str = node.value.value;
            if (str.includes("[") && str.includes("]")) {
                // This might be an interpolated string, convert it
                const interpolated = this.convertInterpolation(str);
                return `console.error("\x1b[31m" + \`${interpolated}\` + "\x1b[0m");`;
            }
        }
        return `console.error("\x1b[31m" + ${this.visit(node.value)} + "\x1b[0m");`;
    }

    visitSkipStatement(node) {
        return "continue;";
    }

    visitHaltStatement(node) {
        return "break;";
    }

    visitFunctionDeclaration(node) {
        const params = node.params.join(", ");
        const body = node.body.map(s => this.visit(s)).join("\n");
        return `function ${node.name} (${params}) { \n${body} \n } `;
    }

    visitReturnStatement(node) {
        return `return ${this.visit(node.value)}; `;
    }

    visitArrayLiteral(node) {
        const items = node.elements.map(e => this.visit(e)).join(", ");
        return `[${items}]`;
    }

    visitArrayAccess(node) {
        const arr = this.visit(node.array);
        const idx = this.visit(node.index);
        return `${arr} [${idx}]`;
    }

    visitCallExpression(node) {
        const args = node.args.map(a => this.visit(a)).join(", ");
        return `${node.name} (${args})`;
    }

    visitIfChain(node) {
        let code = `if (${this.visit(node.condition)}) {
\n`;
        code += node.body.map(s => this.visit(s)).join("\n");
        code += "\n}";

        for (const oc of node.orChecks) {
            code += ` else if (${this.visit(oc.condition)}) {
    \n`;
            code += oc.body.map(s => this.visit(s)).join("\n");
            code += "\n}";
        }

        if (node.altBody) {
            code += ` else {
        \n`;
            code += node.altBody.map(s => this.visit(s)).join("\n");
            code += "\n}";
        }

        return code;
    }

    visitRepeatFor(node) {
        const v = node.varName;
        const body = node.body.map(s => this.visit(s)).join("\n");

        // Handle array iteration: repeat[x in arrayName]
        if (node.arrayName) {
            return `
            for (let ${v} = 0; ${v} < ${node.arrayName}.length; ${v} ++) {
${body}
            } `.trim();
        }

        // Handle numeric range with bidirectional support
        const start = this.visit(node.start);
        const end = this.visit(node.end);
        const step = this.visit(node.step);

        // Generate bidirectional loop: compare start and end at runtime
        // If start <= end: increment, else: decrement
        return `
            for (let ${v} = ${start}; ${start} <= ${end} ? ${v} <= ${end} : ${v} >= ${end}; ${start} <= ${end} ? ${v} += ${step} : ${v} -= ${step}) {
${body}
            } `.trim();
    }

    visitRepeatUntil(node) {
        const condition = this.visit(node.condition);
        const body = node.body.map(s => this.visit(s)).join("\n");

        return `
            do {
${body}
            } while (!(${condition})); `.trim();
    }

    visitMethodCall(node) {
        const target = node.target;
        const methodName = node.methodName;
        const args = node.args;

        // Array methods
        if (node.targetType === "array") {
            switch (methodName) {
                case "append":
                    // .append[value] -> .push(value)
                    if (args.length !== 1) {
                        throw new Error("append requires exactly 1 argument");
                    }
                    return `${target}.push(${this.visit(args[0])})`;

                case "pop":
                    // .pop[] -> .pop()
                    return `${target}.pop()`;

                case "includes":
                    // .includes[value] -> .includes(value)
                    if (args.length !== 1) {
                        throw new Error("includes requires exactly 1 argument");
                    }
                    return `${target}.includes(${this.visit(args[0])})`;

                case "filter":
                    // .filter[call [x] -> x % 2 == 0] -> .filter((x) => x % 2 === 0)
                    if (args.length !== 1) {
                        throw new Error("filter requires exactly 1 argument (lambda function)");
                    }
                    return `${target}.filter(${this.visit(args[0])})`;

                case "map":
                    // .map[call [x] -> x * 2] -> .map((x) => x * 2)
                    if (args.length !== 1) {
                        throw new Error("map requires exactly 1 argument (lambda function)");
                    }
                    return `${target}.map(${this.visit(args[0])})`;

                case "join":
                    // .join[separator] -> .join(separator) or .join() for default
                    if (args.length === 0) {
                        return `${target}.join()`;
                    } else if (args.length === 1) {
                        return `${target}.join(${this.visit(args[0])})`;
                    } else {
                        throw new Error("join requires 0 or 1 argument");
                    }

                case "slice":
                    // .slice[pythonSlice] -> .slice(start, end)
                    if (args.length !== 1) {
                        throw new Error("slice requires exactly 1 argument (slice notation)");
                    }
                    return this.convertPythonSlice(target, args[0]);

                default:
                    throw new Error(`Unknown array method: ${methodName} `);
            }
        }

        // String methods
        if (node.targetType === "string") {
            switch (methodName) {
                case "upper":
                    // .upper[] -> .toUpperCase()
                    return `${target}.toUpperCase()`;

                case "lower":
                    // .lower[] -> .toLowerCase()
                    return `${target}.toLowerCase()`;

                case "size":
                    // .size[] -> .length
                    return `${target}.length`;

                case "includes":
                    // .includes[value] -> .includes(value)
                    if (args.length !== 1) {
                        throw new Error("includes requires exactly 1 argument");
                    }
                    return `${target}.includes(${this.visit(args[0])})`;

                case "replace":
                    // .replace["old" with "new"] -> .replace("old", "new")
                    if (args.length !== 2) {
                        throw new Error("replace requires exactly 2 arguments (old, new)");
                    }
                    return `${target}.replace(${this.visit(args[0])}, ${this.visit(args[1])})`;

                default:
                    throw new Error(`Unknown string method: ${methodName} `);
            }
        }

        throw new Error(`Unknown target type: ${node.targetType} `);
    }

    visitLambdaExpression(node) {
        // Convert lambda to arrow function: call [x] -> x % 2 == 0 => (x) => x % 2 === 0
        const params = node.params.join(", ");
        const body = this.visit(node.body);
        return `(${params}) => ${body} `;
    }

    convertPythonSlice(target, sliceExpr) {
        // Handle Python-style slicing: ::2, 2:5, ::-1
        // This is a simplified version - you'd need to parse the slice notation
        // For now, let's assume sliceExpr is a string literal

        if (sliceExpr.type === "Literal" && typeof sliceExpr.value === "string") {
            const slice = sliceExpr.value;

            // Parse slice notation
            if (slice === "::-1") {
                // Reverse array
                return `${target}.slice().reverse(); `;
            } else if (slice.startsWith("::")) {
                // Every nth element
                const step = parseInt(slice.substring(2));
                return `${target}.filter((_, i) => i % ${step} === 0); `;
            } else if (slice.includes(":")) {
                // Range slice
                const parts = slice.split(":");
                const start = parts[0] || "0";
                const end = parts[1] || `${target}.length`;
                return `${target}.slice(${start}, ${end}); `;
            }
        }

        throw new Error("Invalid slice notation");
    }

}

export { JSCodeGenerator };