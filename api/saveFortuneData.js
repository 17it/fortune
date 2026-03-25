const { promises: fs } = require('fs')
const path = require('path')

const DATA_FILE = path.resolve(__dirname, '../utils/data.json')

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

module.exports = async function(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method Not Allowed' })
  }

  let body
  try {
    body = await getBody(req)
  } catch (e) {
    return sendJson(res, 400, { message: 'Invalid JSON body' })
  }

  const { key, data } = body

  if (!key || !data) {
    return sendJson(res, 400, { message: 'Missing key or data' })
  }

  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const json = JSON.parse(content)

    if (json[key]) {
      return sendJson(res, 200, { message: 'Key already exists', key })
    }

    json[key] = data
    await fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), 'utf-8')

    sendJson(res, 200, { message: 'Saved successfully', key })
  } catch (err) {
    console.error('Failed to save fortune data:', err)
    sendJson(res, 500, { message: 'Failed to save data' })
  }
}
