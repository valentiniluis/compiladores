import path from "path";

import { Token } from "./constants.js";
import { lexicalAnalysis, printTokensShort } from "./lexical_analyzer.js";
import { syntaxAnalysis } from './syntax_analyzer.js';

async function main() {
    const TS: Token[] = await lexicalAnalysis(path.join(import.meta.dirname, 'program.text'));

    console.log("================================== LEXICAL ANALYSIS ==================================");
    printTokensShort(TS);
    console.log("================================== LEXICAL ANALYSIS ==================================");

    console.log("\n");

    console.log("================================== SYNTAX ANALYSIS ==================================");
    console.log(syntaxAnalysis(TS));
    console.log("================================== SYNTAX ANALYSIS ==================================");
}

main();