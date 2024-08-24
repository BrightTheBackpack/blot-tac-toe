import { useEffect } from 'preact/hooks'
import download from '../download.ts'
import runCode from '../run.ts'
import { defaultProgram } from '../defaultProgram.js'
import { patchStore, getStore } from '../state.ts'
import { loadCodeFromString } from '../loadCodeFromString.ts'
import styles from './Toolbar.module.css'
import Button from '../ui/Button.tsx'
// import CheckmarkIcon from "../ui/CheckmarkIcon.tsx";
// import PlugIcon from '../ui/PlugIcon.tsx'
import BrightnessContrastIcon from '../ui/BrightnessContrastIcon.tsx'
import SettingsIcon from '../ui/SettingsIcon.tsx'
import KeyboardIcon from '../ui/KeyboardIcon.tsx'
import GitHubIcon from '../ui/GitHubIcon.tsx'
import { saveFile } from '../saveFile.ts'
// import * as prettier from 'prettier'
import js_beautify from 'js-beautify'
import { createShareLink } from "../createShareLink.js";
import { toolkit as tk } from "../drawingToolkit/toolkit.js";
import { post } from "../post.js";

const menuItemClasses = `
  relative
  text-white
  no-underline
  cursor-pointer
  h-full
  flex
  items-center
  p-2
  hover:bg-white
  hover:bg-opacity-10
`;

const dropdownContainer = `
  group 
  flex 
  items-center 
  relative 
  h-full 
  cursor-pointer 
  p-2 
  hover:bg-white 
  hover:bg-opacity-10
`

const dropdownClasses =`
  hidden
  group-hover:flex
  flex-col
  absolute
  top-full
  w-max
  z-[99999]
  rounded-b-lg
`;

export default function Toolbar() {
  const { connected, needsSaving, machineRunning, loginName,theme } = getStore()
  let css = "bg-[var(--primary)]"
  if(theme == "dark"){
    css = "bg-[var(--primary-dark)]"
  }



  return (
    <div class={styles.root}>
      <div class="flex items-center h-full">
        <h1 class={styles.heading}>
          <a href="/">
            {/*<BorpheusIcon style="width: 30px;" />*/}
            <img src="/assets/borpheus.svg" style="width: 30px; translate: 3px -3px;" />
            <span style="font-weight: 700;">lot</span>
          </a>
        </h1>
        <RunButton />

      
      

 
      </div>

      <div class="flex items-center h-full">
  
        <div class={dropdownContainer}>
          Machine control
          <div class={dropdownClasses + " right-0 \n " + css}>
            <div class="p-2 hover:bg-white hover:bg-opacity-10" data-evt-connectTrigger>
              {connected ? 'Disconnect from' : 'Connect to'} machine
            </div>

            <div class={`${connected ? '' : 'hidden'} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-machineTrigger>
              {machineRunning ? 'Stop' : 'Run'} machine
            </div>

            <div class={`${connected ? '' : 'hidden'} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-penUp>
              Pen up
            </div>

            <div class={`${connected ? '' : 'hidden'} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-penDown>
              Pen down
            </div>

            <div class={`${connected ? '' : 'hidden'} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-motorsOn>
              Motors on
            </div>

            <div class={`${connected ? '' : 'hidden'} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-motorsOff>
              Motors off
            </div>

            <div class={`${connected ? '' : 'hidden'} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-moveTowardsOrigin>
              Move towards origin
            </div>

            <div class={`${connected ? '' : 'hidden'} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-setOrigin>
              Set origin
            </div>

            {/* <div class={`${connected ? "" : "hidden"} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-goToOrigin>
              go to origin
            </div>*/}

            {/* <div class={`${connected ? "" : "hidden"} p-2 hover:bg-white hover:bg-opacity-10`} data-evt-homeMachine>
              home machine
            </div>*/}
          </div>
        </div>

      </div>
    </div>
  )
}



function RunButton() {
  // keyboard shortcut - shift+enter
  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        await runCode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <Button class="relative" variant="ghost" onClick={() => getCode()}>
      <div class={menuItemClasses}>
      <img src="/icons/run.svg"/>
      Run (shift+enter)
      </div>
      { getStore().codeRunning  && 
        <div class="absolute mx-auto bottom-0 left-0 right-0 text-xs text-gray-300">
            running...
        </div>
      }
    </Button>
  )
}

function getCode() {
  let code= getStore().codeRunning
  patchStore({codeRunning: !code})
}



