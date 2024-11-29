// import { create } from "zustand"
// const useStore = create((set) => ({
//     count: 0,
//     increment: () => set((state) => ({ count: state.count + 1 })),
// }))
const defaultCanvas = document.createElement("canvas") as HTMLCanvasElement
const defaultCanvasContext = defaultCanvas.getContext(
    "2d"
) as CanvasRenderingContext2D

interface Circle {
    center: { x: number; y: number }
    fill: { type: "none" }
    radius: number
    stroke: { width: number; type: "default" }
}

interface Polyline {
    pts: { xyList: { x: number; y: number }[] }
    fill: { type: "none" | "solid" | "outline" }
    stroke: { width: number; type: "default" }
}

interface Rectangle {
    fill: { type: "none" }
    start: { x: number; y: number }
    end: { x: number; y: number }
    stroke: { width: number; type: "default" }
}

const drawCircle = (
    ctx: CanvasRenderingContext2D,
    { center, fill, radius, stroke }: Circle
) => {
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2) // 使用 radius 变量
    ctx.lineWidth = stroke.width // 使用 strokeWidth 变量
    // ctx.strokeStyle = stroke.type // 设置边框颜色
    ctx.strokeStyle = "black" // 设置边框颜色
    ctx.stroke() // 绘制边框
    // ctx.fillStyle = fill.type // 设置填充颜色
    ctx.fillStyle = "transparent" // 设置填充颜色
    ctx.fill() // 填充圆
}

const drawPolyline = (
    ctx: CanvasRenderingContext2D,
    { pts, fill, stroke }: Polyline
) => {
    ctx.beginPath()
    ctx.moveTo(pts.xyList[0].x, pts.xyList[0].y) // 移动到第一个点

    for (let i = 1; i < pts.xyList.length; i++) {
        ctx.lineTo(pts.xyList[i].x, pts.xyList[i].y) // 连接到下一个点
    }

    ctx.lineWidth = stroke.width
    ctx.strokeStyle = "black" // 线条颜色
    ctx.stroke() // 绘制线条

    if (fill.type === "outline") {
        ctx.closePath()
        ctx.fillStyle = "none" // 填充类型为无
        ctx.fill() // 填充
    }
}

interface Arc {
    mid: { x: number; y: number }
    fill: { type: "none" }
    start: { x: number; y: number }
    end: { x: number; y: number }
    stroke: { width: number; type: "default" }
}

// 向量计算的辅助函数
function vec2_sub(v1: { x: number; y: number }, v2: { x: number; y: number }) {
    return { x: v1.x - v2.x, y: v1.y - v2.y }
}

function vec2_magnitude(v: { x: number; y: number }) {
    return Math.sqrt(v.x * v.x + v.y * v.y)
}

function vec2_angle(v: { x: number; y: number }) {
    return Math.atan2(v.y, v.x)
}

// 角度标准化到 [-PI, PI]
function normalize_angle(angle: number) {
    while (angle > Math.PI) angle -= 2 * Math.PI
    while (angle <= -Math.PI) angle += 2 * Math.PI
    return angle
}

// 计算三点圆心
function arc_center_from_three_points(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number }
) {
    const offset = p2.x * p2.x + p2.y * p2.y
    const bc = (p1.x * p1.x + p1.y * p1.y - offset) / 2
    const cd = (offset - p3.x * p3.x - p3.y * p3.y) / 2
    const det = (p1.x - p2.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p2.y)

    const idet = 1 / det

    const centerX = (bc * (p2.y - p3.y) - cd * (p1.y - p2.y)) * idet
    const centerY = (cd * (p1.x - p2.x) - bc * (p2.x - p3.x)) * idet

    return { x: centerX, y: centerY }
}
const drawArc = (
    ctx: CanvasRenderingContext2D,
    { fill, start, end, mid, stroke }: Arc
) => {
    // 使用放大因子提高精度
    const u = 1000000

    // 计算圆心
    const center = arc_center_from_three_points(
        { x: start.x * u, y: start.y * u },
        { x: mid.x * u, y: mid.y * u },
        { x: end.x * u, y: end.y * u }
    )

    // 还原实际坐标
    center.x /= u
    center.y /= u

    // 计算半径
    const radius = vec2_magnitude(vec2_sub(mid, center))

    // 计算角度
    const startRadial = vec2_sub(start, center)
    const midRadial = vec2_sub(mid, center)
    const endRadial = vec2_sub(end, center)

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
    ctx.lineWidth = stroke.width
    ctx.strokeStyle = "black"
    ctx.stroke()
}

const drawRectangle = (
    ctx: CanvasRenderingContext2D,
    { fill, start, end, stroke }: Rectangle
) => {
    ctx.beginPath()
    ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y)
    ctx.lineWidth = stroke.width
    ctx.strokeStyle = "black"
    ctx.stroke()
    ctx.fillStyle = "#423e55cc"
    ctx.fill() // 填充内部
}

class SymbolPin {
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
                    console.log(
                        `引脚信息: ${this.name.text} (${this.number.text})`
                    )
                }
            }
        })
    }

    draw(ctx) {
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

        ctx.rotate(0)
        ctx.font = `${this.name.effects.font.size}px Arial` // 设置字体大小
        ctx.fillText(
            this.name.text,
            0,
            -this.length + this.name.effects.font.size
        ) // 名称
        ctx.fillText(
            this.number.text,
            0,
            -this.length + this.name.effects.font.size * 2
        ) // 编号
        ctx.restore()
    }
}

