import { useEffect, useState } from 'preact/hooks'
import download from '../lib/download.ts'
import runCode from '../lib/run.ts'
import { defaultProgram } from '../lib/defaultProgram.js'
import { patchStore, getStore } from '../lib/state.ts'
import { loadCodeFromString } from '../lib/loadCodeFromString.ts'
import styles from './Toolbar.module.css'
import Button from '../ui/Button.tsx'
import cx from 'classnames'
// import CheckmarkIcon from "../ui/CheckmarkIcon.tsx";
import PlugIcon from '../ui/PlugIcon.tsx'
import {
  connect,
  disconnect,
  runMachine,
  tryAutoConnect
} from '../lib/machine.ts'
import BrightnessContrastIcon from '../ui/BrightnessContrastIcon.tsx'
import SettingsIcon from '../ui/SettingsIcon.tsx'
import KeyboardIcon from '../ui/KeyboardIcon.tsx'
import GitHubIcon from '../ui/GitHubIcon.tsx'
import BorpheusIcon from '../ui/BorpheusIcon.tsx'
import { saveFile } from '../lib/saveFile.ts'
import * as prettier from 'prettier'
import js_beautify from 'js-beautify'
import { createMask } from '../lib/getBitmap.js'
import { Turtle } from '../lib/drawingToolkit/index.js'

export default function Toolbar() {
  const { connected, needsSaving, view, machineRunning } = getStore()

  const [hidden, setHidden] = useState(true)

  return (
    <div class={styles.root}>
      <div class="flex items-center h-full">
        <h1 class={styles.heading}>
          <a href="/">
            {/*<BorpheusIcon style="width: 30px;" />*/}
            <img src="/borpheus.svg" style="width: 30px; translate: 3px -3px;" />
            <span style="font-weight: 700;">lot</span>
          </a>
        </h1>


    
      </div>

      <div class="flex items-center h-full">

        
        <MachineControls />
        <GitHubLink />
        <SettingsButton />
      </div>
    </div>
  )
}

function GitHubLink() {
  return (
    <Button variant="ghost">
      <a
        style={{ all: 'unset' }}
        href="https://github.com/hackclub/blot/tree/main"
        rel="noreferrer"
        target="_blank">
        <GitHubIcon className={styles.icon} />
      </a>
    </Button>
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
    <Button variant="ghost" onClick={() => runCode()}>
      run (shift+enter)
    </Button>
  )
}

function getCode() {
  const { view } = getStore()

  const code = view.state.doc.toString()

  return code
}




function MachineControls() {
  const { inst, running } = getStore()

  useEffect(() => {
    tryAutoConnect()

    // connect here, set inst
  }, [])

  return (
    <div>
      {inst ? (
        <>
          <Button variant="ghost" onClick={disconnect}>
            <PlugIcon className={cx(styles.icon, styles.connectedIcon)} />
            <span>disconnect...</span>
          </Button>
          {/* separator */}
          <div class={styles.separator} />
          <Button variant="ghost" loading={running} onClick={runMachine}>
            New Game
          </Button>
        </>
      ) : (
        <Button variant="ghost" onClick={connect}>
          <PlugIcon className={cx(styles.icon, styles.disconnectedIcon)} />
          <span>connect to machine...</span>
        </Button>
      )}
    </div>
  )
}
function newGame() {
}

function SettingsButton() {
  const { theme, vimMode } = getStore()
  const [hidden, setHidden] = useState(true)

  return (
    <div
      style={{
        cursor: 'default',
        width: 'min-width'
      }}
      onMouseEnter={() => setHidden(false)}
      onMouseLeave={() => setHidden(true)}>
      <Button variant="ghost">
        <a style={{ all: 'unset' }}>
          <SettingsIcon className={styles.icon} />
        </a>
      </Button>
      <div
        style={{
          'display': hidden ? 'none' : '',
          'position': 'absolute',
          'right': '5px',
          'background': 'var(--primary)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'z-index': 9999,
          'padding': '5px',
          'border-radius': '5px'
        }}>
        {/*        <Button
          class={styles.dropdownEntry}
          variant="ghost"
          onClick={() => {
            const newTheme = theme === 'dark' ? 'light' : 'dark'
            patchStore({
              theme: newTheme
            })

            document.body.dataset.theme = newTheme

            localStorage.setItem('colorTheme', newTheme)

            setHidden(false)
          }}>
          <BrightnessContrastIcon className={styles.icon} />
          <span>toggle theme</span>
        </Button>*/}
        <Button
          class={styles.dropdownEntry}
          variant="ghost"
          onClick={() => {
            patchStore({ vimMode: !vimMode })
            localStorage.setItem('vimMode', (!vimMode).toString())
            setHidden(false)
          }}>
          <KeyboardIcon className={styles.icon} />
          <span>{vimMode ? 'disable' : 'enable'} vim mode</span>
        </Button>
      </div>
    </div>
  )
}
