export interface Point {
    x: number
    y: number
}

export interface Fill {
    type: "none" | "outline" | "background" | "solid"
    color?: string // 例如: "#FFFFFF"
    opacity?: number // 0-1 之间的值
}

export interface Stroke {
    type: "default" | "dash" | "dot" | "dashdot" | "solid"
    width: number // 线宽
    color?: string // 例如: "#000000"
    opacity?: number // 0-1 之间的值
}

abstract class Shape {
    abstract draw(ctx: CanvasRenderingContext2D): void
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

    constructor(public circle: Circle) {
        super()
        this.center = circle.center
        this.radius = circle.radius
        this.stroke = circle.stroke
        this.fill = circle.fill
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2) // 使用 radius 变量
        ctx.lineWidth = this.stroke.width // 使用 strokeWidth 变量
        // ctx.strokeStyle = stroke.type // 设置边框颜色
        ctx.strokeStyle = "black" // 设置边框颜色
        ctx.stroke() // 绘制边框
        // ctx.fillStyle = fill.type // 设置填充颜色
        ctx.fillStyle = "transparent" // 设置填充颜色
        ctx.fill() // 填充圆
    }
}

export class Polyline extends Shape {
    pts: { xyList: Point[] }
    fill: Fill
    type: KicadShapeType = "polyline"
    stroke: Stroke

    constructor(public polyline: Polyline) {
        super()
        this.pts = polyline.pts
        this.fill = polyline.fill
        this.stroke = polyline.stroke
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.moveTo(this.pts.xyList[0].x, this.pts.xyList[0].y) // 移动到第一个点

        for (let i = 1; i < this.pts.xyList.length; i++) {
            ctx.lineTo(this.pts.xyList[i].x, this.pts.xyList[i].y) // 连接到下一个点
        }

        ctx.lineWidth = this.stroke.width
        ctx.strokeStyle = "black" // 线条颜色
        ctx.stroke() // 绘制线条

        if (this.fill.type === "outline") {
            ctx.closePath()
            ctx.fillStyle = "none" // 填充类型为无
            ctx.fill() // 填充
        }
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

    constructor(public arc: Arc) {
        super()
        this.mid = arc.mid
        this.fill = arc.fill
        this.start = arc.start
        this.end = arc.end
        this.stroke = arc.stroke
    }

    draw(ctx: CanvasRenderingContext2D) {
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
        ctx.arc(center.x, center.y, radius, startAngle, endAngle)
        ctx.lineWidth = this.stroke.width
        ctx.strokeStyle = "black"
        ctx.stroke()
    }
}

export class Line {
    start: Point
    end: Point
    width: number

    constructor(public line: Line) {
        this.start = line.start
        this.end = line.end
        this.width = line.width
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()

        // 设置线条样式
        ctx.lineWidth = this.width
        ctx.strokeStyle = "black"
        // ctx.strokeStyle = this.getLayerColor()  // 根据层设置颜色

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
    constructor(public rectangle: Rectangle) {
        super()
        this.fill = rectangle.fill
        this.start = rectangle.start
        this.end = rectangle.end
        this.stroke = rectangle.stroke
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.rect(
            this.start.x,
            this.start.y,
            this.end.x - this.start.x,
            this.end.y - this.start.y
        )
        ctx.lineWidth = this.stroke.width
        ctx.strokeStyle = "black"
        ctx.stroke()
        ctx.fillStyle = "green"
        ctx.fill() // 填充内部
    }
}