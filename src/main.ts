import { listify, tokenize } from "./tokenizer.ts"
import { KicadCanvas } from "./kicad-canvas/index.ts"
import { KCFootPoint, KCSymbol } from "./kicad-canvas/element.ts"
import { createDraft } from "immer"
import { injectPropsbyParseTokenList } from "./parser.ts"

const drawKicadSymbol = (kicadSymbolFileText: string) => {
    const tokenList = listify(kicadSymbolFileText)[0] as any[]
    const o = {} as any
    console.log("tokenList", tokenList)
    injectPropsbyParseTokenList(o, tokenList)
    console.log("o", o)
    const kc = new KicadCanvas({})
    kc.addElements(o.symbols.map((s: any) => new KCSymbol(s)))
    kc.firstDraw()
}

const drawKicadModule = (kicadSymbolFileText: string) => {
    const tokenList = listify(kicadSymbolFileText)[0] as any[]
    const o = {} as any
    console.log("tokenList", tokenList)
    injectPropsbyParseTokenList(o, tokenList)
    console.log("o", o)
    const kc = new KicadCanvas({})
    kc.addElement(new KCFootPoint(o))
    kc.firstDraw()
}
const testSymbol = () => {
    fetch("./MMBFJ112.kicad_sym")
        .then((res) => res.text())
        .then((data) => {
            console.time("测试耗时1")
            drawKicadSymbol(data)
            console.timeEnd("测试耗时1")
        })
    fetch("./MOD-nRF8001.kicad_sym")
        .then((res) => res.text())
        .then((data) => {
            console.time("测试耗时2")
            drawKicadSymbol(data)
            console.timeEnd("测试耗时2")
        })
    fetch("./ONSC-MC1496_B-14.kicad_sym")
        .then((res) => res.text())
        .then((data) => {
            console.time("测试耗时3")
            drawKicadSymbol(data)
            console.timeEnd("测试耗时3")
        })
    fetch("./test2.kicad_sym")
        .then((res) => res.text())
        .then((data) => {
            console.time("测试耗时4")
            drawKicadSymbol(data)
            console.timeEnd("测试耗时4")
        })
}

const testFootprint = () => {
    fetch("./SOT-23.kicad_mod")
        .then((res) => res.text())
        .then((data) => {
            console.time("测试耗时f 1")
            drawKicadModule(data)
            console.timeEnd("测试耗时f 1")
        })
    fetch("./DP83822HRHBT.kicad_mod")
        .then((res) => res.text())
        .then((data) => {
            console.time("测试耗时f 2")
            drawKicadModule(data)
            console.timeEnd("测试耗时f 2")
        })
}

const __main = () => {
    testSymbol()
    // testFootprint()
}

__main()
