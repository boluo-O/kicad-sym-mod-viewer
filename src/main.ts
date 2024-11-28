import { listify, tokenize } from "./tokenizer.ts"
import { KicadCanvas, KicadSymbol } from "./canvas.ts"
import { createDraft } from "immer"

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
    pin: (o, listProps, parseTokenList) => {
        const pin = {}
        parseTokenList(pin, listProps.slice(1))
        if (o.pins) {
            o.pins.push(pin)
        } else {
            o.pins = [pin]
        }
    },
    line: (o, listProps, parseTokenList) => {
        o.line = {}
        parseTokenList(o.line, listProps.slice(1))
    },
    at: (o, listProps, parseTokenList) => {
        o.at = { x: listProps[1], y: listProps[2], rotate: listProps[3] }
    },
    length: (o, listProps, parseTokenList) => {
        o.length = listProps[1]
    },
    name: (o, listProps, parseTokenList) => {
        o.name = { text: listProps[1] }
        parseTokenList(o.name, listProps.slice(2))
    },
    number: (o, listProps, parseTokenList) => {
        o.number = { text: listProps[1] }
        parseTokenList(o.number, listProps.slice(2))
    },
    effects: (o, listProps, parseTokenList) => {
        o.effects = {}
        parseTokenList(o.effects, listProps.slice(1))
    },
    font: (o, listProps, parseTokenList) => {
        o.font = {}
        parseTokenList(o.font, listProps.slice(1))
    },
    size: (o, listProps, parseTokenList) => {
        o.size = listProps[1]
    },
    rectangle: (o, listProps, parseTokenList) => {
        const rectangle = {}
        console.log("o", o)
        parseTokenList(rectangle, listProps.slice(1))
        if (o.rectangles) {
            o.rectangles.push(rectangle)
        } else {
            o.rectangles = [rectangle]
        }
    },
    start: (o, listProps, parseTokenList) => {
        o.start = { x: listProps[1], y: listProps[2] }
    },
    end: (o, listProps, parseTokenList) => {
        o.end = { x: listProps[1], y: listProps[2] }
    },
    mid: (o, listProps, parseTokenList) => {
        o.mid = { x: listProps[1], y: listProps[2] }
    },
    arc: (o, listProps, parseTokenList) => {
        const arc = {}
        parseTokenList(arc, listProps.slice(1))
        if (o.arcs) {
            o.arcs.push(arc)
        } else {
            o.arcs = [arc]
        }
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
            console.time("测试耗时1")
            // console.log("data", data)
            const tokenList = listify(data)[0] as any[]
            console.log("tokenList", tokenList)
            const o = {}
            parseTokenList(o, tokenList)
            console.log("o", o)
            const kc = new KicadCanvas({})

            kc.addElements(o.symbols.map((s) => new KicadSymbol(s, kc)))
            kc.draw()
            console.timeEnd("测试耗时1")
            // func(tokenList)
        })
    fetch("./MOD-nRF8001.kicad_sym")
        .then((res) => res.text())
        .then((data) => {
            // console.log("data", data)
            console.time("测试耗时2")

            const tokenList = listify(data)[0] as any[]
            console.log("tokenList", tokenList)
            const o = {}
            parseTokenList(o, tokenList)
            console.log("o", o)
            const kc = new KicadCanvas({})
            kc.addElements(o.symbols.map((s) => new KicadSymbol(s, kc)))
            kc.draw()
            console.timeEnd("测试耗时2")
        })
    fetch("./ONSC-MC1496_B-14.kicad_sym")
        .then((res) => res.text())
        .then((data) => {
            // console.log("data", data)
            console.time("测试耗时3")

            const tokenList = listify(data)[0] as any[]
            console.log("tokenList", tokenList)
            const o = {}
            parseTokenList(o, tokenList)
            console.log("o", o)
            const kc = new KicadCanvas({})
            kc.addElements(o.symbols.map((s) => new KicadSymbol(s, kc)))
            kc.draw()
            console.timeEnd("测试耗时3")
        })
}

__main()
