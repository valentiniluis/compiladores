
export class Token {
    line: number;
    type: string;
    label: string;

    constructor(line: number, type: string, label: string) {
        this.line = line;
        this.type = type;
        this.label = label;
    }
}

export class Function {
    line: number;
    label: string;
    parameters: string[];

    constructor(line: number, label: string, parameters: string[]) {
        this.line = line;
        this.label = label;
        this.parameters = parameters;
    }

    addParameter(param: string) {
        this.parameters.push(param);
    }

    hasParameter(param: string) {
        return this.parameters.includes(param);
    }
}

export class SymbolTable {
    input: Token[];
    functions: Function[];

    constructor() {
        this.input = [];
        this.functions = [];
    }

    addToken(token: Token) {
        this.input.push(token);
    }

    addFunction(f: Function) {
        this.functions.push(f);
    }

    hasFunction(f: string) {
        return this.functions.map(func => func.label).includes(f);
    }
}