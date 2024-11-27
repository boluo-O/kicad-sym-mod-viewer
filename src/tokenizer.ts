/*
    Copyright (c) 2022 Alethea Katherine Flowers.
    Published under the standard MIT License.
    Full text available at: https://opensource.org/licenses/MIT
*/

/*
    References:
    - https://dev-docs.kicad.org/en/file-formats/sexpr-intro/
    - https://gitlab.com/edea-dev/edea/-/tree/main/edea
*/

const EOF = "\x04"

export class Token {
    static open = Symbol("opn")
    static close = Symbol("clo")
    static atom = Symbol("atm")
    static number = Symbol("num")
    static string = Symbol("str")

    constructor(public type: symbol, public value: any = null) {}
}

function isDigit(c: string) {
    return c >= "0" && c <= "9"
}

function isAlpha(c: string) {
    return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z")
}

function isWhitespace(c: string) {
    return c === EOF || c === " " || c === "\n" || c === "\r" || c === "\t"
}

function isAtom(c: string) {
    return (
        isAlpha(c) ||
        isDigit(c) ||
        [
            "_",
            "-",
            ":",
            "!",
            ".",
            "[",
            "]",
            "{",
            "}",
            "@",
            "*",
            "/",
            "&",
            "#",
            "%",
            "+",
            "=",
            "~",
            "$",
        ].includes(c)
    )
}

function errorContext(input: string, index: number) {
    let start = input.slice(0, index).lastIndexOf("\n")
    if (start < 0) start = 0
    let end = input.slice(index).indexOf("\n")
    if (end < 0) end = 20
    return input.slice(start, index + end)
}

enum State {
    none,
    string,
    number,
    atom,
    hex,
}

export function tokenize(input: string): Token[] {
    const tokens: Token[] = []
    const openToken = new Token(Token.open)
    const closeToken = new Token(Token.close)
    let state: State = State.none
    let startIdx = 0
    let escaping = false

    for (let i = 0; i < input.length + 1; i++) {
        const c: string = i < input.length ? input[i]! : EOF

        if (state == State.none) {
            if (c === "(") {
                tokens.push(openToken)
                continue
            } else if (c === ")") {
                tokens.push(closeToken)
                continue
            } else if (c === '"') {
                state = State.string
                startIdx = i
                continue
            } else if (c === "-" || c == "+" || isDigit(c)) {
                state = State.number
                startIdx = i
                continue
            } else if (isAlpha(c) || ["*", "&", "$", "/", "%"].includes(c)) {
                state = State.atom
                startIdx = i
                continue
            } else if (isWhitespace(c)) {
                continue
            } else {
                throw new Error(
                    `Unexpected character at index ${i}: ${c}\nContext: ${errorContext(
                        input,
                        i
                    )}`
                )
            }
        } else if (state == State.atom) {
            if (isAtom(c)) {
                continue
            } else if (c === ")" || isWhitespace(c)) {
                tokens.push(new Token(Token.atom, input.substring(startIdx, i)))
                state = State.none
                if (c === ")") {
                    tokens.push(closeToken)
                }
            } else {
                throw new Error(
                    `Unexpected character while tokenizing atom at index ${i}: ${c}\nContext: ${errorContext(
                        input,
                        i
                    )}`
                )
            }
        } else if (state == State.number) {
            if (c === "." || isDigit(c)) {
                continue
            } else if (c.toLowerCase() === "x") {
                state = State.hex
                continue
            } else if (
                ["+", "-", "a", "b", "c", "d", "e", "f"].includes(
                    c.toLowerCase()
                )
            ) {
                state = State.atom
                continue
            } else if (isAtom(c)) {
                state = State.atom
                continue
            } else if (c === ")" || isWhitespace(c)) {
                tokens.push(
                    new Token(
                        Token.number,
                        parseFloat(input.substring(startIdx, i))
                    )
                )
                state = State.none
                if (c === ")") {
                    tokens.push(closeToken)
                }
                continue
            } else {
                throw new Error(
                    `Unexpected character at index ${i}: ${c}, expected numeric.\nContext: ${errorContext(
                        input,
                        i
                    )}`
                )
            }
        } else if (state == State.hex) {
            if (
                isDigit(c) ||
                ["a", "b", "c", "d", "e", "f", "_"].includes(c.toLowerCase())
            ) {
                continue
            } else if (c === ")" || isWhitespace(c)) {
                const hexstr = input.substring(startIdx, i).replace("_", "")
                tokens.push(
                    new Token(Token.number, Number.parseInt(hexstr, 16))
                )
                state = State.none
                if (c === ")") {
                    tokens.push(closeToken)
                }
                continue
            } else if (isAtom(c)) {
                state = State.atom
                continue
            } else {
                throw new Error(
                    `Unexpected character at index ${i}: ${c}, expected hexadecimal.\nContext: ${errorContext(
                        input,
                        i
                    )}`
                )
            }
        } else if (state == State.string) {
            if (!escaping && c === '"') {
                tokens.push(
                    new Token(
                        Token.string,
                        input
                            .substring(startIdx + 1, i)
                            .replaceAll("\\n", "\n")
                            .replaceAll("\\\\", "\\")
                    )
                )
                state = State.none
                escaping = false
                continue
            } else if (!escaping && c === "\\") {
                escaping = true
                continue
            } else {
                escaping = false
                continue
            }
        } else {
            throw new Error(
                `Unknown tokenizer state ${state}\nContext: ${errorContext(
                    input,
                    i
                )}`
            )
        }
    }

    return tokens
}

export type List = (string | number | List)[]

function listifyTokens(tokens: Token[], index: number = 0): [List, number] {
    const result: List = []

    while (index < tokens.length) {
        const token = tokens[index]

        switch (token.type) {
            case Token.atom:
            case Token.string:
            case Token.number:
                result.push(token.value)
                index++
                break
            case Token.open:
                const [subList, newIndex] = listifyTokens(tokens, index + 1)
                result.push(subList)
                index = newIndex
                break
            case Token.close:
                return [result, index + 1]
        }
    }

    return [result, index]
}

export function listify(src: string): List {
    const tokens = tokenize(src)
    return listifyTokens(tokens)[0]
}
