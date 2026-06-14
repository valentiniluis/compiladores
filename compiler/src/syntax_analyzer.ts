import { Token } from "./constants.js";

class AnalysisResult {
    success: boolean;
    error: string | undefined;

    constructor(success: boolean, error: string | undefined) {
        this.success = success;
        this.error = error;
    }
};

const productions: Record<number, { left: string, size: number }> = {
    0: { left: 'S', size: 6 }, // def id ( P ) :
    1: { left: 'P', size: 2 }, // id R
    2: { left: 'P', size: 0 }, // ''
    3: { left: 'R', size: 3 }, // , id R
    4: { left: 'R', size: 0 }  // ''
}

const SLRTable: Record<number, Record<string, string>> = {
    0:  {
        'def': 's1' 
    },

    1:  { 
        'id': 's2' 
    },

    2:  { 
        '(': 's3' 
    },

    3:  { 
        'id': 's5', 
        ')': 'r2', 
        'P': '4' 
    },

    4:  { 
        ')': 's6' 
    },

    5:  { 
        ')': 'r4', 
        ',': 's8', 
        'R': '7'
    },

    6:  {
        ':': 's9'
    },

    7:  {
        ')': 'r1'
    },

    8:  {
        'id': 's10'
    },

    9:  {
        '$': 'acc'
    },

    10: {
        ')': 'r4',
        ',': 's8',
        'R': '11'
    },

    11: {
        ')': 'r3'
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

function processAction(action: string, stack: number[], incrementPosition: () => void) {
    if (action === 'acc') return true;
    if (action === 'err') return false;

    const actionType = action[0];
    const actionNumber = +action.substring(1);

    if (actionType === 's') {
        stack.push(actionNumber);
        incrementPosition();
    }
    else if (actionType === 'r') {
        const { size, left } = productions[actionNumber]!;
        stack = stack.slice(0, stack.length - size);

        // processar goto após reduce
        const currentState: number = stack[stack.length - 1]!;
        const nextAction: string = getNextAction(currentState, left);

        if (nextAction == 'err') return false;

        const gotoState: number = +nextAction;
        stack.push(gotoState);
    }
}

function sanitizeIdentifier(id: string) {
    if (!['S', 'P', 'R'].includes(id)) return id.toLowerCase();
    else return id;
}

export function syntaxAnalysis(TS: Token[]) {
    TS = addEndOfSentence(TS);

    // pilha contendo apenas os estados
    let stack: number[] = [0];
   
    let position: number = 0;

    function incrementPosition() {
        position++;
    }

    let result: boolean | undefined;

    while (position < TS.length) {
        const currentState: number = stack[stack.length - 1]!;
        const token: Token = TS[position]!;
        const { type, line, label } = token;
        const nextAction: string = getNextAction(currentState, sanitizeIdentifier(type));
        result = processAction(nextAction, stack, incrementPosition);

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