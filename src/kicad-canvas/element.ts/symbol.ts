import { KicadCanvas, kicadCanvasStore } from ".."
import { KicadShape, Rectangle, Circle, Polyline, Arc } from "../shape"
import theme from "../themes/kicad-default"
import { Size, KicadCanvasElement } from "./element"

export class SymbolPin {
    type:
        | "input"
        | "output"
        | "bidirectional"
        | "tri_state"
        | "passive"
        | "power_in"
        | "power_out"

    shape:
        | "line"
        | "inverted"
        | "clock"
        | "inverted_clock"
        | "input_low"
        | "output_low"
        | "edge_clock_high"
        | "non_logic"
        | "clock_low"
    name: { text: string; effects: { font: { size: Size } } }
    number: { text: string; effects: { font: { size: Size } } }
    at: { x: number; y: number; rotate: number }
    length: number
    isMouseHovering: boolean = false
    constructor(pin: any) {
        const { at, length, name, shape, number, type } = pin
        this.at = at
        this.shape = shape
        this.length = length
        this.name = name
        this.number = number
        this.type = type
    }

    public bindEvent(ctx: CanvasRenderingContext2D, kCanvas: KicadCanvas) {
        // 添加鼠标移动检测引脚
        kCanvas.canvas.addEventListener("mousemove", (event) => {
            const preIsMouseHovering = this.isMouseHovering
            this.isMouseHovering = false
            kicadCanvasStore
            const rect = kCanvas.canvas.getBoundingClientRect()
            const mouseX =
                (event.clientX - rect.left - kCanvas.offsetX) / kCanvas.scale
            const mouseY =
                (event.clientY - rect.top - kCanvas.offsetY) / kCanvas.scale

            // 计算相对于引脚起始点的鼠标坐标
            const dx = mouseX - this.at.x
            const dy = mouseY - this.at.y
            // 将鼠标坐标旋转到引脚的坐标系中
            const angle = ((this.at.rotate + 90) * Math.PI) / 180
            const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle)
            const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle)

            // 定义检测区域的尺寸
            const rectWidth = this.length // 线段长度
            const rectHeight = 0.254 * 2 // 线段宽度 (0.254) * 2.5

            // 检查旋转后的坐标是否在检测区域内
            if (
                rotatedX >= -rectHeight &&
                rotatedX <= rectHeight &&
                rotatedY >= -rectWidth &&
                rotatedY <= 0 + 0.5 + 0.25 // + 点直径 + 0.25
            ) {
                this.isMouseHovering = true
            }
            if (preIsMouseHovering !== this.isMouseHovering) {
                if (this.isMouseHovering) {
                    console.log(
                        `引脚信息: ${this.name.text} (${this.number.text})`
                    )
                    kicadCanvasStore.setState({
                        hightLightPinOrPadNumber: this.number.text,
                    })
                } else {
                    kicadCanvasStore.setState({
                        hightLightPinOrPadNumber: undefined,
                    })
                }
                kCanvas.draw()
            }
        })
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        const otherHovering =
            kicadCanvasStore.getState().hightLightPinOrPadNumber ===
            this.number.text

        if (this.isMouseHovering || otherHovering) {
            ctx.strokeStyle = "#00ffff"
            ctx.fillStyle = "#00ffff"
            // 显示引脚信息
        } else {
            ctx.strokeStyle = theme.schematic.pin.to_css()
            ctx.fillStyle = theme.schematic.pin.to_css()
        }
        if (this.shape !== "clock" && this.shape !== "clock_low") {
            // pin 点
            ctx.beginPath()
            ctx.arc(this.at.x, this.at.y, 0.254, 0, Math.PI * 2)
            ctx.fill()
        }
        this.drawLineAndShape(ctx)
        ctx.stroke()
        ctx.restore()
        this.drawTextAndNumber(ctx)
    }

    drawLineAndShape(ctx: CanvasRenderingContext2D) {
        //  旋转
        ctx.translate(this.at.x, this.at.y)
        ctx.rotate(((this.at.rotate + 90) * Math.PI) / 180) // 旋转角度
        ctx.lineWidth = 0.1524
        //  画形状和引脚线
        if (this.shape === "inverted") {
            // 绘制反相圆圈
            ctx.beginPath()
            const circleRadius = 0.6 // 圆圈半径
            ctx.arc(
                0,
                -this.length + circleRadius,
                circleRadius,
                0,
                Math.PI * 2
            )
            ctx.stroke()

            // pin 线 (需要缩短一点以适应圆圈)
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -(this.length - circleRadius * 2)) // 线条长度减去圆圈半径
        } else if (this.shape === "clock") {
            // 绘制时钟符号（两条直角线段）
            const clockSize = 0.6 // 时钟符号大小
            const shift = 0.3 // 向右的偏移量
            ctx.beginPath()

            // 时钟箭头（两条90度的线段）
            ctx.moveTo(-clockSize, -(this.length - clockSize + shift))
            ctx.lineTo(0, -this.length - shift) // 改为指向端点，不再偏移0.3
            ctx.lineTo(clockSize, -(this.length - clockSize + shift))
            ctx.stroke()

            // pin 线
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -this.length) // 线条长度减去时钟符号高度
            ctx.stroke()
        } else if (this.shape === "inverted_clock") {
            // 绘制反相圆圈
            ctx.beginPath()
            const circleRadius = 0.6 // 圆圈半径
            ctx.arc(
                0,
                -this.length + circleRadius,
                circleRadius,
                0,
                Math.PI * 2
            )
            ctx.stroke()

            // 绘制时钟符号（两条直角线段）
            const clockSize = 0.6 // 时钟符号大小
            const shift = 0.6 // 向右的偏移量
            ctx.beginPath()

            // 时钟箭头（两条90度的线段）
            ctx.moveTo(-clockSize, -(this.length - clockSize + shift))
            ctx.lineTo(0, -this.length - shift) // 改为指向端点，不再偏移0.3
            ctx.lineTo(clockSize, -(this.length - clockSize + shift))
            ctx.stroke()

            // pin 线 (需要缩短一点以适应圆圈)
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -(this.length - circleRadius * 2)) // 线条长度减去圆圈半径
        } else if (this.shape === "edge_clock_high") {
            const clockSize = 0.6 // 时钟符号大小
            const edgeHeight = clockSize * 2 // 竖线高度

            ctx.beginPath()

            // 主引脚线
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -this.length)

            // 绘制上升沿时钟符号
            ctx.moveTo(-edgeHeight, -(this.length - edgeHeight)) // 左下角
            ctx.lineTo(0, -(this.length - edgeHeight)) // 水平线到中间
            ctx.lineTo(0, -this.length) // 垂直线到顶部
            ctx.lineTo(-edgeHeight, -(this.length - edgeHeight)) // 斜线到右下角

            // 绘制时钟符号（两条直角线段）
            const shift = 0.4 // 向右的偏移量
            // 时钟箭头（两条90度的线段）
            ctx.moveTo(-clockSize, -(this.length - clockSize + shift))
            ctx.lineTo(0, -this.length - shift) // 改为指向端点，不再偏移0.3
            ctx.lineTo(clockSize, -(this.length - clockSize + shift))
            ctx.stroke()

            ctx.stroke()
        } else if (this.shape === "non_logic") {
            const xSize = 0.5 // X符号的大小

            ctx.beginPath()
            // 主引脚线
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -this.length)

            // 绘制X符号
            const xCenter = -this.length
            // 绘制 \
            ctx.moveTo(-xSize, xCenter - xSize)
            ctx.lineTo(xSize, xCenter + xSize)
            // 绘制 /
            ctx.moveTo(-xSize, xCenter + xSize)
            ctx.lineTo(xSize, xCenter - xSize)

            ctx.stroke()
        } else if (this.shape === "clock_low") {
            const xSize = 0.25 // X符号的大小

            ctx.beginPath()
            // 主引脚线
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -this.length)

            // 绘制X符号在起始点 (0, 0)
            // 绘制 \
            ctx.moveTo(-xSize, -xSize)
            ctx.lineTo(xSize, xSize)
            // 绘制 /
            ctx.moveTo(-xSize, xSize)
            ctx.lineTo(xSize, -xSize)

            ctx.stroke()
        } else if (this.shape === "output_low") {
            const clockSize = 0.5 // 时钟符号大小
            const edgeHeight = clockSize * 2 // 竖线高度

            ctx.beginPath()
            // 主引脚线
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -this.length)

            ctx.moveTo(0, -(this.length - edgeHeight)) // 起始点
            ctx.lineTo(edgeHeight, -this.length) // 斜线到左上角

            ctx.stroke()
        } else if (this.shape === "input_low") {
            const clockSize = 0.6 // 时钟符号大小
            const edgeHeight = clockSize * 2 // 竖线高度

            ctx.beginPath()

            // 主引脚线
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -this.length)

            // 绘制上升沿时钟符号
            ctx.moveTo(0, -(this.length - edgeHeight)) // 左下角
            ctx.lineTo(edgeHeight, -(this.length - edgeHeight)) // 水平线到中间
            ctx.lineTo(0, -this.length) // 垂直线到顶部
        } else if (this.shape === "line") {
            // 原来的直线绘制代码
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(0, -this.length)
        }
    }

    drawTextAndNumber(ctx: CanvasRenderingContext2D) {
        // pin 文字和数字
        ctx.save()
        ctx.translate(this.at.x, this.at.y)
        ctx.font = `${this.name.effects.font.size.width || 1.27}px Arial`
        ctx.strokeStyle = theme.schematic.pin_name.to_css()
        ctx.fillStyle = theme.schematic.pin_name.to_css()
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
