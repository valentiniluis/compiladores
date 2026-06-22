import path from "path";

import { Token } from "./constants.js";
import { lexicalAnalysis, printTokensShort } from "./lexical_analyzer.js";
import { AnalysisResult, syntaxAnalysis } from './syntax_analyzer.js';

async function main() {
    const TS: Token[] = await lexicalAnalysis(path.join(import.meta.dirname, 'program.text'));

    console.log("================================== LEXICAL ANALYSIS ==================================");
    printTokensShort(TS);
    console.log("================================== LEXICAL ANALYSIS ==================================");

    console.log("\n");

    console.log("================================== SYNTAX ANALYSIS ==================================");
    const result: AnalysisResult = syntaxAnalysis(TS);
    console.log(`Success: ${result.success}. ${result.message}`);
    console.log("================================== SYNTAX ANALYSIS ==================================");
}

main();