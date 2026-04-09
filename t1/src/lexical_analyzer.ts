import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import * as path from 'path';

const INITIAL_IDENTIFIERS: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
const ALL_NUMBERS = '0123456789';
const ALL_IDENTIFIERS: string = INITIAL_IDENTIFIERS + ALL_NUMBERS;
const SEPARATORS: string = '():, \n';
const ALL_CHARACTERS: string = ALL_IDENTIFIERS + SEPARATORS;

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
    // todas as transições (S, [0-9]) levam para ERRO
    for (const char of ALL_NUMBERS) {
        if (!TRANSITIONS['S'][char]) TRANSITIONS['S'][char] = 'ERRO';
    }

    // todas as transições (S, [a-zA-Z]) levam para ID
    for (const char of INITIAL_IDENTIFIERS) {
        if (!TRANSITIONS['S'][char]) TRANSITIONS['S'][char] = 'ID';
    }

    // transições de símbolos separadores mantêm estado antigo (exceto S), fita retorna uma posição
    for (const state of Object.keys(TRANSITIONS)) {
        for (const char of SEPARATORS) {
            if (!TRANSITIONS[state][char]) TRANSITIONS[state][char] = state;
        }
    }

    // transições de tokens de único caractere mantêm o estado inalterado
    for (const state of SINGLE_CHAR_TOKENS) {
        for (const char of ALL_CHARACTERS) {
            if (!TRANSITIONS[state][char]) TRANSITIONS[state][char] = state;
        }
    }

    // todas as transições ERRO permanecem em ERRO
    for (const char of ALL_CHARACTERS) {
        if (!TRANSITIONS['ERRO'][char]) TRANSITIONS['ERRO'][char] = 'ERRO';
    }

    // as transições restantes levam para ID
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

async function parseFile(filename: string) {
    const fileStream = createReadStream(filename);
    const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineNumber = 1;
    for await (const line of rl) {
        parseLine(line, lineNumber);
        lineNumber++;
    }
}

function printTokens() {
    for (const token of TS) {
        console.log(`Linha ${token.line}: ${token.identifier} ('${token.label}')`);
    }
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


await parseFile(path.join(import.meta.dirname, 'program.text'));
printTokens();

// def funcao(a, b):