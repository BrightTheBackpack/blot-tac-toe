import { getStore } from '../lib/state.js'
import { createListener } from '../lib/createListener.js'
import styles from './Editor.module.css'
import CompatWarning from './CompatWarning.js'
import Preview from './Preview.js'
import Toolbar from './Toolbar.js'
import Error from './Error.js'
import Console from './Console.js'
import GlobalStateDebugger from './GlobalStateDebugger.js'
import DropBox from './DropBox.js'
import CodeMirror from './CodeMirror.js'
import { useEffect, useRef, useState } from 'preact/hooks'
import Help from './Help.js'
import preview from '@astrojs/node/preview.js'
import { addMachineControl } from '../lib/events/addMachineControl.js'
export default function Editor() {
  // addMachineControl()
  const [width, setWidth] = useState(50)
  const [tab, setTab] = useState('workshop')

  const { theme } = getStore()

  const INIT_HELP_HEIGHT = 40

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const boardRef = useRef("test")
  const boardimageRef = useRef(null)
  const [helpHeight, setHelpHeight] = useState(INIT_HELP_HEIGHT)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    //const board = boardRef.current
    const ctx = canvas.getContext('2d')
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      if (video) {
        video.srcObject = stream
        video.play()
      }
    })
    .catch(err => {
      console.error('Error accessing webcam: ', err)
    })
  

    const processFrame = () => {
      
      if (video && ctx) {
      
        // Draw the current video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get the image data from the canvas and process it
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL()
        boardRef.current = "proccessing frame"
        console.log(base64)
        const xhr = new XMLHttpRequest();
        const url = "https://997a-34-29-220-193.ngrok-free.app/";
        
        // Open a connection to the server
        xhr.open("POST", url, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        
        // Define a callback function to handle the response
        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              
              const response = JSON.parse(xhr.responseText);
              console.log("Response:", response[0]);
              boardRef.current = response[0]
              boardimageRef.current = response[1]
              
              
   
            } else {
              console.error("Error:", xhr.statusText);
            }
          }
        };
        
        // Prepare the data to be sent
        const base64Image = base64
        const data = JSON.stringify({ base64: base64Image });
        
        // Send the request with the base64 data
        xhr.send(data);


        // Process the image data (e.g., apply filters, analyze it, etc.)
        console.log('Processing frame...')
      }
    }
    const intervalId = setInterval(processFrame, 1000)


    return () => {
      clearInterval(intervalId)
      if (video && video.srcObject) {
        const stream = video.srcObject
        const tracks = stream.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
    addEditorResizing(setWidth, theme)
    addHelpResizing(setHelpHeight, editorContainer, theme)
  }, [])

  const closeHelpPane = () => {
    const closed = helpHeight <= 0

    let count = 0
    const intervalId = setInterval(() => {
      setHelpHeight(helpHeight + count)

      if (helpHeight + count >= INIT_HELP_HEIGHT && closed) {
        clearInterval(intervalId)
      }

      if (helpHeight + count <= 0 && !closed) {
        setHelpHeight(0)
        clearInterval(intervalId)
      }

      count += closed ? 1 : -1
    }, 5)
  }

  const editorContainer = useRef(null)

  return (
    <>
      <GlobalStateDebugger />
      <div class={styles.root}>
        <Toolbar />
        <div class={styles.inner} ref={editorContainer}>
          <div
            style={{
              'width': `${width}%`,
              'display': 'flex',
              'height': '100%',
              'flex-direction': 'column',
              'overflow': 'none'
            }}>
       
        
          </div>
          <video
              ref={videoRef}
              width="640"
              height="480"
              autoPlay
              muted
            ></video>
            <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
            <h1 >{boardRef.current}</h1>
            <image ref={boardimageRef} src={boardimageRef.current} />
            
          <div
            class={`${styles.vertBar} resize-code-trigger`}
            style={{ left: `${width}%` }}></div>
          <div class={styles.right} style={{ width: `${100 - width}%` }}>
           
        
          </div>
        </div>
      </div>
      <CompatWarning />
      <DropBox />
    </>
  )
}

function addEditorResizing(setWidth, theme) {
  const listen = createListener(document.body)

  let clicked = false
  let bar: HTMLDivElement | null = null

  listen('mousedown', '.resize-code-trigger', e => {
    clicked = true
    bar = e.target

    if (bar === null) return

    bar.style.width = '8px'
    bar.style.background = theme === 1 ? '#404040' : '#eee'
  })

  listen('mousemove', '', e => {
    if (clicked) {
      e.preventDefault()
      let percent = (e.clientX / window.innerWidth) * 100
      percent = Math.min(percent, 100)
      percent = Math.max(percent, 0)

      setWidth(percent)
    }
  })

  listen('mouseup', '', () => {
    if (bar !== null) {
      bar.style.width = ''
      bar.style.background = ''
    }

    clicked = false
    bar = null
  })

  document.addEventListener('mouseleave', () => {
    if (bar !== null) {
      bar.style.width = ''
      bar.style.background = ''
    }

    clicked = false
    bar = null
  })
}

function addHelpResizing(setHeight, container, theme) {
  const listen = createListener(document.body)

  let clicked = false
  let bar: HTMLDivElement | null = null

  listen('mousedown', '.resize-help-trigger', e => {
    clicked = true
    bar = e.target

    if (bar === null) return

    bar.style.height = '8px'
    bar.style.background = theme === 1 ? '#404040' : '#eee'
  })

  listen('mousemove', '', e => {
    if (clicked) {
      e.preventDefault()
      let percent =
        100 -
        ((e.clientY - container.current.offsetTop) /
          container.current.offsetHeight) *
          100
      percent = Math.min(percent, 100)
      percent = Math.max(percent, 0)

      setHeight(percent)
    }
  })

  listen('mouseup', '', () => {
    if (bar !== null) {
      bar.style.height = ''
      bar.style.background = ''
    }

    clicked = false
    bar = null
  })

  document.addEventListener('mouseleave', () => {
    if (bar !== null) {
      bar.style.height = ''
      bar.style.background = ''
    }

    clicked = false
    bar = null
  })
}
