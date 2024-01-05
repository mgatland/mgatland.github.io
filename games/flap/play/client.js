/* eslint-disable no-console */
'use strict'

import { game } from './game.js'

function showMessage (m) {
  console.log(m)
}

async function getPlayerCount () {
  return await fetch('/playerCount').then(r => r.json())
}

async function load () {
  console.log('player count: ' + await getPlayerCount())
}

let ws

function connect () {
  if (ws) {
    ws.onerror = ws.onopen = ws.onclose = null
    ws.close()
  }

  const prefix = (location.protocol === 'https:') ? 'wss' : 'ws'

  ws = new WebSocket(`${prefix}://${location.host}`)
  ws.onerror = function() {
    showMessage('WebSocket error')
  }
  ws.onopen = function() {
    showMessage('WebSocket connection established')
    const sendFunc = x => ws.send(x)
    game.start(sendFunc)
  }
  ws.onclose = function() {
    showMessage('WebSocket connection closed')
  }
  ws.onmessage = function (msg) {
    game.onMessage(JSON.parse(msg.data))
  }
} 

load()

// 2024-01-05 this used to call:
// connect()
// but now I've disabled the server and multiplayer part of this game, so we'll use this stub:
game.start(function (message) { console.log(message)})
// note that the multiplayer was not especially interesting so it's no great loss
