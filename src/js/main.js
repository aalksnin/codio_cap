
const shuffle = require('./shuffle')

function rand (max) {
  return Math.floor(Math.random() * max)
}

function changeBrightness (factor, sprite) {
  const virtCanvas = document.createElement('canvas')
  virtCanvas.width = 500
  virtCanvas.height = 500
  const context = virtCanvas.getContext('2d')
  context.drawImage(sprite, 0, 0, 500, 500)

  const imgData = context.getImageData(0, 0, 500, 500)

  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = imgData.data[i] * factor
    imgData.data[i + 1] = imgData.data[i + 1] * factor
    imgData.data[i + 2] = imgData.data[i + 2] * factor
  }
  context.putImageData(imgData, 0, 0)

  const spriteOutput = new Image()
  spriteOutput.src = virtCanvas.toDataURL()
  virtCanvas.remove()
  return spriteOutput
}

function displayVictoryMess (moves) {
  document.getElementById('moves').innerHTML = `You Moved ${moves} Steps.`
  toggleVisablity('Message-Container')
}

function toggleVisablity (id) {
  if (document.getElementById(id).style.visibility === 'visible') {
    document.getElementById(id).style.visibility = 'hidden'
  } else {
    document.getElementById(id).style.visibility = 'visible'
  }
}

function Maze (Width, Height) {
  let mazeMap
  const width = Width
  const height = Height
  let startCoord,
    endCoord
  const dirs = ['n', 's', 'e', 'w']
  const modDir = {
    n: {
      y: -1,
      x: 0,
      o: 's'
    },
    s: {
      y: 1,
      x: 0,
      o: 'n'
    },
    e: {
      y: 0,
      x: 1,
      o: 'w'
    },
    w: {
      y: 0,
      x: -1,
      o: 'e'
    }
  }

  this.map = function () {
    return mazeMap
  }
  this.startCoord = function () {
    return startCoord
  }
  this.endCoord = function () {
    return endCoord
  }

  function genMap () {
    mazeMap = new Array(height)
    for (let y = 0; y < height; y++) {
      mazeMap[y] = new Array(width)
      for (let x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          n: false,
          s: false,
          e: false,
          w: false,
          visited: false,
          priorPos: null
        }
      }
    }
  }

  function defineMaze () {
    let isComp = false
    let move = false
    let cellsVisited = 1
    let numLoops = 0
    let maxLoops = 0
    let pos = {
      x: 0,
      y: 0
    }
    const numCells = width * height
    while (!isComp) {
      move = false
      mazeMap[pos.x][pos.y].visited = true

      if (numLoops >= maxLoops) {
        shuffle(dirs)
        maxLoops = Math.round(rand(height / 8))
        numLoops = 0
      }
      numLoops++
      for (let index = 0; index < dirs.length; index++) {
        const direction = dirs[index]
        const nx = pos.x + modDir[direction].x
        const ny = pos.y + modDir[direction].y

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          // Check if the tile is already visited
          if (!mazeMap[nx][ny].visited) {
            // Carve through walls from this tile to next
            mazeMap[pos.x][pos.y][direction] = true
            mazeMap[nx][ny][modDir[direction].o] = true

            // Set Currentcell as next cells Prior visited
            mazeMap[nx][ny].priorPos = pos
            // Update Cell position to newly visited location
            pos = {
              x: nx,
              y: ny
            }
            cellsVisited++
            // Recursively call this method on the next tile
            move = true
            break
          }
        }
      }

      if (!move) {
        //  If it failed to find a direction,
        //  move the current position back to the prior cell and Recall the method.
        pos = mazeMap[pos.x][pos.y].priorPos
      }
      if (numCells === cellsVisited) {
        isComp = true
      }
    }
  }

  function defineStartEnd () {
    switch (rand(4)) {
      case 0:
        startCoord = {
          x: 0,
          y: 0
        }
        endCoord = {
          x: height - 1,
          y: width - 1
        }
        break
      case 1:
        startCoord = {
          x: 0,
          y: width - 1
        }
        endCoord = {
          x: height - 1,
          y: 0
        }
        break
      case 2:
        startCoord = {
          x: height - 1,
          y: 0
        }
        endCoord = {
          x: 0,
          y: width - 1
        }
        break
      case 3:
        startCoord = {
          x: height - 1,
          y: width - 1
        }
        endCoord = {
          x: 0,
          y: 0
        }
        break
    }
  }

  genMap()
  defineStartEnd()
  defineMaze()
}

