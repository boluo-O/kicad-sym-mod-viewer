import theme from "./themes/kicad-default"

export interface Point {
    x: number
    y: number
}

export interface Fill {
    type: "default" | "none" | "outline" | "background" | "solid"
    color?: string // 例如: "#FFFFFF"
    opacity?: number // 0-1 之间的值
}

export interface Stroke {
    type: "default" | "dash" | "dot" | "dashdot" | "solid"
    width: number // 线宽
    color?: string // 例如: "#000000"
    opacity?: number // 0-1 之间的值
}

export type Layer =
    | "F.Cu"
    | "B.Cu"
    | "F.SilkS"
    | "B.SilkS"
    | "F.Mask"
    | "B.Mask"
    | "F.Paste"
    | "B.Paste"
    | "Edge.Cuts"
    | "F.CrtYd"
    | "B.CrtYd"
    | "F.Fab"
    | "B.Fab"

abstract class Shape {
    abstract fill: Fill | undefined
    abstract stroke: Stroke | undefined
    abstract layer?: Layer
    abstract draw(ctx: CanvasRenderingContext2D): void

    getLayerColor(layer: Layer): string {
        switch (layer) {
            // 铜箔层
            case "F.Cu":
                return theme.board.copper.f.to_css()
            case "B.Cu":
                return theme.board.copper.b.to_css()

            // 丝印层
            case "F.SilkS":
                return theme.board.f_silks.to_css()
            case "B.SilkS":
                return theme.board.b_silks.to_css()

            // 阻焊层
            case "F.Mask":
                return theme.board.f_mask.to_css()
            case "B.Mask":
                return theme.board.b_mask.to_css()

            // 锡膏层
            case "F.Paste":
                return theme.board.f_paste.to_css()
            case "B.Paste":
                return theme.board.b_paste.to_css()

            // 边框层
            case "Edge.Cuts":
                return theme.board.edge_cuts.to_css()

            // 装配边界
            case "F.CrtYd":
                return theme.board.f_crtyd.to_css()
            case "B.CrtYd":
                return theme.board.b_crtyd.to_css()

            // 装配图
            case "F.Fab":
                return theme.board.f_fab.to_css()
            case "B.Fab":
                return theme.board.b_fab.to_css()

            default:
                return "rgb(255, 255, 255)" // 默认颜色
        }
    }

    setStrokeStyle(ctx: CanvasRenderingContext2D) {
        if (this.layer) {
            ctx.strokeStyle = this.getLayerColor(this.layer) || "black"
        } else {
            if (this.stroke) {
                ctx.strokeStyle =
                    this.stroke.color ||
                    theme.schematic.component_outline.to_css()
            } else {
                ctx.strokeStyle = theme.schematic.component_outline.to_css()
            }
        }
    }

    setFillStyle(ctx: CanvasRenderingContext2D) {
        if (this.layer) {
            ctx.fillStyle = this.getLayerColor(this.layer)
        } else {
            if (this.fill) {
                if (this.fill.color) {
                    ctx.fillStyle = this.fill.color
                } else if (this.fill.type) {
                    if (this.fill.type === "default") {
                        ctx.fillStyle = "transparent"
                    } else if (this.fill.type === "background") {
                        ctx.fillStyle = theme.schematic.component_body.to_css()
                    } else if (this.fill.type === "outline") {
                        ctx.fillStyle =
                            theme.schematic.component_outline.to_css()
                    }
                }
            } else {
                ctx.fillStyle = "transparent"
            }
        }
    }

    fillShape(ctx: CanvasRenderingContext2D) {
        if (!this.fill) return
        switch (this.fill.type) {
            case "none":
                ctx.stroke()
                break

            case "background":
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                break

            case "outline":
                ctx.closePath()
                ctx.fill()
                break
            case "default":
            case "solid":
                ctx.closePath()
                ctx.fill()
                break
        }
    }
}

export type KicadShape = Circle | Polyline | Arc | Rectangle
export type KicadShapeType = "circle" | "polyline" | "arc" | "rectangle"

