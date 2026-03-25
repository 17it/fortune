const https = require('https')
const { URL } = require('url')

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

module.exports = function(req, res) {
  const params = new URL(req.url, 'http://localhost').searchParams
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