function DrawMaze (Maze, ctx, cellsize, endSprite = null) {
  const map = Maze.map()
  let cellSize = cellsize
  let drawEndMethod
  ctx.lineWidth = cellSize / 40

  this.redrawMaze = function (size) {
    cellSize = size
    ctx.lineWidth = cellSize / 50
    drawMap()
    drawEndMethod()
  }

  function drawCell (xCord, yCord, cell) {
    const x = xCord * cellSize
    const y = yCord * cellSize

    if (cell.n === false) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + cellSize, y)
      ctx.stroke()
    }
    if (cell.s === false) {
      ctx.beginPath()
      ctx.moveTo(x, y + cellSize)
      ctx.lineTo(x + cellSize, y + cellSize)
      ctx.stroke()
    }
    if (cell.e === false) {
      ctx.beginPath()
      ctx.moveTo(x + cellSize, y)
      ctx.lineTo(x + cellSize, y + cellSize)
      ctx.stroke()
    }
    if (cell.w === false) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + cellSize)
      ctx.stroke()
    }
  }

  function drawMap () {
    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y])
      }
    }
  }

  function drawEndFlag () {
    const coord = Maze.endCoord()
    const gridSize = 4
    const fraction = cellSize / gridSize - 2
    let colorSwap = true
    for (let y = 0; y < gridSize; y++) {
      if (gridSize % 2 === 0) {
        colorSwap = !colorSwap
      }
      for (let x = 0; x < gridSize; x++) {
        ctx.beginPath()
        ctx.rect(
          coord.x * cellSize + x * fraction + 4.5,
          coord.y * cellSize + y * fraction + 4.5,
          fraction,
          fraction
        )
        if (colorSwap) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        }
        ctx.fill()
        colorSwap = !colorSwap
      }
    }
  }

  function drawEndSprite () {
    const offsetLeft = cellSize / 50
    const offsetRight = cellSize / 25
    const coord = Maze.endCoord()
    ctx.drawImage(
      endSprite,
      2,
      2,
      endSprite.width,
      endSprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    )
  }

  function clear () {
    const canvasSize = cellSize * map.length
    ctx.clearRect(0, 0, canvasSize, canvasSize)
  }

  if (endSprite != null) {
    drawEndMethod = drawEndSprite
  } else {
    drawEndMethod = drawEndFlag
  }
  clear()
  drawMap()
  drawEndMethod()
}

function Player (maze, c, _cellsize, onComplete, sprite = null) {
  const ctx = c.getContext('2d')
  let drawSprite
  let moves = 0
  drawSprite = drawSpriteCircle
  if (sprite != null) {
    drawSprite = drawSpriteImg
  }
  const player = this
  const map = maze.map()
  let cellCoords = {
    x: maze.startCoord().x,
    y: maze.startCoord().y
  }
  let cellSize = _cellsize
  const halfCellSize = cellSize / 2

  this.redrawPlayer = function (_cellsize) {
    cellSize = _cellsize
    drawSpriteImg(cellCoords)
  }

  function drawSpriteCircle (coord) {
    ctx.beginPath()
    ctx.fillStyle = 'yellow'
    ctx.arc(
      (coord.x + 1) * cellSize - halfCellSize,
      (coord.y + 1) * cellSize - halfCellSize,
      halfCellSize - 2,
      0,
      2 * Math.PI
    )
    ctx.fill()
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves)
      player.unbindKeyDown()
    }
  }

  function drawSpriteImg (coord) {
    const offsetLeft = cellSize / 50
    const offsetRight = cellSize / 25
    ctx.drawImage(
      sprite,
      0,
      0,
      sprite.width,
      sprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    )
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves)
      player.unbindKeyDown()
    }
  }

  function removeSprite (coord) {
    const offsetLeft = cellSize / 50
    const offsetRight = cellSize / 25
    ctx.clearRect(
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    )
  }

  function check (e) {
    const cell = map[cellCoords.x][cellCoords.y]
    moves++
    switch (e.keyCode) {
      case 65:
      case 37: // west
        if (cell.w === true) {
          removeSprite(cellCoords)
          cellCoords = {
            x: cellCoords.x - 1,
            y: cellCoords.y
          }
          drawSprite(cellCoords)
        }
        break
      case 87:
      case 38: // north
        if (cell.n === true) {
          removeSprite(cellCoords)
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y - 1
          }
          drawSprite(cellCoords)
        }
        break
      case 68:
      case 39: // east
        if (cell.e === true) {
          removeSprite(cellCoords)
          cellCoords = {
            x: cellCoords.x + 1,
            y: cellCoords.y
          }
          drawSprite(cellCoords)
        }
        break
      case 83:
      case 40: // south
        if (cell.s === true) {
          removeSprite(cellCoords)
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y + 1
          }
          drawSprite(cellCoords)
        }
        break
    }
  }

  this.bindKeyDown = function () {
    window.addEventListener('keydown', check, false)

    $('#view').swipe({
      swipe: function (
        event,
        direction,
        distance,
        duration,
        fingerCount,
        fingerData
      ) {
        console.log(direction)
        switch (direction) {
          case 'up':
            check({
              keyCode: 38
            })
            break
          case 'down':
            check({
              keyCode: 40
            })
            break
          case 'left':
            check({
              keyCode: 37
            })
            break
          case 'right':
            check({
              keyCode: 39
            })
            break
        }
      },
      threshold: 0
    })
  }

  this.unbindKeyDown = function () {
    window.removeEventListener('keydown', check, false)
    $('#view').swipe('destroy')
  }

  drawSprite(maze.startCoord())

  this.bindKeyDown()
}