export interface KicadShapeListMap {
    circles?: Circle[]
    polylines?: Polyline[]
    arcs?: Arc[]
    rectangles?: Rectangle[]
}

export class Circle extends Shape {
    center: Point
    radius: number
    stroke: Stroke
    type: KicadShapeType = "circle"
    fill: Fill
    layer?: Layer
    layers?: Layer[]
    width: number

    constructor(public circle: Circle) {
        super()
        this.center = circle.center
        this.radius = circle.radius
        this.stroke = circle.stroke
        this.fill = circle.fill
        this.width = circle.width
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2) // 使用 radius 变量
        ctx.lineWidth = this.stroke?.width || this.width || 0.125 // 使用 strokeWidth 变量

        this.setStrokeStyle(ctx)
        this.setFillStyle(ctx)

        this.fillShape(ctx)
        ctx.restore()
    }
}

export class FpCircle extends Shape {
    center: Point
    end: Point
    layer?: Layer
    width: number
    fill: Fill
    stroke: Stroke

    constructor(circle: any) {
        super()
        this.center = circle.center
        this.end = circle.end
        this.layer = circle.layer as Layer
        this.width = circle.width
        this.fill = circle.fill || { type: "none" }
        this.stroke = circle.stroke || { type: "default", width: 0 }
    }

    // 计算半径
    private getRadius(): number {
        return Math.sqrt(
            Math.pow(this.end.x - this.center.x, 2) +
                Math.pow(this.end.y - this.center.y, 2)
        )
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        // 设置样式
        ctx.lineWidth = this.stroke?.width || this.width || 0.125

        this.setStrokeStyle(ctx)
        this.setFillStyle(ctx)

        // 绘制圆
        ctx.beginPath()
        ctx.arc(this.center.x, this.center.y, this.getRadius(), 0, Math.PI * 2)

        this.fillShape(ctx)

        ctx.stroke()
        ctx.restore()
    }
}

export class Polyline extends Shape {
    pts: { xyList: Point[] }
    fill: Fill
    type: KicadShapeType = "polyline"
    stroke: Stroke
    layer?: Layer
    width: number

    constructor(public polyline: Polyline) {
        super()
        this.pts = polyline.pts
        this.fill = polyline.fill
        this.stroke = polyline.stroke
        this.layer = polyline.layer
        this.width = polyline.width
    }

    draw(ctx: CanvasRenderingContext2D) {
        console.log("this polyline", this.fill)
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(this.pts.xyList[0].x, this.pts.xyList[0].y) // 移动到第一个点
        for (let i = 1; i < this.pts.xyList.length; i++) {
            ctx.lineTo(this.pts.xyList[i].x, this.pts.xyList[i].y) // 连接到下一个点
        }

        ctx.lineWidth = this.stroke?.width || this.width || 0.12525
        this.setStrokeStyle(ctx)
        this.setFillStyle(ctx)
        this.fillShape(ctx)
        console.log("this polyline 填充后", ctx.fillStyle)
        console.log("this polyline 填充后", ctx.strokeStyle)
        ctx.restore()
    }
}

// 向量计算的辅助函数
function vec2_sub(v1: Point, v2: Point) {
    return { x: v1.x - v2.x, y: v1.y - v2.y }
}

function vec2_magnitude(v: Point) {
    return Math.sqrt(v.x * v.x + v.y * v.y)
}

function vec2_angle(v: Point) {
    return Math.atan2(v.y, v.x)
}

// 角度标准化到 [-PI, PI]
function normalize_angle(angle: number) {
    while (angle > Math.PI) angle -= 2 * Math.PI
    while (angle <= -Math.PI) angle += 2 * Math.PI
    return angle
}

