import { useCallback, useEffect, useRef } from 'react'

interface Props {
  image: string
}

const Canvas = ({ image }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = image
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [image])

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.href = canvas.toDataURL()
    link.download = `image_${canvas.width}_${canvas.height}`
    link.click()
  }, [])

  return (
    <div>
      <canvas ref={canvasRef} />
      <button onClick={downloadImage}>Save Processed Image</button>
    </div>
  )
}

export default Canvas
