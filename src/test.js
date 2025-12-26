import { compile } from './index.js';
import { readFileSync } from 'fs';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
console.log("=== Testing test.epx ===");
const inputfile = readFileSync('./examples/hybrid.epx', 'utf-8');
console.log("Epoxy code:");
console.log(inputfile);
console.log("\nCompiled JavaScript:");
const epx_to_js_raw = compile(inputfile);
const finalcode_input = `
const promptSync_of_epoxy_lang_dont_use_this_name = require("prompt-sync");
const input_of_epoxy_lang_dont_use_this_name = promptSync_of_epoxy_lang_dont_use_this_name();
${epx_to_js_raw}
`;
const thisisthecode = epx_to_js_raw.includes("input_of_epoxy_lang_dont_use_this_name()") ? finalcode_input : epx_to_js_raw;
console.log(thisisthecode);
console.log("\nRunning JavaScript:");
eval(thisisthecode);