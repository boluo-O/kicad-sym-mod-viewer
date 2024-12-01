import {
    Circle,
    Polyline,
    Rectangle,
    Arc,
    KicadShape,
    KicadShapeListMap,
} from "./shape"
import { KicadCanvas, KicadCanvasStore } from "./index"

abstract class KicadCanvasElement {
    shapeMap: KicadShapeListMap = {}
}
function countDigits(num: number): number {
    // Handle negative numbers by converting to positive
    const absNum = Math.abs(num)

    // Handle 0 as a special case
    if (absNum === 0) return 1

    // Use Math.floor(Math.log10(n)) + 1 to count digits
    return Math.floor(Math.log10(absNum)) + 1
}

export class SymbolPin {
    shape: "line"
    name: { text: string; effects: { font: { size: number } } }
    number: { text: string; effects: { font: { size: number } } }
    at: { x: number; y: number; rotate: number }
    length: number
    isMouseHovering: boolean = false
    constructor({ at, length, name, shape, number }) {
        this.at = at
        this.shape = shape
        this.length = length
        this.name = name
        this.number = number
        this.shape = shape
    }

    public bindEvent(ctx, kCanvas: KicadCanvas) {
        // 添加鼠标移动检测引脚
        kCanvas.canvas.addEventListener("mousemove", (event) => {
            const preIsMouseHovering = this.isMouseHovering
            this.isMouseHovering = false

            const rect = kCanvas.canvas.getBoundingClientRect()
            const mouseX =
                (event.clientX - rect.left - kCanvas.offsetX) / kCanvas.scale
            const mouseY =
                (event.clientY - rect.top - kCanvas.offsetY) / kCanvas.scale
            const distance = Math.sqrt(
                Math.pow(mouseX - this.at.x, 2) +
                    Math.pow(mouseY - this.at.y, 2)
            )
            if (distance < 1) {
                this.isMouseHovering = true
            }
            if (preIsMouseHovering !== this.isMouseHovering) {
                kCanvas.draw()
                if (this.isMouseHovering) {
                    console.log(this)

                    console.log(
                        `引脚信息: ${this.name.text} (${this.number.text})`
                    )
                }
            }
        })
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        if (this.isMouseHovering) {
            ctx.strokeStyle = "red"
            ctx.fillStyle = "red"
            // 显示引脚信息
        } else {
            ctx.strokeStyle = "black"
            ctx.fillStyle = "black"
        }
        // pin 点
        ctx.beginPath()
        ctx.arc(this.at.x, this.at.y, 0.254, 0, Math.PI * 2)
        ctx.fill()
        // pin 线
        ctx.translate(this.at.x, this.at.y)
        ctx.rotate(((this.at.rotate + 90) * Math.PI) / 180) // 旋转角度
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineWidth = 0.254 // 设置线宽
        ctx.lineTo(0, -this.length) // 绘制引脚
        ctx.stroke()
        ctx.restore() // 恢复之前的状态
        // ctx.rotate(0)
        // ctx.font = `${this.name.effects.font.size}px Arial` // 设置字体大小
        // ctx.fillText(
        //     this.name.text,
        //     0,
        //     -this.length + this.name.effects.font.size
        // ) // 名称
        // ctx.fillText(
        //     this.number.text,
        //     0,
        //     -this.length + this.name.effects.font.size * 2
        // ) // 编号
        // ctx.restore()
        // 重新保存上下文状态用于绘制文字

        ctx.save()
        ctx.translate(this.at.x, this.at.y)
        ctx.font = `${this.name.effects.font.size || 1.27}px Arial`
        ctx.strokeStyle = "black"
        ctx.fillStyle = "black"
        // 根据旋转角度确定文本位置
        const rotation = this.at.rotate % 360
        const textPdding = 0.5
        const nameWidth = ctx.measureText(this.name.text).width
        const numberWidth = ctx.measureText(this.number.text).width

        if (rotation === 0) {
            // 左边
            // number在line中间
            ctx.fillText(
                this.number.text,
                this.length / 2 - numberWidth / 2,
                -this.name.effects.font.size / 2
            )
            // name在line结尾点
            ctx.fillText(
                this.name.text,
                this.length + textPdding,
                this.name.effects.font.size / 2
            )
        } else if (rotation === 180) {
            // 右边
            // number在line中间
            ctx.fillText(
                this.number.text,
                -this.length / 2 - numberWidth / 2,
                -this.name.effects.font.size / 2
            )
            // name在line结尾点
            ctx.fillText(
                this.name.text,
                -this.length - nameWidth - textPdding,
                this.name.effects.font.size / 2
            )
        } else if (rotation === 90) {
            // 上边
            ctx.rotate(-Math.PI / 2) // 逆时针旋转90度
            // number在line结尾点
            ctx.fillText(
                this.number.text,
                this.length - this.name.effects.font.size,
                0
            )
            // name在number上方
            ctx.fillText(
                this.name.text,
                this.length + this.name.effects.font.size + textPdding,
                0
            )
        } else if (rotation === 270) {
            // 下边
            ctx.rotate(-Math.PI / 2) // 逆时针旋转90度
            // number在name下方
            ctx.fillText(
                this.number.text,
                -this.length + this.name.effects.font.size,
                0
            )
            // name在line结尾点
            ctx.fillText(this.name.text, -this.length - nameWidth, 0)
        }
        ctx.restore()
    }
}

interface Symbol {
    name: string
    pins: SymbolPin[]
    symbols: Symbol[]
    rectangles: Rectangle[]
    circles: Circle[]
    polylines: Polyline[]
    arcs: Arc[]
}

export class KCSymbol extends KicadCanvasElement {
    name: string
    pins: SymbolPin[]
    children: KCSymbol[] = []
    elements: any[] = []
    shapes: KicadShape[] = []

    constructor(symbol: any) {
        super()
        const {
            name,
            pins = [],
            symbols = [],
            rectangles = [],
            circles = [],
            polylines = [],
            arcs = [],
        } = symbol
        this.name = name
        // this.symbols = symbol.symbols || []
        this.children = symbols.map((symbol: any) => new KCSymbol(symbol))
        this.pins = pins.map((pin: any) => new SymbolPin(pin))

        this.shapes.push(
            ...rectangles.map((r: any) => new Rectangle(r)),
            ...circles.map((c: any) => new Circle(c)),
            ...polylines.map((p: any) => new Polyline(p)),
            ...arcs.map((a: any) => new Arc(a))
        )
    }
}
