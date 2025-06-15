export const addWatermark = async (
    dataURL: string,
    canvasWidth: number,
    canvasHeight: number,
    format: "png" | "jpg",
): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.crossOrigin = "anonymous"
        img.onload = () => {
            canvas.width = canvasWidth
            canvas.height = canvasHeight

            // Draw the original image
            ctx!.drawImage(img, 0, 0, canvasWidth, canvasHeight)

            // Set watermark style
            ctx!.save()
            ctx!.globalAlpha = 0.2
            ctx!.fillStyle = format === "png" ? "#C4C4C4" : "#C4C4C4"
            ctx!.font = `${Math.max(20, Math.min(canvasWidth, canvasHeight) * 0.05)}px Arial` // Responsive font size
            ctx!.textAlign = "center"
            ctx!.textBaseline = "middle"

            // Rotate canvas for 45-degree angle
            ctx!.translate(canvasWidth / 2, canvasHeight / 2)
            ctx!.rotate(-Math.PI / 4) // -45 degrees

            // Calculate spacing and repetition
            const text = "Flowy"
            const textMetrics = ctx!.measureText(text)
            const textWidth = textMetrics.width
            const textHeight = Number.parseInt(ctx!.font)

            // Spacing between watermarks
            const spacingX = textWidth + 150
            const spacingY = textHeight + 150

            // Calculate how many repetitions we need to cover the rotated canvas
            const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight)
            const repetitionsX = Math.ceil(diagonal / spacingX) + 2
            const repetitionsY = Math.ceil(diagonal / spacingY) + 2

            // Draw watermarks in a grid pattern
            for (let i = -repetitionsX; i <= repetitionsX; i++) {
                for (let j = -repetitionsY; j <= repetitionsY; j++) {
                    const x = i * spacingX
                    const y = j * spacingY
                    ctx!.fillText(text, x, y)
                }
            }

            ctx!.restore()

            // Return the watermarked image as data URL
            resolve(canvas.toDataURL("image/png", 1))
        }

        img.src = dataURL
    })
} 