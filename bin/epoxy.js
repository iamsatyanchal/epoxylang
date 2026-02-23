#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { run } from "../src/index.js";

const file = process.argv[2];
if (process.argv[2] === "--version") {
    console.log("Epoxy version 1.0.0");
    process.exit(0);
}

if (process.argv[2] === "--help") {
    console.log("Epoxy version 1.0.0");
    console.log("Usage: epoxy <file.epx>");
    process.exit(0);
}

if (!file) {
    console.error("Usage: epoxy <file.epx>");
    process.exit(1);
}

if (!file.endsWith(".epx")) {
    console.error("Only .epx files allowed");
    process.exit(1);
}


const code = fs.readFileSync(path.resolve(file), "utf8");
run(code);
