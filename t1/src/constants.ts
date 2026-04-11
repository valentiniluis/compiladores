export const SINGLE_CHAR_TOKENS: string[] = ['VIRGULA', 'ABRE_PARENTESE', 'FECHA_PARENTESE', 'DOIS_PONTOS'];

export const IDENTIFIER_STATES: string[] = ['A', 'B', 'ID'];

export const SEPARATORS: string = '():, \n';

export const TRANSITIONS: Record<string, Record<string, string>> = {
    S:               { 'd': 'A', '(': 'ABRE_PARENTESE', ')': 'FECHA_PARENTESE', ':': 'DOIS_PONTOS', ',': 'VIRGULA' },
    A:               { 'e': 'B' },
    B:               { 'f': 'DEF' },
    ID:              {  },
    DEF:             {  },
    VIRGULA:         {  },
    ABRE_PARENTESE:  {  },
    FECHA_PARENTESE: {  },
    DOIS_PONTOS:     {  },
    NOVA_LINHA:      {  },
    ERRO:            {  }
}

export function getNextState(currentState: keyof typeof TRANSITIONS, symbol: string) {
    return TRANSITIONS?.[currentState]?.[symbol] || 'ERRO';
}


const INITIAL_IDENTIFIERS: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';

const ALL_NUMBERS = '0123456789';

const ALL_IDENTIFIERS: string = INITIAL_IDENTIFIERS + ALL_NUMBERS;

const ALL_CHARACTERS: string = ALL_IDENTIFIERS + SEPARATORS;

function initializeTransitions() {
    const INITIAL_STATE: keyof typeof TRANSITIONS = 'S';
    const ERROR_STATE: keyof typeof TRANSITIONS = 'ERRO';
    const IDENTIFIER_STATE: keyof typeof TRANSITIONS = 'ID';

    // todas as transições (S, [0-9]) levam para ERRO
    for (const char of ALL_NUMBERS) {
        if (!TRANSITIONS[INITIAL_STATE]![char]) TRANSITIONS[INITIAL_STATE]![char] = ERROR_STATE;
    }

    // todas as transições (S, [a-zA-Z]) levam para ID
    for (const char of INITIAL_IDENTIFIERS) {
        if (!TRANSITIONS[INITIAL_STATE]![char]) TRANSITIONS[INITIAL_STATE]![char] = IDENTIFIER_STATE;
    }

    // transições de símbolos separadores mantêm estado antigo (exceto S), fita retorna uma posição
    for (const state of Object.keys(TRANSITIONS)) {
        for (const char of SEPARATORS) {
            if (!TRANSITIONS[state]![char]) TRANSITIONS[state]![char] = state;
        }
    }

    // transições de tokens de único caractere mantêm o estado inalterado
    for (const state of SINGLE_CHAR_TOKENS) {
        for (const char of ALL_CHARACTERS) {
            if (!TRANSITIONS[state]![char]) TRANSITIONS[state]![char] = state;
        }
    }

    // todas as transições ERRO permanecem em ERRO
    for (const char of ALL_CHARACTERS) {
        if (!TRANSITIONS[ERROR_STATE]![char]) TRANSITIONS[ERROR_STATE]![char] = ERROR_STATE;
    }

    // as transições restantes levam para ID
    for (const state of Object.keys(TRANSITIONS)) {
        for (const char of ALL_IDENTIFIERS) {
            if (!TRANSITIONS[state]![char]) TRANSITIONS[state]![char] = IDENTIFIER_STATE;
        }
    }
}

initializeTransitions();