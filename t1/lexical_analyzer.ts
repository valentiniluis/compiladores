const INITIAL_IDENTIFIERS: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
const ALL_IDENTIFIERS: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
const SEPARATORS: string = '():, \n';
const SINGLE_CHAR_TOKENS: string[] = ['VIRGULA', 'ABRE_PARENTESE', 'FECHA_PARENTESE', 'DOIS_PONTOS'];
const FINAL_STATES: string[] = ['A', 'B', 'ID', 'DEF', 'VIRGULA', 'ABRE_PARENTESE', 'FECHA_PARENTESE', 'DOIS_PONTOS', 'ERRO'];
const IDENTIFIER_STATES: string[] = ['A', 'B', 'ID'];

const TRANSITIONS: Record<string, Record<string, string>> = {
    S:               { 'd': 'A', '(': 'ABRE_PARENTESE', ')': 'FECHA_PARENTESE', ':': 'DOIS_PONTOS', ',': 'VIRGULA' },
    A:               { 'e': 'B' },
    B:               { 'f': 'DEF' },
    ID:              {  },
    DEF:             {  },
    VIRGULA:         {  },
    ABRE_PARENTESE:  {  },
    FECHA_PARENTESE: {  },
    DOIS_PONTOS:     {  },
    ERRO:            {  }
}

function initializeTransitions() {
    for (const char of INITIAL_IDENTIFIERS) {
        if (!TRANSITIONS['S'][char]) TRANSITIONS['S'][char] = 'ID';
    }

    for (const state of Object.keys(TRANSITIONS)) {
        for (const char of ALL_IDENTIFIERS) {
            if (!TRANSITIONS[state][char]) TRANSITIONS[state][char] = 'ID';
        }
    }
}

class Token {
    line: number;
    identifier: string;
    label: string;

    constructor(line: number, identifier: string, label: string) {
        this.line = line;
        this.identifier = identifier;
        this.label = label;
    }
}

const TS: Token[] = [];

function parseFile(filename: string) {

}

function printTokens() {

}

function parseLine(line: string, lineNumber: number) {
    let state: keyof typeof TRANSITIONS = 'S';
    let lexeme: string = '';

    function resetAutomata() {
        state = 'S';
        lexeme = '';
    }

    function getNextState(char: string) {
        return TRANSITIONS[state][char] || 'ERRO';
    }

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (state === 'S' && char === ' ') continue;

        if (SEPARATORS.includes(char) && lexeme !== '') {
            if (IDENTIFIER_STATES.includes(state)) state = 'ID';
            TS.push(new Token(lineNumber, state, lexeme));
            resetAutomata();
            i -= 1;
            continue;
        }

        lexeme += char;
        state = getNextState(char);
    
        if (SINGLE_CHAR_TOKENS.includes(state)) {
            TS.push(new Token(lineNumber, state, char));
            resetAutomata();
        }
    }
}

// def funcao(a, b):