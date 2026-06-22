
export class AnalysisResult {
    success: boolean;
    message: string | undefined;

    constructor(success: boolean, message: string | undefined) {
        this.success = success;
        this.message = message;
    }

    printResult() {
        console.log(`Success: ${this.success}. ${this.message}`);
    }
};


export const productions: Record<number, { left: string, size: number }> = {
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
};


export const SLRTable: Record<number, Record<string, string>> = {
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
};
