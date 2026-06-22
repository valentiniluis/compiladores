import path from "path";

import { Token } from "./shared/constants.js";
import { AnalysisResult } from "./syntax/constants.js";
import { lexicalAnalysis, printTokensShort } from "./lexical/analyzer.js";
import { syntaxAnalysis } from './syntax/analyzer.js';

async function main() {
    const TS: Token[] = await lexicalAnalysis(path.join(import.meta.dirname, 'program.text'));

    console.log("================================== LEXICAL ANALYSIS ==================================");
    printTokensShort(TS);
    console.log("================================== LEXICAL ANALYSIS ==================================");

    console.log("\n");

    console.log("================================== SYNTAX ANALYSIS ==================================");
    const result: AnalysisResult = syntaxAnalysis(TS);
    result.printResult();
    console.log("================================== SYNTAX ANALYSIS ==================================");
}

main();