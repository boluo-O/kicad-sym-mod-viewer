export abstract class KicadCanvasElement {}

export interface Size {
    width: number
    height: number
}

// 定义字体大小的常量
export const MIN_FONT_SIZE = 0.4 // 最小字体大小（mm）
export const MAX_FONT_SIZE = 2.0 // 最大字体大小（mm）
