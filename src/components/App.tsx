import React, { useEffect, useCallback, useReducer } from 'react'
import Canvas from './Canvas'
import ImageEditor from './ImageEdtior'

interface AspectRatio {
  width: number
  height: number
}

interface Color {
  r: number
  g: number
  b: number
}

interface State {
  image: File
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
  const [state, setState] = useReducer(
    (state: State, setState: Partial<State>) => ({ ...state, ...setState }),
    {
      image: null,
      processedImage: '',
      aspectRatio: { width: 0, height: 0 },
      borderThickness: 0,
      borderColor: { r: 0, g: 0, b: 0 },
    }
  )

  useEffect(() => {
    window.api.receive('image-processed', (processedImage: string) => {
      setState({ processedImage })
    })
  }, [])

  const onImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setState({ image: event.target.files[0] })
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

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const reader = new FileReader()
      const { aspectRatio, borderThickness, borderColor, image } = state
      if (aspectRatio.width > 0 && aspectRatio.height > 0) {
        reader.onload = (event) => {
          window.api.send('process-image', {
            image: event.target.result,
            aspectRatio,
            borderThickness,
            borderColor,
          })
        }
      } else {
        reader.onload = () => {
          setState({ processedImage: reader.result as string })
        }
      }
      if (image) {
        reader.readAsDataURL(image)
      }
    },
    [state]
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
              const rgb = hexToRgb(color)
              setState({ borderColor: rgb })
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
      {state.processedImage && (
        <div>
          <Canvas image={state.processedImage} />
        </div>
      )}

      {state.processedImage && (
        <div>
          <ImageEditor defaultImage={state.processedImage} />
        </div>
      )}
    </div>
  )
}

export default App
