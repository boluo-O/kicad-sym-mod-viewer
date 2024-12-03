const parseRowMap: Record<
    string,
    (o: any, propsList: any[], injectPropsbyParseTokenList: any) => void
> = {
    // 基本信息相关
    version: (o, propsList, injectPropsbyParseTokenList) => {
        o.version = propsList[1]
    },
    generator: (o, propsList, injectPropsbyParseTokenList) => {
        o.generator = propsList[1]
    },
    generator_version: (o, propsList, injectPropsbyParseTokenList) => {
        o.generator_version = propsList[1]
    },
    // 原理图符号相关
    symbol: (o, propsList, injectPropsbyParseTokenList) => {
        const symbol = {
            name: propsList[1],
        }
        injectPropsbyParseTokenList(symbol, propsList.slice(2))
        if (o.symbols) {
            o.symbols.push(symbol)
        } else {
            o.symbols = [symbol]
        }
    },
    pin: (o, propsList, injectPropsbyParseTokenList) => {
        const pin = {}
        injectPropsbyParseTokenList(pin, propsList.slice(1))
        if (o.pins) {
            o.pins.push(pin)
        } else {
            o.pins = [pin]
        }
    },
    // 封装图相关
    pad: (o, propsList, injectPropsbyParseTokenList) => {
        const pad = {
            number: propsList[1],
            type: propsList[2],
            shape: propsList[3],
        }
        injectPropsbyParseTokenList(pad, propsList.slice(4))
        if (o.pads) {
            o.pads.push(pad)
        } else {
            o.pads = [pad]
        }
    },
    fp_line: (o, propsList, injectPropsbyParseTokenList) => {
        const line = {}
        injectPropsbyParseTokenList(line, propsList.slice(1))
        if (o.lines) {
            o.lines.push(line)
        } else {
            o.lines = [line]
        }
    },
    fp_poly: (o, propsList, injectPropsbyParseTokenList) => {
        const polyline = {}
        injectPropsbyParseTokenList(polyline, propsList.slice(1))
        if (o.polylines) {
            o.polylines.push(polyline)
        } else {
            o.polylines = [polyline]
        }
    },
    fp_circle: (o, propsList, injectPropsbyParseTokenList) => {
        const circle = {}
        injectPropsbyParseTokenList(circle, propsList.slice(1))
        if (o.circles) {
            o.circles.push(circle)
        } else {
            o.circles = [circle]
        }
    },
    // 图形形状
    polyline: (o, propsList, injectPropsbyParseTokenList) => {
        const polyline = {}
        injectPropsbyParseTokenList(polyline, propsList.slice(1))
        if (o.polylines) {
            o.polylines.push(polyline)
        } else {
            o.polylines = [polyline]
        }
    },
    circle: (o, propsList, injectPropsbyParseTokenList) => {
        const circle = {}
        injectPropsbyParseTokenList(circle, propsList.slice(1))
        if (o.circles) {
            o.circles.push(circle)
        } else {
            o.circles = [circle]
        }
    },
    rectangle: (o, propsList, injectPropsbyParseTokenList) => {
        const rectangle = {}
        injectPropsbyParseTokenList(rectangle, propsList.slice(1))
        if (o.rectangles) {
            o.rectangles.push(rectangle)
        } else {
            o.rectangles = [rectangle]
        }
    },
    arc: (o, propsList, injectPropsbyParseTokenList) => {
        const arc = {}
        injectPropsbyParseTokenList(arc, propsList.slice(1))
        if (o.arcs) {
            o.arcs.push(arc)
        } else {
            o.arcs = [arc]
        }
    },
    // 其他通用
    layer: (o, propsList, injectPropsbyParseTokenList) => {
        o.layer = propsList[1]
    },
    layers: (o, propsList, injectPropsbyParseTokenList) => {
        o.layers = propsList.slice(1)
    },
    roundrect_rratio: (o, propsList, injectPropsbyParseTokenList) => {
        o.roundrect_rratio = propsList[1]
    },
    center: (o, propsList, injectPropsbyParseTokenList) => {
        o.center = {
            x: propsList[1],
            y: propsList[2],
        }
    },
    pts: (o, propsList, injectPropsbyParseTokenList) => {
        o.pts = {}
        injectPropsbyParseTokenList(o.pts, propsList.slice(1))
    },
    xy: (o, propsList, injectPropsbyParseTokenList) => {
        const xy = {
            x: propsList[1],
            y: propsList[2],
        }
        if (o.xyList) {
            o.xyList.push(xy)
        } else {
            o.xyList = [xy]
        }
    },
    stroke: (o, propsList, injectPropsbyParseTokenList) => {
        o.stroke = {}
        injectPropsbyParseTokenList(o.stroke, propsList.slice(1))
    },
    width: (o, propsList, injectPropsbyParseTokenList) => {
        o.width = propsList[1]
    },
    type: (o, propsList, injectPropsbyParseTokenList) => {
        o.type = propsList[1]
    },
    radius: (o, propsList, injectPropsbyParseTokenList) => {
        o.radius = propsList[1]
    },
    fill: (o, propsList, injectPropsbyParseTokenList) => {
        if (typeof propsList[1] === "string") {
            o.fill = propsList[1]
        } else {
            o.fill = {}
            injectPropsbyParseTokenList(o.fill, propsList.slice(1))
        }
    },
    line: (o, propsList, injectPropsbyParseTokenList) => {
        o.line = {}
        injectPropsbyParseTokenList(o.line, propsList.slice(1))
    },
    at: (o, propsList, injectPropsbyParseTokenList) => {
        o.at =
            propsList[3] === undefined
                ? { x: propsList[1], y: propsList[2] }
                : { x: propsList[1], y: propsList[2], rotate: propsList[3] }
    },
    length: (o, propsList, injectPropsbyParseTokenList) => {
        o.length = propsList[1]
    },
    name: (o, propsList, injectPropsbyParseTokenList) => {
        o.name = { text: propsList[1] }
        injectPropsbyParseTokenList(o.name, propsList.slice(2))
    },
    number: (o, propsList, injectPropsbyParseTokenList) => {
        o.number = { text: propsList[1] }
        injectPropsbyParseTokenList(o.number, propsList.slice(2))
    },
    effects: (o, propsList, injectPropsbyParseTokenList) => {
        o.effects = {}
        injectPropsbyParseTokenList(o.effects, propsList.slice(1))
    },
    font: (o, propsList, injectPropsbyParseTokenList) => {
        o.font = {}
        injectPropsbyParseTokenList(o.font, propsList.slice(1))
    },
    size: (o, propsList, injectPropsbyParseTokenList) => {
        o.size = {
            width: propsList[1],
            height: propsList[2],
        }
    },
    start: (o, propsList, injectPropsbyParseTokenList) => {
        o.start = { x: propsList[1], y: propsList[2] }
    },
    end: (o, propsList, injectPropsbyParseTokenList) => {
        o.end = { x: propsList[1], y: propsList[2] }
    },
    mid: (o, propsList, injectPropsbyParseTokenList) => {
        o.mid = { x: propsList[1], y: propsList[2] }
    },
}

export const injectPropsbyParseTokenList = (o: any, tokenList: any[]) => {
    if (Array.isArray(tokenList)) {
        for (let i = 0; i < tokenList.length; i++) {
            const row = tokenList[i]
            const keyName = row[0]
            const parseRow = parseRowMap[keyName]
            if (parseRow) {
                parseRow(o, row, injectPropsbyParseTokenList)
            }
        }
    }
}
