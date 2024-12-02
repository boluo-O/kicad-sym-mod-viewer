import {
    Circle,
    Polyline,
    Rectangle,
    Arc,
    KicadShape,
    KicadShapeListMap,
    Line,
} from "./shape"
import { KicadCanvas, KicadCanvasStore } from "./index"

abstract class KicadCanvasElement {
    shapeMap: KicadShapeListMap = {}
}

interface Size {
    width: number
    height: number
}
export class SymbolPin {
    shape: "line"
    name: { text: string; effects: { font: { size: Size } } }
    number: { text: string; effects: { font: { size: Size } } }
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

    public bindEvent(ctx: CanvasRenderingContext2D, kCanvas: KicadCanvas) {
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

        // pin 文字和数字
        ctx.save()
        ctx.translate(this.at.x, this.at.y)
        ctx.font = `${this.name.effects.font.size.width || 1.27}px Arial`
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
                -this.name.effects.font.size.width / 2
            )
            // name在line结尾点
            ctx.fillText(
                this.name.text,
                this.length + textPdding,
                this.name.effects.font.size.width / 2
            )
        } else if (rotation === 180) {
            // 右边
            // number在line中间
            ctx.fillText(
                this.number.text,
                -this.length / 2 - numberWidth / 2,
                -this.name.effects.font.size.width / 2
            )
            // name在line结尾点
            ctx.fillText(
                this.name.text,
                -this.length - nameWidth - textPdding,
                this.name.effects.font.size.width / 2
            )
        } else if (rotation === 90) {
            // 上边
            ctx.rotate(-Math.PI / 2) // 逆时针旋转90度
            // number在line结尾点
            ctx.fillText(
                this.number.text,
                this.length - this.name.effects.font.size.width,
                0
            )
            // name在number上方
            ctx.fillText(
                this.name.text,
                this.length + this.name.effects.font.size.width + textPdding,
                0
            )
        } else if (rotation === 270) {
            // 下边
            ctx.rotate(-Math.PI / 2) // 逆时针旋转90度
            // number在name下方
            ctx.fillText(
                this.number.text,
                -this.length + this.name.effects.font.size.width,
                0
            )
            // name在line结尾点
            ctx.fillText(this.name.text, -this.length - nameWidth, 0)
        }
        ctx.restore()
    }
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

export class FootPointPad {
    number: string
    type: "smd" | "thru_hole" | "np_thru_hole"
    shape: "rect" | "circle" | "oval" | "roundrect" | "custom"
    at: { x: number; y: number; angle?: number }
    size: { width: number; height: number }
    drill?: { size: number; offset?: { x: number; y: number } }
    layers: string[]
    roundrect_rratio: number

    constructor(pad: any) {
        this.number = pad.number
        this.type = pad.type
        this.shape = pad.shape
        this.at = pad.at
        this.size = pad.size
        this.drill = pad.drill
        this.layers = pad.layers
        this.roundrect_rratio = pad.roundrect_rratio
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        console.log("画pad")

        // 移动到焊盘中心位置
        ctx.translate(this.at.x, this.at.y)
        if (this.at.angle) {
            ctx.rotate((this.at.angle * Math.PI) / 180)
        }

        // 根据类型设置样式
        this.setStyle(ctx)
        console.log("this", this)
        // 根据形状绘制
        switch (this.shape) {
            case "rect":
                this.drawRect(ctx)
                break
            case "circle":
                this.drawCircle(ctx)
                break
            case "oval":
                this.drawOval(ctx)
                break
            case "roundrect":
                this.drawRoundRect(ctx)
                break
        }

        // 如果是通孔，绘制钻孔
        if (this.type === "thru_hole" && this.drill) {
            this.drawDrill(ctx)
        }

        ctx.restore()
    }

    private setStyle(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#C2362D" // 顶层铜箔色
        // 根据层设置颜色
        // if (this.layers.includes("F.Cu")) {
        //     ctx.fillStyle = "#C2362D" // 顶层铜箔色
        // } else if (this.layers.includes("B.Cu")) {
        //     ctx.fillStyle = "#1D5D87" // 底层铜箔色
        // }
    }

    private drawRect(ctx: CanvasRenderingContext2D) {
        const { width, height } = this.size
        ctx.fillRect(-width / 2, -height / 2, width, height)
    }

    private drawCircle(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(0, 0, this.size.width / 2, 0, Math.PI * 2)
        ctx.fill()
    }

    private drawOval(ctx: CanvasRenderingContext2D) {
        const { width, height } = this.size
        ctx.beginPath()
        ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2)
        ctx.fill()
    }

    private drawRoundRect(ctx: CanvasRenderingContext2D) {
        const { width, height } = this.size
        const radius = Math.min(width, height) * this.roundrect_rratio

        ctx.beginPath()
        ctx.moveTo(-width / 2 + radius, -height / 2)
        ctx.lineTo(width / 2 - radius, -height / 2)
        ctx.arcTo(
            width / 2,
            -height / 2,
            width / 2,
            -height / 2 + radius,
            radius
        )
        ctx.lineTo(width / 2, height / 2 - radius)
        ctx.arcTo(width / 2, height / 2, width / 2 - radius, height / 2, radius)
        ctx.lineTo(-width / 2 + radius, height / 2)
        ctx.arcTo(
            -width / 2,
            height / 2,
            -width / 2,
            height / 2 - radius,
            radius
        )
        ctx.lineTo(-width / 2, -height / 2 + radius)
        ctx.arcTo(
            -width / 2,
            -height / 2,
            -width / 2 + radius,
            -height / 2,
            radius
        )
        ctx.fill()
    }

    private drawDrill(ctx: CanvasRenderingContext2D) {
        if (this.drill) {
            ctx.fillStyle = "#000000" // 钻孔颜色

            const drillOffset = this.drill.offset || { x: 0, y: 0 }
            ctx.beginPath()
            ctx.arc(
                drillOffset.x,
                drillOffset.y,
                this.drill.size / 2,
                0,
                Math.PI * 2
            )
            ctx.fill()
        }
    }
}

export class KCFootPoint extends KicadCanvasElement {
    number: string
    roundrect_rratio: number
    shapes: KicadShape[] = []
    pads: FootPointPad[] = []

    constructor(symbol: any) {
        super()
        const {
            number,
            pads = [],
            lines = [],
            roundrect_rratio,
            symbols = [],
            rectangles = [],
            circles = [],

            arcs = [],
        } = symbol
        this.number = number
        this.pads = pads.map((p: any) => new FootPointPad(p))
        this.roundrect_rratio = roundrect_rratio

        this.shapes.push(
            // ...rectangles.map((r: any) => new Rectangle(r)),
            ...lines.map((l: any) => new Line(l))
        )
    }
}
