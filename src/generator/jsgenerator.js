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
            case "BinaryExpression": return this.visitBinaryExpression(node);
            case "Literal": return this.visitLiteral(node);
            case "Identifier": return this.visitIdentifier(node);
            case "StoreStatement": return this.visitStoreStatement(node);
            case "ShowStatement": return this.visitShowStatement(node);
            case "FunctionDeclaration": return this.visitFunctionDeclaration(node);
            case "ReturnStatement": return this.visitReturnStatement(node);
            case "CallExpression": return this.visitCallExpression(node);
            case "IfChain": return this.visitIfChain(node);
            case "RepeatFor": return this.visitRepeatFor(node);
            case "RepeatUntil": return this.visitRepeatUntil(node);
            case "ArrayLiteral": return this.visitArrayLiteral(node);
            case "ArrayAccess": return this.visitArrayAccess(node);
            default:
                throw new Error("Unknown AST node: " + node.type);
        }
    }


    visitAssignStatement(node) {
        const keyword = node.isGlobal ? "var" : "let";
        const value = this.visit(node.value);
        return `${keyword} ${node.name} = ${value};`;
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

                // 🔥 parse boxed expression safely
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
        const interpolated = this.convertInterpolation(node.value);
        return `const ${node.name} = \`${interpolated}\`;`;
    }

    visitShowStatement(node) {
        return `console.log(${this.visit(node.value)});`;
    }

    visitFunctionDeclaration(node) {
        const params = node.params.join(", ");
        const body = node.body.map(s => this.visit(s)).join("\n");
        return `function ${node.name}(${params}) {\n${body}\n}`;
    }

    visitReturnStatement(node) {
        return `return ${this.visit(node.value)};`;
    }

    visitArrayLiteral(node) {
        const items = node.elements.map(e => this.visit(e)).join(", ");
        return `[${items}]`;
    }

    visitArrayAccess(node) {
        const arr = this.visit(node.array);
        const idx = this.visit(node.index);
        return `${arr}[${idx}]`;
    }

    visitCallExpression(node) {
        const args = node.args.map(a => this.visit(a)).join(", ");
        return `${node.name}(${args})`;
    }

    visitIfChain(node) {
        let code = `if (${this.visit(node.condition)}) {\n`;
        code += node.body.map(s => this.visit(s)).join("\n");
        code += "\n}";

        for (const oc of node.orChecks) {
            code += ` else if (${this.visit(oc.condition)}) {\n`;
            code += oc.body.map(s => this.visit(s)).join("\n");
            code += "\n}";
        }

        if (node.altBody) {
            code += ` else {\n`;
            code += node.altBody.map(s => this.visit(s)).join("\n");
            code += "\n}";
        }

        return code;
    }

    visitRepeatFor(node) {
        const v = node.varName;
        const start = this.visit(node.start);
        const end = this.visit(node.end);
        const step = this.visit(node.step);
        const body = node.body.map(s => this.visit(s)).join("\n");

        return `
for (let ${v} = ${start}; ${v} <= ${end}; ${v} += ${step}) {
${body}
}`.trim();
    }

    visitRepeatUntil(node) {
        const condition = this.visit(node.condition);
        const body = node.body.map(s => this.visit(s)).join("\n");

        return `
do {
${body}
} while (!(${condition}));`.trim();
    }

}

export { JSCodeGenerator };