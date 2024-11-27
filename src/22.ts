class KiCadSymbolParser {
    constructor() {
        this.symbols = []
    }

    // 解析KiCad符号文件内容
    parseContent(content) {
        const lines = content.split("\n")
        let currentSymbol = null
        let depth = 0

        for (let line of lines) {
            line = line.trim()

            // 计算括号深度
            const openCount = (line.match(/\(/g) || []).length
            const closeCount = (line.match(/\)/g) || []).length

            if (line.startsWith("(symbol")) {
                currentSymbol = {
                    name: this.extractSymbolName(line),
                    properties: {},
                    shapes: [],
                }
                this.symbols.push(currentSymbol)
            }

            // 解析图形元素
            if (
                currentSymbol &&
                (line.startsWith("(polyline") ||
                    line.startsWith("(rectangle") ||
                    line.startsWith("(circle") ||
                    line.startsWith("(arc"))
            ) {
                const shape = this.parseShape(line)
                if (shape) {
                    currentSymbol.shapes.push(shape)
                }
            }

            depth += openCount - closeCount
        }

        return this.symbols
    }

    // 提取符号名称
    extractSymbolName(line) {
        const match = line.match(/"([^"]+)"/)
        return match ? match[1] : ""
    }

    // 解析图形元素
    parseShape(line) {
        console.log("line", line)
        const coords = line.match(/-?\d+(\.\d+)?/g)
        if (!coords) return null

        if (line.startsWith("(polyline")) {
            return {
                type: "polyline",
                points: this.parsePoints(coords),
            }
        } else if (line.startsWith("(rectangle")) {
            return {
                type: "rectangle",
                start: { x: parseFloat(coords[0]), y: parseFloat(coords[1]) },
                end: { x: parseFloat(coords[2]), y: parseFloat(coords[3]) },
            }
        } else if (line.startsWith("(circle")) {
            return {
                type: "circle",
                center: { x: parseFloat(coords[0]), y: parseFloat(coords[1]) },
                radius: parseFloat(coords[2]),
            }
        }
        return null
    }

    // 解析点坐标
    parsePoints(coords) {
        const points = []
        for (let i = 0; i < coords.length; i += 2) {
            points.push({
                x: parseFloat(coords[i]),
                y: parseFloat(coords[i + 1]),
            })
        }
        return points
    }
}

// KiCad符号渲染器类
class KiCadSymbolRenderer {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.scale = 1
        this.offsetX = canvas.width / 2
        this.offsetY = canvas.height / 2
    }

    // 清除画布
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    // 设置缩放比例
    setScale(scale) {
        this.scale = scale
    }

    // 渲染符号
    renderSymbol(symbol) {
        this.ctx.save()
        this.ctx.translate(this.offsetX, this.offsetY)
        this.ctx.scale(this.scale, -this.scale) // Y轴反转以匹配KiCad坐标系

        for (const shape of symbol.shapes) {
            switch (shape.type) {
                case "polyline":
                    this.drawPolyline(shape.points)
                    break
                case "rectangle":
                    this.drawRectangle(shape.start, shape.end)
                    break
                case "circle":
                    this.drawCircle(shape.center, shape.radius)
                    break
            }
        }

        this.ctx.restore()
    }

    // 绘制折线
    drawPolyline(points) {
        if (points.length < 2) return

        this.ctx.beginPath()
        this.ctx.moveTo(points[0].x, points[0].y)

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y)
        }

        this.ctx.strokeStyle = "black"
        this.ctx.lineWidth = 1 / this.scale
        this.ctx.stroke()
    }

    // 绘制矩形
    drawRectangle(start, end) {
        this.ctx.beginPath()
        this.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y)
        this.ctx.strokeStyle = "black"
        this.ctx.lineWidth = 1 / this.scale
        this.ctx.stroke()
    }

    // 绘制圆形
    drawCircle(center, radius) {
        this.ctx.beginPath()
        this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
        this.ctx.strokeStyle = "black"
        this.ctx.lineWidth = 1 / this.scale
        this.ctx.stroke()
    }
}
