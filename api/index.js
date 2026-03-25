import request from '@/utils/request'

/**
 * 本周运势
 */
export function getWeeklyFortunenew1(params) {
  return request({
    url: '/numberologynew/fortune/GetWeeklyFortunenew',
    method: 'get',
    params
  })
}

/**
 * 本周运势
 */
export function getWeeklyFortunenew(params) {
  const query = new URLSearchParams(params).toString()
  return fetch(`/api/proxyFortune?${query}`)
    .then(res => res.json())
}

/**
 * 保存运势数据到本地 data.json
 */
export function saveFortuneData(key, data) {
  return fetch('/api/saveFortuneData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, data })
  }).then(res => res.json())
}

/**
 * 获取本地已存储的所有运势数据
 */
export function getLocalFortuneData() {
  return fetch('/api/getFortuneData').then(res => res.json())
}
