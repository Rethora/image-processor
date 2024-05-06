import { useRef, useEffect, useCallback, useMemo } from 'react'
// @ts-ignore
import painterro from 'painterro'

interface Props {
  defaultImage: any
}

const ImageEditor = ({ defaultImage }: Props) => {
  const editorContainerRef = useRef<HTMLDivElement>()
  const editor = useMemo(() => {
    return painterro({
      container: editorContainerRef.current,
      // @ts-ignore
      saveHandler: async (image, done) => {
        window.api.send('save-image', {
          arrayBuffer: await image.asBlob().arrayBuffer(),
          suggestedFileName: image.suggestedFileName(),
        })
        done()
      },
    })
  }, [])

  useEffect(() => {
    window.api.receive('image-saved', (savePath: string) => {
      console.log('Image saved to:', savePath)
    })
  }, [])

  const handleOpen = useCallback(() => {
    editor.show(defaultImage)
  }, [defaultImage])

  return (
    <div>
      <div ref={editorContainerRef} />
      <button onClick={handleOpen}>Open In Editor</button>
    </div>
  )
}

export default ImageEditor
