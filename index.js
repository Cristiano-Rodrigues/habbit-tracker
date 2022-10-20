class Day {
  constructor ({ pos, isDone }, dispatch) {
    this.pos = pos
    this.dom = elt('td', null, elt('input', {
      type: 'checkbox',
      checked: isDone,
      onchange (e) {
        dispatch({ pos, isDone: e.target.checked })
      }
    }))
  }
}

class Table {
  constructor ({ grid }, dispatch) {
    this.grid = grid
    this.dispatch = dispatch
    this.dom = renderTable(this)
  }

  sync ({ grid }) {
    this.grid = grid
  }
}

function renderTable ({ grid, dispatch }) {
  const body = elt('tbody')
  const table = elt('table', { className: 'table' },
    renderHead(), body)
  
  for (let y = 0; y < grid.size.y; y++) {
    const row = elt('tr')
    for (let x = 0; x < grid.size.x; x++) {
      const day = new Day({
        pos: { x, y }, isDone: grid.get({ x, y }).isDone
      }, dispatch)
      row.appendChild(day.dom)
    }
    body.appendChild(row)
  }

  return table
}

function renderHead () {
  return elt('thead', null, elt('tr', null, ...'Sun,Mon,Tue,Wed,Thu,Fri,Sat'
    .split(',').map(day => elt('th', null, day))))
}

class Progress {
  constructor ({ grid }) {
    this.grid = grid
    this.progressBar = elt('div', { className: 'progress-bar' })
    this.dom = elt('div', {
      className: 'progress'
    }, this.progressBar)

    this.update()
  }

  update () {
    const done = this.grid.cells.reduce((count, b) => {
      return b.isDone ? count + 1 : count
    }, 0)
    const percentage = (done / this.grid.area) * 100
    this.progressBar.style.width = `${percentage}%`
  }

  sync ({ grid }) {
    this.grid = grid
    this.update()
  }
}

class App {
  constructor () {
    this.state = {
      grid: new Grid({ x: 7, y: 3 }, this.restore())
    }
    this.progress = new Progress(this.state)
    this.table = new Table(this.state, ({ pos, isDone }) => {
      this.state.grid.set(pos, { isDone })
      this.save()
      this.sync()
    })
    this.dom = elt('div', {
      className: 'container'
    }, this.table.dom, this.progress.dom)
  }

  save () {
    localStorage.setItem('state', JSON.stringify(this.state.grid.cells))
  }

  restore () {
    return JSON.parse(localStorage.getItem('state'))
  }

  sync () {
    this.progress.sync(this.state)
  }
}

class Grid {
  constructor (size, previousCells) {
    this.size = size
    this.area = size.x * size.y
    this.cells = previousCells ||
      new Array(this.area).fill({ isDone: false })
  }

  get ({ x, y }) {
    return this.cells[x + (y * this.size.x)]
  }

  set ({ x, y }, value) {
    this.cells[x + (y * this.size.x)] = value
  }
}

function elt(type, props, ...children) {
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

const app = new App()
document.body.appendChild(app.dom)