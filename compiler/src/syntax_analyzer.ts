import { Token } from "./constants.js";

export class AnalysisResult {
    success: boolean;
    message: string | undefined;

    constructor(success: boolean, message: string | undefined) {
        this.success = success;
        this.message = message;
    }
};

const productions: Record<number, { left: string, size: number }> = {
    0:  { left: "S", size: 2 }, // S -> C A
    1:  { left: "A", size: 3 }, // A -> B D A
    2:  { left: "A", size: 2 }, // A -> B D
    3:  { left: "B", size: 6 }, // B -> def id ( E ) :
    4:  { left: "C", size: 2 }, // C -> C nl
    5:  { left: "C", size: 0 }, // C -> ''
    6:  { left: "D", size: 2 }, // D -> D nl
    7:  { left: "D", size: 1 }, // D -> nl
    8:  { left: "E", size: 1 }, // E -> F
    9:  { left: "E", size: 0 }, // E -> ''
    10: { left: "F", size: 1 }, // F -> id 
    11: { left: "F", size: 3 }  // F -> id , F
}

const SLRTable: Record<number, Record<string, string>> = {
    0: {
        "def": "r5",
        "nl": "r5",
        "C": "1"
    },

    1: {
        "def": "s5",
        "nl": "s3",
        "A": "2",
        "B": "4"
    },

    2: {
        "$": "acc"
    },

    3: {
        "def": "r4",
        "nl": "r4"
    },

    4: {
        "nl": "s7",
        "D": "6"
    },

    5: {
        "id": "s8"
    },

    6: {
        "def": "s5",
        "nl": "s10",
        "$": "r2",
        "A": "9",
        "B": "4"
    },

    7: {
        "def": "r7",
        "nl": "r7",
        "$": "r7",
    },

    8: {
        "(": "s11"
    },

    9: {
        "$": "r1"
    },

    10: {
        "def": "r6",
        "nl": "r6",
        "$": "r6",
    },

    11: {
        "id": "s14",
        ")": "r9",
        "E": "12",
        "F": "13"
    },

    12: {
        ")": "s15"
    },

    13: {
        ")": "r8"
    },

    14: {
        ")": "r10",
        ",": "s16"
    },

    15: {
        ":": "s17"
    },

    16: {
        "id": "s14",
        "F": "18"
    },

    17: {
        "nl": "r3"
    },

    18: {
        ")": "r11"
    }
}

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