const mazeCanvas = document.getElementById('mazeCanvas')
const ctx = mazeCanvas.getContext('2d')
let sprite
let finishSprite
let maze,
  draw,
  player
let cellSize
let difficulty
// sprite.src = 'media/sprite.png';

window.onload = function () {
  const viewWidth = $('#view').width()
  const viewHeight = $('#view').height()
  if (viewHeight < viewWidth) {
    ctx.canvas.width = viewHeight - viewHeight / 100
    ctx.canvas.height = viewHeight - viewHeight / 100
  } else {
    ctx.canvas.width = viewWidth - viewWidth / 100
    ctx.canvas.height = viewWidth - viewWidth / 100
  }

  // Load and edit sprites
  let completeOne = false
  let completeTwo = false
  const isComplete = () => {
    if (completeOne === true && completeTwo === true) {
      console.log('Runs')
      setTimeout(() => {
        makeMaze()
      }, 500)
    }
  }
  sprite = new Image()
  sprite.src =
    'https://image.ibb.co/dr1HZy/Pf_RWr3_X_Imgur.png' +
    `?${
    new Date().getTime()}`
  sprite.setAttribute('crossOrigin', ' ')
  sprite.onload = function () {
    sprite = changeBrightness(1.2, sprite)
    completeOne = true
    console.log(completeOne)
    isComplete()
  }

  finishSprite = new Image()
  finishSprite.src = 'https://image.ibb.co/b9wqnJ/i_Q7m_U25_Imgur.png' +
  `?${
  new Date().getTime()}`
  finishSprite.setAttribute('crossOrigin', ' ')
  finishSprite.onload = function () {
    finishSprite = changeBrightness(1.1, finishSprite)
    completeTwo = true
    console.log(completeTwo)
    isComplete()
  }
}

window.onresize = function () {
  const viewWidth = $('#view').width()
  const viewHeight = $('#view').height()
  if (viewHeight < viewWidth) {
    ctx.canvas.width = viewHeight - viewHeight / 100
    ctx.canvas.height = viewHeight - viewHeight / 100
  } else {
    ctx.canvas.width = viewWidth - viewWidth / 100
    ctx.canvas.height = viewWidth - viewWidth / 100
  }
  cellSize = mazeCanvas.width / difficulty
  if (player != null) {
    draw.redrawMaze(cellSize)
    player.redrawPlayer(cellSize)
  }
}

function makeMaze () {
  // document.getElementById("mazeCanvas").classList.add("border");
  if (player !== undefined) {
    player.unbindKeyDown()
    player = null
  }
  const e = document.getElementById('diffSelect')
  difficulty = e.options[e.selectedIndex].value
  cellSize = mazeCanvas.width / difficulty
  maze = new Maze(difficulty, difficulty)
  draw = new DrawMaze(maze, ctx, cellSize, finishSprite)
  player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite)
  if (document.getElementById('mazeContainer').style.opacity < '100') {
    document.getElementById('mazeContainer').style.opacity = '100'
  }
}
