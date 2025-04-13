
import { useEffect, useRef } from 'react'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    async function init() {
      const vision = await import('@mediapipe/tasks-vision')
      const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
      )

      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO'
      })

      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          detect()
        }
      }

      const ctx = canvasRef.current.getContext('2d')
      const drawingUtils = new DrawingUtils(ctx)

      const detect = () => {
        if (!videoRef.current) return
        ctx.drawImage(videoRef.current, 0, 0, 640, 480)
        const results = faceLandmarker.detectForVideo(videoRef.current, performance.now())
        if (results.faceLandmarks.length > 0) {
          drawingUtils.drawConnectors(
            results.faceLandmarks[0],
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: '#0f0' }
          )
        }
        requestAnimationFrame(detect)
      }
    }

    init()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Palsy Facial Tracker</h1>
      <video ref={videoRef} width="640" height="480" autoPlay muted playsInline />
      <canvas ref={canvasRef} width="640" height="480" style={{ position: 'absolute', top: 0 }} />
    </div>
  )
}

export default App
