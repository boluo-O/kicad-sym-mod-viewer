import { createStore } from "zustand/vanilla"
import { KicadShape, KicadShapeListMap } from "./shape"
import { FootPointPad, SymbolPin } from "./element"
// const useStore = create((set) => ({
//     count: 0,
//     increment: () => set((state) => ({ count: state.count + 1 })),
// }))
const defaultCanvas = document.createElement("canvas") as HTMLCanvasElement
const defaultCanvasContext = defaultCanvas.getContext(
    "2d"
) as CanvasRenderingContext2D
export const kicadCanvasStore = createStore<{
    hightLightPinOrPadNumber: string
}>(() => ({
    hightLightPinOrPadNumber: "",
}))

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
    shapes: KicadShape[] = []

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
                console.log("点击")
            }
        })

        // 处理鼠标移动事件以平移
        this.canvas.addEventListener("mousemove", (event) => {
            if (this.isDragging) {
                // 更新偏移量
                this.offsetX = event.clientX - this.startX
                this.offsetY = event.clientY - this.startY
                this.draw() // 重新绘制
                console.log("拖拽")
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
        if (element.draw) {
            this.elements.push(element)
        }

        if (element.children && element.children.length > 0) {
            this.addElements(element.children)
        }

        if (element.pins && element.pins.length > 0) {
            this.addElements(element.pins)
        }

        if (element.pads && element.pads.length > 0) {
            this.addElements(element.pads)
        }

        if (element.shapes && element.shapes.length > 0) {
            this.shapes.push(...element.shapes)
        }

        if (element.bindEvent) {
            element.bindEvent(this.ctx, this)
        }
    }

    addElements(elements: any[]) {
        for (const e of elements) {
            this.addElement(e)
        }
    }

    autoFit() {
        const paddingX = 10
        const paddingY = 40
        const bounds = this.calculateBounds()
        if (!bounds) return

        // 计算画布实际可用尺寸（考虑设备像素比）
        const ratio = window.devicePixelRatio * 1.5
        const canvasWidth = this.canvas.width / ratio
        const canvasHeight = this.canvas.height / ratio

        // 计算缩放比例
        const scaleX = (canvasWidth - paddingX * 2) / bounds.width
        const scaleY = (canvasHeight - paddingY * 2) / bounds.height
        this.scale = Math.min(scaleX, scaleY)

        // 计算居中偏移
        this.offsetX =
            (canvasWidth - bounds.width * this.scale) / 2 -
            bounds.minX * this.scale
        this.offsetY =
            (canvasHeight - bounds.height * this.scale) / 2 -
            bounds.minY * this.scale

        this.draw()
    }

    private calculateBounds(): {
        minX: number
        minY: number
        maxX: number
        maxY: number
        width: number
        height: number
    } | null {
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity

        // 遍历所有元素
        for (const element of this.elements) {
            if (element instanceof SymbolPin) {
                // 计算引脚线段的终点
                const angle = ((element.at.rotate + 90) * Math.PI) / 180
                const endX = element.at.x + Math.cos(angle) * element.length
                const endY = element.at.y + Math.sin(angle) * element.length

                // 更新边界
                minX = Math.min(minX, element.at.x, endX)
                minY = Math.min(minY, element.at.y, endY)
                maxX = Math.max(maxX, element.at.x, endX)
                maxY = Math.max(maxY, element.at.y, endY)
            } else if (element instanceof FootPointPad) {
                // 考虑焊盘位置和尺寸
                const halfWidth = element.size.width / 2
                const halfHeight = element.size.height / 2

                // 如果有旋转，计算旋转后的边界
                if (element.at.angle) {
                    const angle = (element.at.angle * Math.PI) / 180
                    const cos = Math.abs(Math.cos(angle))
                    const sin = Math.abs(Math.sin(angle))

                    // 计算旋转后的宽高
                    const rotatedWidth = halfWidth * cos + halfHeight * sin
                    const rotatedHeight = halfWidth * sin + halfHeight * cos

                    minX = Math.min(minX, element.at.x - rotatedWidth)
                    minY = Math.min(minY, element.at.y - rotatedHeight)
                    maxX = Math.max(maxX, element.at.x + rotatedWidth)
                    maxY = Math.max(maxY, element.at.y + rotatedHeight)
                } else {
                    // 无旋转时直接计算
                    minX = Math.min(minX, element.at.x - halfWidth)
                    minY = Math.min(minY, element.at.y - halfHeight)
                    maxX = Math.max(maxX, element.at.x + halfWidth)
                    maxY = Math.max(maxY, element.at.y + halfHeight)
                }
            }
        }

        // 检查是否找到了有效的边界
        if (
            minX === Infinity ||
            minY === Infinity ||
            maxX === -Infinity ||
            maxY === -Infinity
        ) {
            return null
        }

        return {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY,
        }
    }

    firstDraw() {
        this.autoFit()
        // this.draw()
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) // 清空画布
        this.ctx.save() // 保存当前状态
        this.ctx.translate(this.offsetX, this.offsetY) // 应用平移
        this.ctx.scale(this.scale, this.scale) // 应用缩放

        // 第一阶段：先绘制 rectangle 和 arc
        for (const shape of this.shapes) {
            if (shape.type === "rectangle") {
                shape.draw(this.ctx)
            }
        }

        // 第二阶段：绘制其他类型的 shapes
        for (const shape of this.shapes) {
            if (shape.type !== "rectangle") {
                shape.draw(this.ctx)
            }
        }

        for (const e of this.elements) {
            e.draw(this.ctx, this)
        }

        this.ctx.restore() // 恢复到之前的状态
    }
}
