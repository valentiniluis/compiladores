import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import * as path from 'path';

import { 
    TRANSITIONS,
    IDENTIFIER_STATES,
    SEPARATORS,
    SINGLE_CHAR_TOKENS,
    getNextState
} from './constants.js';

class Token {
    line: number;
    type: string;
    label: string;

    constructor(line: number, type: string, label: string) {
        this.line = line;
        this.type = type;
        this.label = label;
    }
}

const TS: Token[] = [];

function insertToken(token: Token) {
    if (IDENTIFIER_STATES.includes(token.type)) token.type = 'ID';
    TS.push(token);
}

function printTokens() {
    for (const token of TS) {
        console.log(`Linha ${token.line}: ${token.type} ('${token.label}')`);
    }
}

function parseLine(line: string, lineNumber: number) {
    let state: keyof typeof TRANSITIONS = 'S';
    let lexeme: string = '';

    function resetAutomata() {
        state = 'S';
        lexeme = '';
    }

    for (let i = 0; i < line.length; i++) {
        const char = line[i] as string;

        if (state === 'S' && char === ' ') continue;

        if (SEPARATORS.includes(char) && lexeme !== '') {
            insertToken(new Token(lineNumber, state, lexeme));
            resetAutomata();
            i -= 1;
            continue;
        }

        lexeme += char;
        state = getNextState(state, char);

        if (SINGLE_CHAR_TOKENS.includes(state)) {
            insertToken(new Token(lineNumber, state, lexeme));
            resetAutomata();
        }
    }

    // verificando se sobrou um lexema ao final da linha
    if (lexeme !== "") insertToken(new Token(lineNumber, state, lexeme));
}

async function parseFile(filename: string) {
    const fileStream = createReadStream(filename);
    const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineNumber = 1;
    for await (const line of rl) {
        parseLine(line, lineNumber);
        insertToken(new Token(lineNumber, 'NOVA_LINHA', '\\n'));
        lineNumber++;
    }
}

await parseFile(path.join(import.meta.dirname, 'program.text'));
printTokens();