import request from '@/utils/request'

/**
 * 本周运势
 */
export function getWeeklyFortunenew(params) {
  return request({
    url: '/numberologynew/fortune/GetWeeklyFortunenew',
    method: 'get',
    params
  })
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
