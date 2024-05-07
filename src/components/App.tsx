import React, { useCallback, useReducer } from 'react'
import ImageEditor from './ImageEdtior'

interface AspectRatio {
  width: number
  height: number
}

interface Color {
  r: number
  g: number
  b: number
  a: number
}

interface State {
  image: string
  processedImage: string
  aspectRatio: AspectRatio
  borderThickness: number
  borderColor: Color
}

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return { r, g, b }
}

const App = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [state, setState] = useReducer(
    (state: State, setState: Partial<State>) => ({ ...state, ...setState }),
    {
      image: null,
      processedImage: '',
      aspectRatio: { width: 0, height: 0 },
      borderThickness: 0,
      borderColor: { r: 0, g: 0, b: 0, a: 1 },
    }
  )

  const onImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setState({ image: event.target.result as string })
      }
      reader.readAsDataURL(file)
    },
    []
  )

  const onAspectRatioWidthChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setState({
        aspectRatio: {
          ...state.aspectRatio,
          width: +event.target.value,
        },
      })
    },
    [state.aspectRatio.height]
  )

  const onAspectRatioHeightChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setState({
        aspectRatio: {
          ...state.aspectRatio,
          height: +event.target.value,
        },
      })
    },
    [state.aspectRatio.width]
  )

  const drawImageWithAspectRatio = useCallback(
    (img: HTMLImageElement) => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const { width: targetWidth, height: targetHeight } = state.aspectRatio

      const imageRatio = img.width / img.height
      let targetRatio
      if (targetHeight > 0 && targetWidth > 0) {
        targetRatio = targetWidth / targetHeight
      } else {
        targetRatio = imageRatio
      }
      let finalWidth, finalHeight

      if (imageRatio > targetRatio) {
        finalWidth = img.width
        finalHeight = img.width / targetRatio
      } else {
        finalWidth = img.height * targetRatio
        finalHeight = img.height
      }

      canvas.width = finalWidth + 2 * state.borderThickness
      canvas.height = finalHeight + 2 * state.borderThickness

      const xOffset = (finalWidth - img.width) / 2 + state.borderThickness
      const yOffset = (finalHeight - img.height) / 2 + state.borderThickness

      ctx.fillStyle = `rgba(${state.borderColor.r}, ${state.borderColor.g}, ${state.borderColor.b}, ${state.borderColor.a})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, xOffset, yOffset, img.width, img.height)
      setState({ processedImage: canvas.toDataURL() })
    },
    [canvasRef, state.aspectRatio, state.borderThickness, state.borderColor]
  )

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const img = new Image()
      img.onload = () => drawImageWithAspectRatio(img)
      img.src = state.image
    },
    [drawImageWithAspectRatio]
  )

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          <h2>Base Image:</h2>
          <input type="file" onChange={onImageChange} />
        </div>
        <div>
          <h2>Aspect ratio:</h2>
          <input
            min={0}
            type="number"
            name="width"
            value={state.aspectRatio.width}
            onChange={onAspectRatioWidthChange}
          />
          <span>:</span>
          <input
            min={0}
            type="number"
            name="height"
            value={state.aspectRatio.height}
            onChange={onAspectRatioHeightChange}
          />
        </div>
        <div>
          <h2>Border Color:</h2>
          <input
            type="color"
            name="borderColor"
            onChange={(e) => {
              const color = e.target.value
              const { r, g, b } = hexToRgb(color)
              setState({ borderColor: { ...state.borderColor, r, g, b } })
            }}
          />
          <label htmlFor="alpha" style={{ margin: '0 8px' }}>
            Alpha:
          </label>
          <input
            name="alpha"
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={state.borderColor.a}
            onChange={(e) => {
              setState({
                borderColor: { ...state.borderColor, a: +e.target.value },
              })
            }}
          />
        </div>
        <div>
          <h2>Border thickness:</h2>
          <input
            min={0}
            type="number"
            name="borderThickness"
            value={state.borderThickness}
            onChange={(e) => setState({ borderThickness: +e.target.value })}
          />
        </div>
        <br />
        <input type="submit" value="Process" />
      </form>
      <br />
      <canvas ref={canvasRef} />

      {state.processedImage && (
        <div>
          <ImageEditor defaultImage={state.processedImage} />
        </div>
      )}
    </div>
  )
}

export default App
