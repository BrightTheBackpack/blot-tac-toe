import { getStore } from "../state.js";
import { createListener } from "../createListener.js";
import styles from "./Editor.module.css";
import CompatWarning from "./CompatWarning.js";
import Preview from "./Preview.js";
import Toolbar from "./Toolbar.js";
import Error from "./Error.js";
import Console from "./Console.js";
import DropBox from "./DropBox.js";
import LoginModal from "./LoginModal.js";
import SaveToCloudModal from "./SaveToCloudModal.js";
import CloudFilesModal from "./CloudFilesModal.js";
import CodeMirror from "./CodeMirror.js";
import { useEffect, useRef, useState } from "preact/hooks";
import Help from "./Help.js";
function checkForTwo(board){
  for(let i = 0; i < board.length; i){
      if((i-1)%3 == 0){
        if(board[i] == board[i+1]){
          return [i, i+1,i-1]
        }
        if(board[i]== board[i-1]){
          return[i, i+1]
        }
      }
      if(i%3 == 0){
        if(board[i] == board[i+1]){
          return [i, i+1, i+2]
        }   
      }
      if((i-2)%3 == 0){
        if(board[i] == board[i-1]){
          return[i, i-1, i-2]
        }
      }
      if(i-3 < 0){
        if(board[i] == board[i + 3]){
          return [i, i+3, i-6]
        }
      }else{
        if(i-6 <0){
          if(board[i] == board[i - 3]){
            return [i, i-3, i+3]
          }
          if(board[i] == board[i+3]){
            return [i, i+3, i-3]
          }else{
            if(i-9 <0){
              if(board[i] == board[i-3]){
                return [i, i-3, i-6]
              }

            }
          }
        }
        
      }
     if(i ==4){
       if(board[i] == board[i-2]){
         return [i, i-2]
       }
       if(board[i] == board[i-4]){
        return [i, i-4]
      }
      if(board[i] == board[i+2]){
        return [i, i+2]
      }
      if(board[i] == board[i+4]){
        return [i, i+4]
      }
     }
      
  }
  return false
}

function WhatMove(board, player){
  if(board.indexOf("blank") == -1){
    return "done"
  }
  if(checkForTwo(board)===false && board[4] == "blank"){
    return [4, player]
  }else if(checkForTwo(board) ===false){
    let temp = board
    let inital_index = temp.indexOf("blank")
    let index = inital_index
    if((index-1) %2 == 0){
      temp.splice(index, 1)
    }
    for(let j = 0; j<4; j++){
      if((index-1) %2 == 0){
        temp.splice(index, 1)
        index = temp.indexOf("blank")
      }else{
        inital_index = index
        break
      }


    }
    
    return [inital_index, player]

  }else{
    let index = checkForTwo(board)
    return [index[2], player]
  }
}

export default function Editor() {
  const [width, setWidth] = useState(50);
  const [tab, setTab] = useState("workshop");
  const [board, setBoard] = useState("Board State:")
  const [image, setImage] = useState("")
  const { theme } = getStore();

  const INIT_HELP_HEIGHT = 40;
  const [helpHeight, setHelpHeight] = useState(INIT_HELP_HEIGHT);
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const boardimageRef = useRef(null)
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
      

      
      if (video && ctx && getStore().codeRunning) {
        // Draw the current video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get the image data from the canvas and process it
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL()
        console.log(base64)
        const xhr = new XMLHttpRequest();
        const url = "https://0214-34-173-112-219.ngrok-free.app/";
        
        // Open a connection to the server
        xhr.open("POST", url, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        
        // Define a callback function to handle the response
        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              
              const response = JSON.parse(xhr.responseText)["result"];
              console.log("Response:", response);
              setBoard("Board State:" + response[0])
              setImage(response[1])
              // boardimageRef.current = response[1]
              
              
   
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


  }, []);

  
  const editorContainer = useRef(null);

  return (
    <>
      <div class={styles.root}>
        <Toolbar />
        <div class={styles.inner} ref={editorContainer}>
          <div
            style={{
              width: `${width}%`,
              display: "flex",
              height: "100%",
              "flex-direction": "column",
              overflow: "none",
              cursor: "text"
            }}
          >
              <video
              ref={videoRef}
      
              autoPlay
              muted
            ></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            <div style={{ flex: 1, overflow: "auto" }}>
            </div>
            <div>
            
       
            </div>
          </div>
          <div
            class={`${styles.vertBar} resize-code-trigger`}
            style={{ left: `${width}%` }}
          ></div>
          <div class={styles.right} style={{ width: `${100 - width}%` }}>
          <h1>{board}</h1>
            <div
              class={`${styles.horizBar} resize-help-trigger`}
              style={{
                top: `${100 - helpHeight}%`,
                width: `${100 - width}%`,
              }}
            ></div>
            <div class={styles.help}>
              <img src = {image}></img>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

function addEditorResizing(setWidth, theme) {
  const listen = createListener(document.body);

  let clicked = false;
  let bar: HTMLDivElement | null = null;

  listen("mousedown", ".resize-code-trigger", (e) => {
    clicked = true;
    bar = e.target;

    if (bar === null) return;

    bar.style.width = "8px";
    bar.style.background = theme === 1 ? "#404040" : "#eee";
  });

  listen("mousemove", "", (e) => {
    if (clicked) {
      e.preventDefault();
      let percent = (e.clientX / window.innerWidth) * 100;
      percent = Math.min(percent, 100);
      percent = Math.max(percent, 0);

      setWidth(percent);
    }
  });

  listen("mouseup", "", () => {
    if (bar !== null) {
      bar.style.width = "";
      bar.style.background = "";
    }

    clicked = false;
    bar = null;
  });

  document.addEventListener("mouseleave", () => {
    if (bar !== null) {
      bar.style.width = "";
      bar.style.background = "";
    }

    clicked = false;
    bar = null;
  });
}

function addHelpResizing(setHeight, container, theme) {
  const listen = createListener(document.body);

  let clicked = false;
  let bar: HTMLDivElement | null = null;

  listen("mousedown", ".resize-help-trigger", (e) => {
    clicked = true;
    bar = e.target;

    if (bar === null) return;

    bar.style.height = "8px";
    bar.style.background = theme === 1 ? "#404040" : "#eee";
  });

  listen("mousemove", "", (e) => {
    if (clicked) {
      e.preventDefault();
      let percent =
        100 -
        ((e.clientY - container.current.offsetTop) /
          container.current.offsetHeight) *
          100;
      percent = Math.min(percent, 100);
      percent = Math.max(percent, 0);

      setHeight(percent);
    }
  });

  listen("mouseup", "", () => {
    if (bar !== null) {
      bar.style.height = "";
      bar.style.background = "";
    }

    clicked = false;
    bar = null;
  });

  document.addEventListener("mouseleave", () => {
    if (bar !== null) {
      bar.style.height = "";
      bar.style.background = "";
    }

    clicked = false;
    bar = null;
  });
}
