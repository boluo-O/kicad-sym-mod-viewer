import { listify, tokenize } from "./tokenizer.ts"
import { KicadCanvas } from "./canvas.ts"
import { createDraft } from "immer"
const drawSymbol = () => {}

class KicadSymbolElement {
    in_bom: string
    constructor(parameters) {}
}

const parseRowMap = {
    version: (o, listProps, parseTokenList) => {
        o.version = listProps[1]
    },
    generator: (o, listProps, parseTokenList) => {
        o.generator = listProps[1]
    },
    generator_version: (o, listProps, parseTokenList) => {
        o.generator_version = listProps[1]
    },
    symbol: (o, listProps, parseTokenList) => {
        const symbol = {
            name: listProps[1],
        }
        parseTokenList(symbol, listProps.slice(2))
        if (o.symbols) {
            o.symbols.push(symbol)
        } else {
            o.symbols = [symbol]
        }
    },
    polyline: (o, listProps, parseTokenList) => {
        const polyline = {}
        parseTokenList(polyline, listProps.slice(1))
        if (o.polylines) {
            o.polylines.push(polyline)
        } else {
            o.polylines = [polyline]
        }
    },
    pts: (o, listProps, parseTokenList) => {
        o.pts = {}
        parseTokenList(o.pts, listProps.slice(1))
    },
    xy: (o, listProps, parseTokenList) => {
        const xy = {
            x: listProps[1],
            y: listProps[2],
        }
        if (o.xyList) {
            o.xyList.push(xy)
        } else {
            o.xyList = [xy]
        }
    },
    stroke: (o, listProps, parseTokenList) => {
        o.stroke = {}
        parseTokenList(o.stroke, listProps.slice(1))
    },
    width: (o, listProps, parseTokenList) => {
        o.width = listProps[1]
    },
    type: (o, listProps, parseTokenList) => {
        o.type = listProps[1]
    },
    circle: (o, listProps, parseTokenList) => {
        const circle = {}
        parseTokenList(circle, listProps.slice(1))
        if (o.circles) {
            o.circles.push(circle)
        } else {
            o.circles = [circle]
        }
    },
    center: (o, listProps, parseTokenList) => {
        o.center = {
            x: listProps[1],
            y: listProps[2],
        }
    },
    radius: (o, listProps, parseTokenList) => {
        o.radius = listProps[1]
    },
    fill: (o, listProps, parseTokenList) => {
        o.fill = {}
        parseTokenList(o.fill, listProps.slice(1))
    },
}

const parseTokenList = (o, tokenList) => {
    if (Array.isArray(tokenList)) {
        for (let i = 0; i < tokenList.length; i++) {
            const row = tokenList[i]
            const keyName = row[0]
            const addFunc = parseRowMap[keyName]
            // console.log("addFunc", addFunc)
            if (addFunc) {
                addFunc(o, row, parseTokenList)
            }
        }
    }
}

// draw()
const __main = () => {
    fetch("./MMBFJ112.kicad_sym")
        .then((res) => res.text())
        .then((data) => {
            // console.log("data", data)
            const tokenList = listify(data)[0] as any[]
            console.log("tokenList", tokenList)
            const o = {}
            parseTokenList(o, tokenList)
            console.log("o", o)
            // func(tokenList)
        })
    // fetch("./MOD-nRF8001.kicad_sym")
    //     .then((res) => res.text())
    //     .then((data) => {
    //         // console.log("data", data)
    //         const tokenList = listify(data)[0] as any[]
    //         console.log("tokenList", tokenList)
    //         func(tokenList)
    //     })
    const kc = new KicadCanvas({})
}

__main()
