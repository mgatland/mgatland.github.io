"use strict"

let debugMode = false
window.editMode = false

import { editor } from './editor.js'

const storageKey = 'github.com/mgatland/flap/map'

let frame = 0
let send = undefined
let netState = {}
let localId = undefined

const player = {
  pos: { x: 90, y: 50 },
  vel: { x: 0, y: 0 },
  facingLeft: false,
  checkpoints: {},
  trail: [],
  megaBird: false
}

const camera = {
  pos: {x: player.pos.x, y: player.pos.y}
}

const checkpoints = [
  {id: 1, x: 3.5, y: 3.5},
  {id: 2, x: 21.5, y: 5.5},
  {id: 3, x: 33.5, y: 2.5},
  {id: 4, x: 45.5, y: 12.5},
  {id: 5, x: 36.5, y: 42.5},
  {id: 6, x: 36.5, y: 36.5},
  {id: 7, x: 18.5, y: 45.5},
  {id: 8, x: 3.5, y: 42.5},
  {id: 9, x: 18.5, y: 36.5},
  {id: 0, x: 25.5, y: 23.5},
]

const particles = []

const groundXVel = 1
const skyXVel = 3
const xAccel = 0.1
const xDecel = 0.05

const scale = 4
const tileSize = 16
let canvas
let ctx
let spriteImage

let savedMap = localStorage.getItem(storageKey)
let world = savedMap ? JSON.parse(savedMap) : {}
if (savedMap) {
  console.warn('Loading map from local storage. This is only for development use.')
  console.log(savedMap)
} else {
  world =
  {  "width": 50,  "height": 50,  "map": [null,0,1,51,0,48,1,2,0,48,1,2,0,48,1,2,0,10,7,1,0,21,6,1,0,15,1,2,0,32,6,1,0,15,1,2,0,4,7,1,0,24,6,7,0,12,1,2,0,48,1,2,0,19,7,1,0,28,1,2,0,48,1,2,0,41,6,4,0,3,1,2,0,48,1,2,0,6,6,6,0,36,1,2,0,47,6,1,1,2,0,41,7,4,0,3,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,23,6,2,0,23,1,2,0,24,6,2,0,22,1,2,0,25,6,2,0,21,1,2,0,26,6,2,0,20,1,2,0,27,6,2,0,19,1,2,0,28,6,2,0,18,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,13,7,8,0,14,6,1,0,12,1,2,0,13,7,1,0,6,7,1,0,15,6,1,0,11,1,2,0,20,7,1,0,16,6,1,0,10,1,2,0,20,7,1,0,17,6,1,0,9,1,2,0,20,7,1,0,18,6,1,0,8,1,2,0,13,7,1,0,6,7,1,0,12,6,5,0,10,1,2,0,13,7,1,0,3,7,1,0,2,7,1,0,27,1,2,0,13,7,1,0,6,7,1,0,27,1,2,0,13,7,8,0,27,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,0,48,1,2,6,2,0,46,1,2,0,48,1,51,0,2  ]}
}
world.map = editor.rleDecode(world.map)


function start (sendFunc) {
  canvas = document.querySelector('canvas')
  ctx = canvas.getContext('2d', { alpha: false })
  ctx.imageSmoothingEnabled = false
  const defaultFont = "16px 'uni 05_64'"
  const titleFont = "32px 'uni 05_64'"
  ctx.font = defaultFont
  ctx.fillStyle = '#ccc'
  ctx.baseLine = 'bottom'
  spriteImage = new Image()
  spriteImage.src = 'sprites.png'
  spriteImage.addEventListener('load', loaded, false)
  send = sendFunc
}

function loaded () {
  editor.startEditor(canvas, scale, world, tileSize, player, storageKey, camera)
  tick()
}

function tick () {
  frame = (++frame % 3600)
  updatePlayer(player, keys)
  for (let id in netState) {
    if (id != localId || debugMode) {
      updatePlayer(netState[id], false)
    }
  }
  updateParticles()
  keys.flap = false // special case
  draw()
  requestAnimationFrame(tick)
}