// 计算三点圆心
function arc_center_from_three_points(p1: Point, p2: Point, p3: Point) {
    const offset = p2.x * p2.x + p2.y * p2.y
    const bc = (p1.x * p1.x + p1.y * p1.y - offset) / 2
    const cd = (offset - p3.x * p3.x - p3.y * p3.y) / 2
    const det = (p1.x - p2.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p2.y)

    const idet = 1 / det

    const centerX = (bc * (p2.y - p3.y) - cd * (p1.y - p2.y)) * idet
    const centerY = (cd * (p1.x - p2.x) - bc * (p2.x - p3.x)) * idet

    return { x: centerX, y: centerY }
}

export class Arc extends Shape {
    mid: Point
    fill: Fill
    start: Point
    end: Point
    stroke: Stroke
    type: KicadShapeType = "arc"
    width: number
    layer?: Layer

    constructor(public arc: Arc) {
        super()
        this.mid = arc.mid
        this.fill = arc.fill || { type: "none" }
        this.start = arc.start
        this.end = arc.end
        this.stroke = arc.stroke
        this.width = arc.width
        this.layer = arc.layer
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        // 使用放大因子提高精度
        const u = 1000000

        // 计算圆心
        const center = arc_center_from_three_points(
            { x: this.start.x * u, y: this.start.y * u },
            { x: this.mid.x * u, y: this.mid.y * u },
            { x: this.end.x * u, y: this.end.y * u }
        )

        // 还原实际坐标
        center.x /= u
        center.y /= u

        // 计算半径
        const radius = vec2_magnitude(vec2_sub(this.mid, center))

        // 计算角度
        const startRadial = vec2_sub(this.start, center)
        const midRadial = vec2_sub(this.mid, center)
        const endRadial = vec2_sub(this.end, center)

        const startAngle = vec2_angle(startRadial)
        const midAngle = vec2_angle(midRadial)
        let endAngle = vec2_angle(endRadial)

        // 计算弧度
        const angle1 = normalize_angle(midAngle - startAngle)
        const angle2 = normalize_angle(endAngle - midAngle)
        const arcAngle = angle1 + angle2

        endAngle = startAngle + arcAngle

        // 绘制圆弧
        ctx.beginPath()
        if (this.layer) {
            ctx.arc(center.x, center.y, radius, -startAngle, -endAngle, true)
        } else {
            ctx.arc(center.x, center.y, radius, startAngle, endAngle)
        }

        ctx.lineWidth = this.stroke?.width || this.width || 0.125
        this.setStrokeStyle(ctx)
        this.setFillStyle(ctx)
        this.fillShape(ctx)
        ctx.restore()
    }
}

export class Line extends Shape {
    start: Point
    end: Point
    width: number
    layer?: Layer
    stroke: Stroke
    fill: Fill

    constructor(public line: Line) {
        super()
        this.start = line.start
        this.end = line.end
        this.width = line.width
        this.layer = line.layer
        this.stroke = line.stroke
        this.fill = line.fill
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()

        // 设置线条样式
        ctx.lineWidth = this.stroke?.width || this.width || 0.125
        this.setStrokeStyle(ctx)

        // 开始绘制
        ctx.beginPath()
        ctx.moveTo(this.start.x, this.start.y)
        ctx.lineTo(this.end.x, this.end.y)
        ctx.stroke()

        ctx.restore()
    }
}

export class Rectangle extends Shape {
    fill: Fill
    start: Point
    end: Point
    stroke: Stroke
    type: KicadShapeType = "rectangle"
    width: number
    layer?: Layer

    constructor(public rectangle: Rectangle) {
        super()
        this.fill = rectangle.fill
        this.start = rectangle.start
        this.end = rectangle.end
        this.stroke = rectangle.stroke
        this.width = rectangle.width
        this.layer = rectangle.layer
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        console.log("this 矩形", this)
        ctx.beginPath()
        ctx.rect(
            this.start.x,
            this.start.y,
            this.end.x - this.start.x,
            this.end.y - this.start.y
        )
        ctx.lineWidth = this.stroke?.width || this.width || 0.125
        this.setStrokeStyle(ctx)
        this.setFillStyle(ctx)
        this.fillShape(ctx)
        ctx.restore()
    }
}
