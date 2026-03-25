import Vue from 'vue'
import * as echarts from 'echarts'

Vue.prototype.$echarts = echarts

export default ({ app }) => {
  app.$echarts = echarts
}