function updateParticles () {
  for (let bit of particles) {
    bit.x += bit.xVel
    bit.y += bit.yVel
    bit.age++

    //fireworks hack
    if (bit.type === 'firework0' && bit.age === 7) {
      bit.age = 9999
      const density = 7
      for (let i = 0; i < density; i++) {
        const p = {x: bit.x, y: bit.y, age: 0, type: "firework1"}
        const angle = i / density * Math.PI * 2
        const force = 1
        p.xVel = force * Math.cos(angle)
        p.yVel = force * Math.sin(angle)
        particles.push(p)
      }
    }
    if (bit.type === 'firework1' && bit.age === 30) {
      bit.age = 9999
    }
  }

  filterInPlace(particles, bit => bit.age < 60 * 5)

}

//https://stackoverflow.com/questions/37318808/what-is-the-in-place-alternative-to-array-prototype-filter
function filterInPlace(a, condition) {
  let i = 0, j = 0;

  while (i < a.length) {
    const val = a[i];
    if (condition(val, i, a)) a[j++] = val;
    i++;
  }

  a.length = j;
  return a;
}

function draw () {
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  drawLevel()
  particles.forEach(p => drawParticle(p, false, true))
  if (!debugMode) drawPlayer(player)
  for (let id in netState) {
    if (id != localId || debugMode) {
      drawPlayer(netState[id])
    }
  }
}

function drawParticle(p) {
  if (p.type === 'ring') drawCheckpoint(p, false, true)
  if (p.type === 'firework0') drawSprite(16, p.x, p.y)
  if (p.type === 'firework1') drawSprite(17, p.x, p.y)
}

function drawPlayer(player) {

  for (let bit of player.trail) {
    drawCheckpoint(bit, false)     
   }

  let sprite
  if (player.flapAnim < 1) {
    sprite = 2
  } else if (player.flapAnim < 4) {
    sprite = 3
  } else {
    sprite = 4
  }
  drawSprite(sprite, player.pos.x, player.pos.y, player.facingLeft)
  //ctx.strokeText(Math.floor(player.pos.x / tileSize) + ":" + Math.floor(player.pos.y / tileSize), 40, 40)

}

function drawSprite (index, x, y, flipped = false) {
  let width = tileSize
  let height = tileSize
  x = Math.floor((x - camera.pos.x) * scale)
  y = Math.floor((y - camera.pos.y) * scale)
  x += Math.floor(canvas.width / 2)
  y += Math.floor(canvas.height / 2)
  ctx.translate(x, y)
  if (flipped) ctx.scale(-1, 1)

  let sX = (index % 8) * width
  let sY = Math.floor(index / 8) * height

  //hack for small sprites
  if (index >= 16) {
    const smolIndex = index - 16
    width /= 2
    height /= 2
    sX = smolIndex * width
    sY = 32
  }

  ctx.drawImage(spriteImage,
    sX, sY,
    width, height,
    -width / 2 * scale, -height / 2 * scale,
    width * scale, height * scale)
  if (flipped) ctx.scale(-1, 1)
  ctx.translate(-x, -y)
}

function drawLevel () {
  const level = world.map
  const center = {x: camera.pos.x / tileSize, y: camera.pos.y / tileSize}
  const halfWidth = canvas.width / 2 / scale / tileSize
  const halfHeight = canvas.height / 2 / scale / tileSize
  const minY = Math.floor(center.y - halfHeight)
  const maxY = Math.floor(center.y + halfHeight + 1)
  const minX = Math.floor(center.x - halfWidth)
  const maxX = Math.floor(center.x + halfWidth + 1)
  for (let tY = minY; tY < maxY; tY++) {
    for (let tX = minX; tX < maxX; tX++) {
      const i = tX + tY * world.width
      const x = (i % world.width) + 0.5
      const y = Math.floor(i / world.width) + 0.5
      const sprite = level[i]
      drawSprite(sprite, x * tileSize, y * tileSize)
    }
  }
  for (let checkpoint of checkpoints) {
    drawCheckpoint({ x: checkpoint.x * tileSize, y: checkpoint.y * tileSize }, player.checkpoints[checkpoint.id])
  }
}

