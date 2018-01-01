const path = require('path')
const fs = require('fs')

function fetchDir(dir) {
  const list = fs.readdirSync(dir)

  return list.map(name => {
    const f_path = path.join(dir, name)

    return {
      name: name,
      path: f_path,
      child: fs.statSync(f_path).isDirectory() ? fetchDir(f_path) : null
    }
  })
}

module.exports = fetchDir
