// type definitions for Types used in this project

export interface ConfigB {
    input:      Input;
    output:     Output;
    openai_key: string;
    delay: number;
}

export interface Input {
    directory: string;
    files?:     string[];
}

export interface Output {
    directory: string;
}

export interface ConfigA {
    queries: Query[];
}

export interface Query {
    query: string;
}

export interface QA {
    question: string;
    answer: string;
}