function drawCheckpoint (pos, isVacant, isFast = false) {
  let anim = Math.floor(frame / (isFast ? 6 : 12)) % 4
  if (anim === 3) anim = 1
  if (isVacant) anim = 3
  const sprite = 8 + anim
  drawSprite(sprite, pos.x, pos.y)
}

function updatePlayer (player, isLocal) {
  const keys = player.keys
  let grounded = isGrounded(player)
  const maxXVel = grounded ? groundXVel : skyXVel
  if (keys.right) {
    if (player.vel.x < maxXVel) {
      player.vel.x += xAccel
    } else {
      player.vel.x -= Math.min(player.vel.x - maxXVel, xDecel)
    }
  }
  else if (keys.left) {
    if (player.vel.x > -maxXVel) {
      player.vel.x -= xAccel
    } else {
      player.vel.x += Math.min(-player.vel.x - maxXVel, xDecel)
    }
  }
  else if (!keys.left && player.vel.x < 0 && grounded) player.vel.x += Math.min(-player.vel.x, xDecel)
  else if (!keys.right && player.vel.x > 0 && grounded) player.vel.x -= Math.min(player.vel.x, xDecel)

  if (keys.left) player.facingLeft = true
  if (keys.right) player.facingLeft = false

  let isTouching = grounded

  // check collisions x
  player.pos.x += player.vel.x

  const collidingTile = getCollidingTiles(player.pos)
  if (collidingTile !== null) {
    isTouching = true
    const clearTileIndex = getIndexFromPixels(collidingTile.x, collidingTile.y) +
      (player.vel.x < 0 ? 1 : -1) // move player one tile left or right
    const { x: clearX } = getPixelsFromIndex(clearTileIndex)
    player.pos.x = clearX + tileSize / 2
    player.vel.x = 0
  }

  if (!keys.jump) player.flapAnim++

  if (keys.flap) {
    let flapSpeed = -1
    player.vel.y = Math.min(player.vel.y, 0)
    player.vel.y += flapSpeed
    player.flapAnim = 0
  }
  player.vel.y += 0.04

  // check collisions y
  player.pos.y += player.vel.y
  
  const collidingTileY = getCollidingTiles(player.pos)
  if (collidingTileY !== null) {
    isTouching = true
    const clearTileIndex = getIndexFromPixels(collidingTileY.x, collidingTileY.y) +
      (player.vel.y < 0 ? world.width : -world.width) // move player one tile up or down
    const { y: clearY } = getPixelsFromIndex(clearTileIndex)
    player.pos.y = clearY + tileSize / 2
    player.vel.y = 0
  }

  if (isLocal) {
    camera.pos.x = player.pos.x
    camera.pos.y = player.pos.y

    //checkpoints
    for (let checkpoint of checkpoints) {
      const xDist = Math.abs(player.pos.x - checkpoint.x * tileSize)
      const yDist = Math.abs(player.pos.y - checkpoint.y * tileSize)
      const distSqr =  xDist * xDist + yDist * yDist
      const close = (tileSize) * (tileSize)
      if (distSqr < close && !player.checkpoints[checkpoint.id]) {
        player.checkpoints[checkpoint.id] = true
        player.trail.push({x: checkpoint.x * tileSize, y: checkpoint.y * tileSize, xVel: 0, yVel: 0})

        //Did I win?
        if (checkpoints.every(cp => player.checkpoints[cp.id])) {
          console.log('you just won the game')
          player.megaBird = true
        }
      }
    }
  }

  if (player.megaBird && frame % 10 === 0) {
    const p = {x: player.pos.x, y: player.pos.y, age: 0, type: "firework0"}
    const angle = (frame / 10) / 12 * Math.PI * 2
    const force = 1.4
    p.xVel = force * Math.cos(angle)
    p.yVel = force * Math.sin(angle)
    particles.push(p)
  }

  if (player.lostCoins) {
    player.checkpoints = {}
    console.log('coins lost: ' + player.trail.length)
    for (let bit of player.trail) {
      particles.push(bit)
      bit.type = "ring"
      bit.age = 0
      bit.xVel *= 2
      bit.yVel *= 2
      bit.xVel += (Math.random() - 0.5) * 4
      bit.yVel += (Math.random() - 0.5) * 4
    }
    player.trail.length = 0
  }
  delete player.lostCoins

  if (isLocal) {
    if (player.trail.length > 0) {
      if (isTouching) {
        player.lostCoins = true //for network updates
      }
    }
  }
  if (player.trail.length > 0) {
    let pos = {... player.pos}
    for (let bit of player.trail) {
      const dist = getDist(bit, pos)
      const angle = getAngle(bit, pos)
      const force = 0.1 * dist
      bit.xVel = force * Math.cos(angle)
      bit.yVel = force * Math.sin(angle)
      pos.x = bit.x
      pos.y = bit.y
      bit.x += bit.xVel
      bit.y += bit.yVel
    }
  }
  if (isLocal) send(JSON.stringify(player))
}

