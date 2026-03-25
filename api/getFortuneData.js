const { promises: fs } = require('fs')
const path = require('path')

const DATA_FILE = path.resolve(__dirname, '../utils/data.json')

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

module.exports = async function(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { message: 'Method Not Allowed' })
  }

  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const data = JSON.parse(content)

    // 返回所有周的 key 列表及对应数据
    const weeks = {}
    for (const key of Object.keys(data)) {
      weeks[key] = data[key]
    }

    sendJson(res, 200, { weeks })
  } catch (err) {
    console.error('Failed to read fortune data:', err)
    sendJson(res, 500, { message: 'Failed to read data' })
  }
}
