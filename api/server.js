const { promises: fs } = require('fs')
const https = require('https')
const { URL } = require('url')
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
      try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

function getQueryParams(req) {
  return new URL(req.url, 'http://localhost').searchParams
}

// 路由处理
async function saveFortuneData(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method Not Allowed' })
  }

  let body
  try { body = await getBody(req) } catch (e) { return sendJson(res, 400, { message: 'Invalid JSON body' }) }

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

async function getFortuneData(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { message: 'Method Not Allowed' })
  }

  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const data = JSON.parse(content)
    sendJson(res, 200, data)
  } catch (err) {
    console.error('Failed to read fortune data:', err)
    sendJson(res, 500, { message: 'Failed to read data' })
  }
}

async function updateFortuneData(req, res) {
  if (req.method !== 'PUT') {
    return sendJson(res, 405, { message: 'Method Not Allowed' })
  }

  let body
  try { body = await getBody(req) } catch (e) { return sendJson(res, 400, { message: 'Invalid JSON body' }) }

  const { key, data } = body
  if (!key || data === undefined) {
    return sendJson(res, 400, { message: 'Missing key or data' })
  }

  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const json = JSON.parse(content)
    json[key] = data
    await fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), 'utf-8')
    sendJson(res, 200, { message: 'Updated successfully', key })
  } catch (err) {
    console.error('Failed to update fortune data:', err)
    sendJson(res, 500, { message: 'Failed to update data' })
  }
}

async function deleteFortuneData(req, res) {
  if (req.method !== 'DELETE') {
    return sendJson(res, 405, { message: 'Method Not Allowed' })
  }

  const params = getQueryParams(req)
  const key = params.get('key')
  if (!key) {
    return sendJson(res, 400, { message: 'Missing key parameter' })
  }

  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const json = JSON.parse(content)
    if (!json[key]) {
      return sendJson(res, 404, { message: 'Key not found', key })
    }
    delete json[key]
    await fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2), 'utf-8')
    sendJson(res, 200, { message: 'Deleted successfully', key })
  } catch (err) {
    console.error('Failed to delete fortune data:', err)
    sendJson(res, 500, { message: 'Failed to delete data' })
  }
}

function proxyFortune(req, res) {
  const params = getQueryParams(req)
  const query = new URLSearchParams({
    name: params.get('name'),
    sex: params.get('sex'),
    birthday: params.get('birthday')
  }).toString()
  const url = `https://coco70.51wnl-cq.com/numberologynew/fortune/GetWeeklyFortunenew?${query}`

  https.get(url, (apiRes) => {
    let body = ''
    apiRes.on('data', chunk => { body += chunk })
    apiRes.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(body)
    })
  }).on('error', (err) => {
    console.error('proxyFortune error:', err.message)
    sendJson(res, 500, { error: err.message })
  })
}

// 路由表
const routes = {
  '/saveFortuneData': saveFortuneData,
  '/getFortuneData': getFortuneData,
  '/updateFortuneData': updateFortuneData,
  '/deleteFortuneData': deleteFortuneData,
  '/proxyFortune': proxyFortune
}

// 入口
module.exports = function(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname
  const handler = routes[pathname]
  if (handler) {
    handler(req, res)
  } else {
    sendJson(res, 404, { message: 'Not Found' })
  }
}