function getDist(pos1, pos2) {
  const xDist = pos1.x - pos2.x
  const yDist = pos1.y - pos2.y
  const dist = Math.sqrt(xDist * xDist + yDist * yDist)
  return dist
}

function getAngle(pos1, pos2) {
  return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x)
}

function onMessage (msg) {
  if (msg.type === 'events') {
    for (let event of msg.data) {
      let id = event.id
      if (netState[id]) {
        netState[id].lostCoins = true
      }
    }
  }
  else if (msg.id !== undefined) {
    localId = msg.id
    console.log('got local id: ' + localId)
  } else {
    netState = msg
    for (const id in netState) {
      //netState[id] = JSON.parse(netState[id])
    }
  }
}

export const game = {
  start: start,
  onMessage: onMessage
}

// flap is a special case, only actiates on hit
const keys = { left: false, right: false, cheat: false, jump: false, flap: false }

// hacks!
player.keys = keys

function switchKey (e, state) {
  const key = e.key
  switch (key) {
    case 'ArrowLeft':
    case 'a':
      keys.left = state
      e.preventDefault()
      break
    case 'ArrowRight':
    case 'd':
      keys.right = state
      e.preventDefault()
      break
    case 'ArrowUp':
    case 'w':
    case ' ':
      // we check keys.jump to prevent keyboard repeat)
      if (state === true && !keys.jump) keys.flap = state
      keys.jump = state
      e.preventDefault()
      break
    case 'q':
      keys.cheat = state
      e.preventDefault()
      break
    case 'ArrowDown':
      e.preventDefault()
      break
  }

  // hack for cheatmode
  if (state === false && keys.cheat && key === 'l') {
    player.cheatMode = !player.cheatMode
  }
}

window.addEventListener('keydown', function (e) {
  switchKey(e, true)
})

window.addEventListener('keyup', function (e) {
  switchKey(e, false)
})

function getIndexFromPixels (x, y) {
  if (x < 0 || y < 0 || x >= world.width * tileSize || y >= world.height * tileSize) return -1
  return Math.floor((y / tileSize)) * world.width + Math.floor((x / tileSize))
}

function getPixelsFromIndex (i) {
  return { x: (i % world.width) * tileSize, y: Math.floor(i / world.width) * tileSize }
}

function isGrounded (ent) {
  return !!getCollidingTiles({ x: ent.pos.x, y: ent.pos.y + 0.1 })
}

function getCollidingTiles (pos) {
  const { x, y } = pos
  const halfTile = tileSize / 2
  const tilesToCheck = [
    [ -halfTile, -halfTile, 'topLeft' ],
    [ halfTile - 0.001, -halfTile, 'topRight' ],
    [ -halfTile, halfTile - 0.001, 'bottomLeft' ],
    [ halfTile - 0.001, halfTile - 0.001, 'bottomRight' ]
  ]
  for (const [xOffset, yOffset] of tilesToCheck) {
    const tileX = Math.floor(x + xOffset)
    const tileY = Math.floor(y + yOffset)
    const tileIndex = getIndexFromPixels(tileX, tileY)
    const tile = world.map[tileIndex]
    if (tile >= 1) {
      return { x: tileX, y: tileY }
    }
  }
  return null
}