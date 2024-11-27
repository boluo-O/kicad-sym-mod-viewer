const defaultCanvas = document.createElement("canvas") as HTMLCanvasElement
const defaultCanvasContext = defaultCanvas.getContext(
    "2d"
) as CanvasRenderingContext2D

class KicadSymbol {
    name: string
    pins: { x: number; y: number; name: string; number: string }[]

    draw(ctx: CanvasRenderingContext2D) {
        // 绘制符号
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
    hoveredPin: { x: number; y: number; name: string; number: string } | null =
        null

    constructor({ width = 500, height = 300 }) {
        this.initCanvas({ width, height })
    }

    initCanvas({ width = 500, height = 300 }) {
        // 创建 Canvas 元素
        const canvas = document.createElement("canvas")
        document.body.appendChild(canvas)
        // 画布设置
        const ratio = window.devicePixelRatio || 1
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

            // 打印鼠标在 Canvas 坐标系中的位置
            // console.log(
            //     `鼠标位置: x=${mouseX.toFixed(2)}, y=${mouseY.toFixed(2)}`
            // )
        })
        // 添加鼠标移动检测引脚
        this.canvas.addEventListener("mousemove", (event) => {
            const rect = this.canvas.getBoundingClientRect()
            const mouseX =
                (event.clientX - rect.left - this.offsetX) / this.scale
            const mouseY =
                (event.clientY - rect.top - this.offsetY) / this.scale

            // 检查是否悬停在引脚上
            const pins = [
                { x: 2.54, y: 5.08, name: "D", number: "1" },
                { x: 2.54, y: -5.08, name: "S", number: "2" },
                { x: -5.08, y: 0, name: "G", number: "3" },
            ]

            this.hoveredPin = null
            for (const pin of pins) {
                const distance = Math.sqrt(
                    Math.pow(mouseX - pin.x, 2) + Math.pow(mouseY - pin.y, 2)
                )

                // console.log("distance", distance)
                if (distance < 1) {
                    this.hoveredPin = pin
                    break
                }
            }
            this.draw()
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

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) // 清空画布
        this.ctx.save() // 保存当前状态
        this.ctx.translate(this.offsetX, this.offsetY) // 应用平移
        this.ctx.scale(this.scale, this.scale) // 应用缩放
        // console.log("this.scale", this.scale)
        // console.log("this.offsetX", this.offsetX)
        // console.log("this.offsetY", this.offsetY)
        // this.ctx.fillStyle = "blue" // 设置填充颜色
        // this.ctx.font = "30px Arial" // 设置字体和大小
        // this.ctx.textBaseline = "middle" // 设置文本基线
        // this.ctx.textAlign = "center" // 设置文本对齐方式
        // this.ctx.fillText("11111111111111111", 0, 0) // 绘制文本

        const centerX = 1.27 * 1 // 将坐标放大以适应 canvas
        const centerY = 0 // y 坐标为 200
        const radius = 2.8194 * 1 // 将半径放大以适应 canvas
        const strokeWidth = 0.254 * 1 // 将边框宽度放大以适应 canvas

        // 绘制圆
        this.ctx.beginPath()
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2) // 绘制圆
        this.ctx.lineWidth = strokeWidth // 设置边框宽度
        this.ctx.strokeStyle = "black" // 设置边框颜色
        this.ctx.stroke() // 绘制边框
        this.ctx.fillStyle = "transparent" // 设置填充颜色为透明
        this.ctx.fill() // 填充圆（无填充效果）

        // 多边形
        const drawPolyline = (
            ctx: CanvasRenderingContext2D,
            points: number[][],
            strokeWidth: number,
            fillType: string
        ) => {
            ctx.beginPath()
            ctx.moveTo(points[0][0], points[0][1]) // 移动到第一个点

            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]) // 连接到下一个点
            }

            ctx.lineWidth = strokeWidth
            ctx.strokeStyle = "black" // 线条颜色
            ctx.stroke() // 绘制线条

            if (fillType === "outline") {
                ctx.closePath()
                ctx.fillStyle = "none" // 填充类型为无
                ctx.fill() // 填充
            }
        }

        // 定义 polyline 的点
        const polylines = [
            [
                [0.254, 0],
                [-2.54, 0],
            ],
            [
                [0.254, 1.905],
                [0.254, -1.905],
            ],
            [
                [2.54, -2.54],
                [2.54, -1.397],
                [0.254, -1.397],
            ],
            [
                [2.54, 2.54],
                [2.54, 1.397],
                [0.254, 1.397],
            ],
            [
                [0, 0],
                [-1.016, 0.381],
                [-1.016, -0.381],
                [0, 0],
            ],
        ]

        // 绘制所有的 polylines
        polylines.forEach((points, index) => {
            const strokeWidth = index === 4 ? 0 : 0.254 // 最后一个 polyline 的宽度为 0
            const fillType = index === 4 ? "outline" : "none" // 最后一个 polyline 为 outline
            drawPolyline(this.ctx, points, strokeWidth, fillType)
        })
        // 设置字体和线宽
        const fontSize = 1.27 // 字体大小，保持原始值
        const lineWidth = 0.254 // 线宽，保持原始值
        // 绘制引脚的函数
        const drawPin = (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            angle: number,
            length: number,
            name: string,
            number: string
        ) => {
            ctx.save()

            if (
                this.hoveredPin &&
                this.hoveredPin.x === x &&
                this.hoveredPin.y === y
            ) {
                ctx.strokeStyle = "red"
                ctx.fillStyle = "red"
                // 显示引脚信息
                console.log(`引脚信息: ${name} (${number})`)
            } else {
                ctx.strokeStyle = "black"
                ctx.fillStyle = "black"
            }
            ctx.beginPath()
            ctx.arc(x, y, 0.254, 0, Math.PI * 2)
            ctx.fill()

            ctx.translate(x, y)
            ctx.rotate(((angle + 90) * Math.PI) / 180) // 旋转角度
            ctx.beginPath()
            ctx.moveTo(0, 0)
            // ctx.strokeStyle = "black"
            ctx.lineTo(0, -length) // 绘制引脚
            ctx.lineWidth = lineWidth // 设置线宽
            ctx.stroke()

            // ctx.arc(0, 0, 0.254, 0, Math.PI * 2) // Circle at midpoint with radius 0.254 units
            ctx.fill()
            // 绘制引脚名称和编号
            // ctx.fillStyle = "black"
            ctx.font = `${fontSize}px Arial` // 设置字体大小
            ctx.fillText(name, 0, -length + fontSize) // 名称
            ctx.fillText(number, 0, -length + fontSize * 2) // 编号
            ctx.restore()
        }
        drawPin(this.ctx, 2.54, 5.08, 270, 2.54, "D", "1") // 引脚 D
        drawPin(this.ctx, 2.54, -5.08, 90, 2.54, "S", "2") // 引脚 S
        drawPin(this.ctx, -5.08, 0, 0, 2.54, "G", "3") // 引脚 G

        this.ctx.restore() // 恢复到之前的状态
    }
}
