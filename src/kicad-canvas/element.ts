import {
    Circle,
    Polyline,
    Rectangle,
    Arc,
    KicadShape,
    KicadShapeListMap,
    Line,
    FpCircle,
} from "./shape"
import { KicadCanvas, kicadCanvasStore } from "./index"
import theme from "./themes/kicad-default"

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
                    kicadCanvasStore.setState({ hightLightPinOrPadNumber: "" })
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
            ctx.strokeStyle = "red"
            ctx.fillStyle = "red"
            // 显示引脚信息
        } else {
            ctx.strokeStyle = theme.schematic.pin.to_css()
            ctx.fillStyle = theme.schematic.pin.to_css()
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
// 定义字体大小的常量
const MIN_FONT_SIZE = 0.4 // 最小字体大小（mm）
const MAX_FONT_SIZE = 2.0 // 最大字体大小（mm）
export class FootPointPad {
    number: string
    type: "smd" | "thru_hole" | "np_thru_hole"
    shape: "rect" | "circle" | "oval" | "roundrect" | "custom"
    at: { x: number; y: number; angle?: number }
    size: { width: number; height: number }
    drill?: { size: number; offset?: { x: number; y: number } }
    layers: string[]
    roundrect_rratio: number
    isMouseHovering: boolean = false

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

            // 计算旋转后的鼠标坐标
            const angle = ((this.at.angle || 0) * Math.PI) / 180
            const dx = mouseX - this.at.x
            const dy = mouseY - this.at.y
            const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle)
            const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle)

            // 检查鼠标是否在焊盘范围内
            const halfWidth = this.size.width / 2
            const halfHeight = this.size.height / 2

            // 根据焊盘形状检查是否在范围内
            switch (this.shape) {
                case "rect":
                case "roundrect":
                    // 矩形和圆角矩形使用矩形检测
                    if (
                        rotatedX >= -halfWidth &&
                        rotatedX <= halfWidth &&
                        rotatedY >= -halfHeight &&
                        rotatedY <= halfHeight
                    ) {
                        this.isMouseHovering = true
                    }
                    break

                case "circle":
                    // 圆形使用距离检测
                    const distance = Math.sqrt(
                        rotatedX * rotatedX + rotatedY * rotatedY
                    )
                    if (distance <= halfWidth) {
                        // 圆形焊盘使用width作为直径
                        this.isMouseHovering = true
                    }
                    break

                case "oval":
                    // 椭圆形使用椭圆方程检测
                    const normalizedX = rotatedX / halfWidth
                    const normalizedY = rotatedY / halfHeight
                    if (
                        normalizedX * normalizedX + normalizedY * normalizedY <=
                        1
                    ) {
                        this.isMouseHovering = true
                    }
                    break
            }
            if (preIsMouseHovering !== this.isMouseHovering) {
                if (this.isMouseHovering) {
                    console.log(
                        `Pad ${this.number} - Type: ${this.type}, Shape: ${this.shape}`
                    )
                    kicadCanvasStore.setState({
                        hightLightPinOrPadNumber: this.number,
                    })
                } else {
                    kicadCanvasStore.setState({ hightLightPinOrPadNumber: "" })
                }
                kCanvas.draw()
            }
        })
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        // 移动到焊盘中心位置
        ctx.translate(this.at.x, this.at.y)
        if (this.at.angle) {
            ctx.rotate((this.at.angle * Math.PI) / 180)
        }

        // 根据类型设置样式
        this.setStyle(ctx)
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

        // 绘制焊盘编号
        ctx.fillStyle = "#FFFFFF" // 设置文字颜色为白色
        // 在 draw 方法中计算字体大小
        const fontSize = Math.min(
            Math.max(
                MIN_FONT_SIZE,
                Math.min(this.size.width, this.size.height) * 0.5
            ),
            MAX_FONT_SIZE
        )
        ctx.font = `${fontSize}px Arial` // 设置文字大小和字体
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(this.number, 0, 0) // 在焊盘中心绘制编号
        // 如果是通孔，绘制钻孔
        if (this.type === "thru_hole" && this.drill) {
            this.drawDrill(ctx)
        }

        ctx.restore()
    }

    private setStyle(ctx: CanvasRenderingContext2D) {
        const otherHovering =
            kicadCanvasStore.getState().hightLightPinOrPadNumber === this.number
        if (this.isMouseHovering || otherHovering) {
            ctx.fillStyle =
                theme.board.cursor?.toString() || "rgb(255, 255, 255)"
        } else {
            // 根据层设置颜色
            if (this.layers.includes("F.Cu")) {
                ctx.fillStyle = theme.board.copper.f.to_css()
            } else if (this.layers.includes("B.Cu")) {
                ctx.fillStyle = theme.board.copper.b.to_css()
            }
        }
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
        const halfWidth = width / 2
        const halfHeight = height / 2

        // 计算最小边作为圆弧半径
        const radius = Math.min(halfWidth, halfHeight)

        ctx.beginPath()

        if (width === height) {
            // 如果宽高相等，直接画圆
            ctx.arc(0, 0, radius, 0, Math.PI * 2)
        } else if (width > height) {
            // 宽大于高，水平方向的椭圆
            const leftCenter = -halfWidth + radius
            const rightCenter = halfWidth - radius

            // 从右上开始，顺时针方向
            ctx.moveTo(rightCenter, -radius)

            // 画右半圆 (从上到下)
            ctx.arc(rightCenter, 0, radius, -Math.PI / 2, Math.PI / 2)

            // 画左半圆 (从下到上)
            ctx.arc(leftCenter, 0, radius, Math.PI / 2, -Math.PI / 2)
        } else {
            // 高大于宽，垂直方向的椭圆
            const topCenter = -halfHeight + radius
            const bottomCenter = halfHeight - radius

            // 从右下开始，顺时针方向
            ctx.moveTo(radius, bottomCenter)

            // 画下半圆 (从右到左)
            ctx.arc(0, bottomCenter, radius, 0, Math.PI)

            // 画上半圆 (从左到右)
            ctx.arc(0, topCenter, radius, Math.PI, 0)
        }

        ctx.closePath()
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
            polylines = [],
            arcs = [],
        } = symbol
        this.number = number
        this.pads = pads.map((p: any) => new FootPointPad(p))
        this.roundrect_rratio = roundrect_rratio

        this.shapes.push(
            // ...rectangles.map((r: any) => new Rectangle(r)),
            ...lines.map((l: any) => new Line(l)),
            ...polylines.map((p: any) => new Polyline(p)),
            ...circles.map((c: any) => new FpCircle(c))
        )
    }
}
