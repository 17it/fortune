import request from '../utils/request'

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
