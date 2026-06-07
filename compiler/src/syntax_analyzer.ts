import type { Token } from "./constants.js";

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
    return SLRTable[currentState]![column]! || 'err';
}

// pilha contendo apenas os estados
let stack: number[] = [0];

function processAction(action: string, incrementPosition: () => void) {
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
        const gotoState: number = +getNextAction(currentState, left);
        stack.push(gotoState);
    }
}

function sanitizeIdentifier(id: string) {
    if (!['S', 'P', 'R'].includes(id)) return id.toLowerCase();
    else return id;
}

export function syntaxAnalysis(TS: Token[]) {
   
    let position: number = 0;

    function incrementPosition() {
        position++;
    }

    while (position < TS.length) {
        const currentState: number = stack[stack.length - 1]!;
        const token: Token = TS[position]!;
        const { type, line, label } = token;
        const nextAction: string = getNextAction(currentState, sanitizeIdentifier(type));
        const result: boolean | undefined = processAction(nextAction, incrementPosition);

        if (result === false) {
            console.error(`Syntax Error! Unexpected token '${label}' at line ${line}.`);
            break;
        }

        if (result === true) {
            console.log("Syntax analysis completed successfully.");
            break;
        }
    }

}