let count = 0
export class KicadSymbol {
    name: string
    symbols: KicadSymbol[]
    circles: Circle[]
    polylines: Polyline[]
    rectangles: Rectangle[]
    pins: SymbolPin[]
    elements: any[] = []
    arcs: Arc[]

    constructor(symbol, kCanvas: KicadCanvas) {
        this.name = symbol.name
        this.symbols = symbol.symbols || []
        this.circles = symbol.circles || []
        this.polylines = symbol.polylines || []
        this.pins = symbol.pins || []
        this.rectangles = symbol.rectangles || []
        this.arcs = symbol.arcs || []

        for (const pin of this.pins) {
            const _pin = new SymbolPin(pin)
            kCanvas.addElement(_pin)
        }
        for (const symbol of this.symbols) {
            const _symbol = new KicadSymbol(symbol, kCanvas)
            // _symbol.draw(ctx)
            kCanvas.addElement(_symbol)
        }
    }

    public draw(ctx: CanvasRenderingContext2D, kCanvas: KicadCanvas) {
        // 绘制符号

        for (const rectangle of this.rectangles) {
            drawRectangle(ctx, rectangle)
        }
        for (const circle of this.circles) {
            drawCircle(ctx, circle)
        }
        for (const arc of this.arcs) {
            drawArc(ctx, arc)
        }

        for (const polyline of this.polylines) {
            drawPolyline(ctx, polyline)
        }
    }
}

export class KicadCanvas {
    // scale = 1
    scale = 7
    // offsetX = 0
    // offsetY = 0
    offsetX = 200
    offsetY = 173
    isDragging = false
    startX = 0
    startY = 0
    canvas = defaultCanvas
    ctx = defaultCanvasContext

    elements: any[] = []

    constructor({ width = 500, height = 300 }) {
        this.initCanvas({ width, height })
    }

    initCanvas({ width = 500, height = 300 }) {
        // 创建 Canvas 元素
        const canvas = document.createElement("canvas")
        document.body.appendChild(canvas)
        // 画布设置
        const ratio = window.devicePixelRatio * 1.5 || 1
        canvas.width = width * ratio // 实际渲染像素
        canvas.height = height * ratio // 实际渲染像素
        canvas.style.width = `${width}px` // 控制显示大小
        canvas.style.height = `${height}px` // 控制显示大小

        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        ctx.scale(ratio, ratio) // 缩放上下文以适应高分辨率
        this.canvas = canvas
        this.ctx = ctx
        this.bindCanvasControl()

        this.draw()
    }

    bindCanvasControl() {
        // 处理鼠标按下事件以开始平移
        this.canvas.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                // 左键
                this.isDragging = true
                this.startX = event.clientX - this.offsetX
                this.startY = event.clientY - this.offsetY
            }
        })

        // 处理鼠标移动事件以平移
        this.canvas.addEventListener("mousemove", (event) => {
            if (this.isDragging) {
                // 更新偏移量
                this.offsetX = event.clientX - this.startX
                this.offsetY = event.clientY - this.startY
                this.draw() // 重新绘制
            }
            const rect = this.canvas.getBoundingClientRect()

            const mouseX =
                (event.clientX - rect.left - this.offsetX) / this.scale
            const mouseY =
                (event.clientY - rect.top - this.offsetY) / this.scale
        })

        // 处理鼠标抬起事件以结束平移
        this.canvas.addEventListener("mouseup", () => {
            // 结束拖动
            this.isDragging = false
        })

        // 处理鼠标离开事件以结束平移
        this.canvas.addEventListener("mouseleave", () => {
            this.isDragging = false // 结束拖动
        })

        // 处理鼠标滚轮事件以缩放
        this.canvas.addEventListener("wheel", (event) => {
            event.preventDefault() // 阻止默认滚动行为
            const mouseX =
                event.clientX - this.canvas.getBoundingClientRect().left // 获取鼠标相对于 Canvas 的 X 坐标
            const mouseY =
                event.clientY - this.canvas.getBoundingClientRect().top // 获取鼠标相对于 Canvas 的 Y 坐标

            const zoom = event.deltaY > 0 ? 0.9 : 1.1 // 确定缩放因子
            const newScale = this.scale * zoom // 计算新的缩放比例
            this.scale = newScale

            // 计算缩放前后的偏移量差异
            const dx = (mouseX - this.offsetX) * (zoom - 1)
            const dy = (mouseY - this.offsetY) * (zoom - 1)

            // 更新偏移量和缩放比例
            this.offsetX -= dx
            this.offsetY -= dy
            // 更新缩放比例
            this.draw() // 重新绘制
        })
    }

    addElement(element: any) {
        this.elements.push(element)

        if (element.bindEvent) {
            element.bindEvent(this.ctx, this)
        }
    }
    addElements(elements: any[]) {
        for (const e of elements) {
            this.addElement(e)
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) // 清空画布
        this.ctx.save() // 保存当前状态
        this.ctx.translate(this.offsetX, this.offsetY) // 应用平移
        this.ctx.scale(this.scale, this.scale) // 应用缩放

        for (const e of this.elements) {
            e.draw(this.ctx, this)
        }
        this.ctx.restore() // 恢复到之前的状态
    }
}
