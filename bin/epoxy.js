#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { run } from "../src/index.js";

const file = process.argv[2];

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