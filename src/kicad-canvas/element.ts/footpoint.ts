import { KicadCanvas, kicadCanvasStore } from ".."
import { KicadShape, Rectangle, FpCircle, Polyline, Arc, Line } from "../shape"
import theme from "../themes/kicad-default"
import { MIN_FONT_SIZE, MAX_FONT_SIZE, KicadCanvasElement } from "./element"

interface Drill {
    size: { width: number; height: number }
    offset?: { x: number; y: number }
    diameter?: number
    oval?: boolean
}
export class FootPointPad {
    number: string
    type:
        | "smd"
        | "thru_hole"
        | "np_thru_hole"
        | "plated_hole"
        | "non_plated_hole"
    shape: "rect" | "circle" | "oval" | "roundrect" | "custom"
    at: { x: number; y: number; angle?: number }
    size: { width: number; height: number }
    drill?: Drill
    layers: string[]
    roundrect_rratio: number
    isMouseHovering: boolean = false
    shapes: KicadShape[] = []

    constructor(pad: any) {
        this.number = pad.number
        this.type = pad.type
        this.shape = pad.shape
        this.at = pad.at
        this.size = pad.size
        this.drill = pad.drill
        this.layers = pad.layers
        this.roundrect_rratio = pad.roundrect_rratio
        console.log("pad", pad)
        if (pad.primitives) {
            this.shapes = [
                ...pad.primitives.rectangles.map((r: any) => new Rectangle(r)),
                ...pad.primitives.circles.map((c: any) => new FpCircle(c)),
                ...pad.primitives.polylines.map((p: any) => new Polyline(p)),
                ...pad.primitives.arcs.map((a: any) => new Arc(a)),
            ]
        }
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
                    kicadCanvasStore.setState({
                        hightLightPinOrPadNumber: undefined,
                    })
                }
                kCanvas.draw()
            }
        })
    }
    draw(ctx: CanvasRenderingContext2D) {
        console.log("draw 焊盘", this)
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
        // 如果是通孔，绘制钻孔
        if (this.type === "thru_hole" && this.drill) {
            this.drawDrill(ctx)
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

        ctx.restore()
    }

    private setStyle(ctx: CanvasRenderingContext2D) {
        const otherHovering =
            kicadCanvasStore.getState().hightLightPinOrPadNumber === this.number
        if (this.isMouseHovering || otherHovering) {
            ctx.fillStyle = "#00ffff"
        } else {
            // 根据焊盘类型设置颜色
            if (this.type === "thru_hole") {
                ctx.fillStyle = theme.board.pad_through_hole.to_css()
            } else if (this.type === "plated_hole") {
                ctx.fillStyle = theme.board.pad_plated_hole.to_css()
            } else if (
                this.type === "non_plated_hole" ||
                this.type === "np_thru_hole"
            ) {
                ctx.fillStyle = theme.board.non_plated_hole.to_css()
            } else {
                // SMD 焊盘根据层来设置颜色
                if (this.layers.includes("F.Cu")) {
                    ctx.fillStyle = theme.board.copper.f.to_css()
                } else if (this.layers.includes("B.Cu")) {
                    ctx.fillStyle = theme.board.copper.b.to_css()
                }
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
            ctx.save()
            // 非镀铜通孔应该使用基板颜色而不是黑色
            ctx.fillStyle =
                this.type === "np_thru_hole" || this.type === "non_plated_hole"
                    ? theme.board.background.to_css() // 使用基板背景色
                    : "#000000" // 镀铜通孔使用黑色

            const offset = this.drill.offset || { x: 0, y: 0 }

            if (this.drill.oval) {
                // 槽形钻孔
                const width = this.drill.size.width
                const height = this.drill.size.height
                const radius = Math.min(width, height) / 2

                ctx.beginPath()
                if (width > height) {
                    // 水平槽形孔
                    const centerDistance = width - height
                    const leftCenter = offset.x - centerDistance / 2
                    const rightCenter = offset.x + centerDistance / 2

                    // 绘制右半圆
                    ctx.arc(
                        rightCenter,
                        offset.y,
                        radius,
                        -Math.PI / 2,
                        Math.PI / 2
                    )
                    // 绘制左半圆
                    ctx.arc(
                        leftCenter,
                        offset.y,
                        radius,
                        Math.PI / 2,
                        -Math.PI / 2
                    )
                } else {
                    // 垂直槽形孔
                    const centerDistance = height - width
                    const topCenter = offset.y - centerDistance / 2
                    const bottomCenter = offset.y + centerDistance / 2

                    // 绘制下半圆
                    ctx.arc(offset.x, bottomCenter, radius, 0, Math.PI)
                    // 绘制上半圆
                    ctx.arc(offset.x, topCenter, radius, Math.PI, 0)
                }
                ctx.closePath()
                ctx.fill()
            } else if (this.drill.diameter) {
                // 圆形钻孔
                ctx.beginPath()
                ctx.arc(
                    offset.x,
                    offset.y,
                    this.drill.diameter / 2,
                    0,
                    Math.PI * 2
                )
                ctx.fill()
            }

            ctx.restore()
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
            rectangles = [],
            circles = [],
            polylines = [],
            arcs = [],
        } = symbol
        this.number = number
        this.pads = pads.map((p: any) => new FootPointPad(p))
        this.roundrect_rratio = roundrect_rratio

        this.shapes.push(
            ...lines.map((l: any) => new Line(l)),
            ...rectangles.map((r: any) => new Rectangle(r)),
            ...circles.map((c: any) => new FpCircle(c)),
            ...polylines.map((p: any) => new Polyline(p)),
            ...arcs.map((a: any) => new Arc(a))
        )
    }
}
