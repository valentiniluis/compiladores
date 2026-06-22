import { Token } from "../shared/constants.js";
import { SLRTable, AnalysisResult, productions } from "./constants.js";


function getNextAction(currentState: number, column: string) {
    return SLRTable[currentState]?.[column] || 'err';
}

function addEndOfSentence(TS: Token[]) {
    const lastToken: Token = TS[TS.length - 1]!;
    if (lastToken.type !== '$') {
        TS.push(new Token(lastToken.line, '$', '$'));
    }
    return TS;
}

function processAction(
    action: string,
    stack: number[],
    shift: (state: number) => void,
    reduce: (size: number) => void,
    goto: (state: number) => void
) {
    if (action === 'acc') return true;
    if (action === 'err') return false;

    const actionType = action[0];

    if (actionType === 's') {
        const state: number = +action.substring(1);
        shift(state);
    }
    else if (actionType === 'r') {
        const production: number = +action.substring(1);
        const { size, left } = productions[production]!;
        reduce(size);

        // processar goto após reduce
        const currentState: number = stack[stack.length - 1]!;
        const nextState: string = getNextAction(currentState, left);

        if (nextState == 'err') return false;
        goto(+nextState);
    }
}

function sanitizeIdentifier(id: string) {
    if (!['S', 'P', 'R'].includes(id)) return id.toLowerCase();
    else return id;
}

export function syntaxAnalysis(TS: Token[]) {
    TS = addEndOfSentence(TS);

    // pilha contendo apenas os estados
    const stack: number[] = [0];

    let position: number = 0;

    function shift(state: number) {
        position++;
        stack.push(state);
    }

    function reduce(size: number) {
        stack.splice(stack.length - size, size);
    }

    function goto(state: number) {
        stack.push(state);
    }

    let result: boolean | undefined;

    while (position < TS.length) {
        const currentState: number = stack[stack.length - 1]!;
        const token: Token = TS[position]!;
        const { type, line, label } = token;
        const nextAction: string = getNextAction(currentState, sanitizeIdentifier(type));
        result = processAction(nextAction, stack, shift, reduce, goto);

        if (result === false) {
            return new AnalysisResult(false, `Syntax Error! Unexpected token '${label}' at line ${line}.`);
        }

        if (result === true) {
            return new AnalysisResult(true, "Syntax analysis completed successfully.");
        }
    }

    if (result !== true) {
        const lastToken: Token = TS[TS.length - 1]!;
        return new AnalysisResult(false, `Syntax Error! Unexpected end of input at line ${lastToken.line} (${lastToken.type})`);
    }
    else {
        return new AnalysisResult(true, "Syntax analysis completed successfully.");
    }

}