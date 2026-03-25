<template>
  <div class="fortune-container">
    <div class="header">
      <h2 class="title">运程查询</h2>
      <div class="week-picker-wrapper">
        <select v-model="selectedWeek" class="week-picker" @change="onWeekChange">
          <option v-for="w in weekOptions" :key="w.key" :value="w.key">{{ w.label }}</option>
        </select>
      </div>
    </div>

    <!--<div class="date-range-display">{{ dateRange }}</div>-->

    <div class="tabs">
      <div v-for="tab in tabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
        <div class="tab-name">{{ tab.name }}</div>
        <div class="tab-level">{{ tab.level }}</div>
      </div>
    </div>

    <div class="chart-wrapper">
      <div ref="chartContainer" class="chart"></div>
    </div>

    <div class="score">{{ weekLabel }}平均得分 {{ averageScore[activeTab] }}分</div>

    <div class="description">{{ description }}</div>
  </div>
</template>

<script>
import { getWeeklyFortunenew, saveFortuneData, getLocalFortuneData } from '@/api/index.js'
import { PERSON } from '~/utils/config'
import moment from 'moment'

export default {
  name: 'FortuneWeek',
  data() {
    const { start, end } = this.getWeekRange()
    return {
      activeTab: 'overall',
      selectedWeek: this.formatWeekKey(start, end),
      localData: {},
      tabs: [
        { key: 'overall', name: '综合', level: '' },
        { key: 'health', name: '健康', level: '' },
        { key: 'career', name: '事业', level: '' },
        { key: 'love', name: '爱情', level: '' }
      ],
      days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      chartData: {},
      averageScore: {},
      description: '',
      chart: null
    }
  },
  computed: {
    weekOptions() {
      const options = []
      const { start, end } = this.getWeekRange()
      const currentKey = this.formatWeekKey(start, end)
      options.push({ key: currentKey, label: this.formatWeekLabel(start, end) })

      const historyKeys = Object.keys(this.localData).filter(k => k !== currentKey).sort().reverse()
      historyKeys.forEach(key => {
        options.push({ key, label: this.formatWeekLabelFromKey(key) })
      })

      return options
    },

    dateRange() {
      if (this.isCurrentWeek(this.selectedWeek)) {
        const { start, end } = this.getWeekRange()
        return this.formatWeekLabel(start, end)
      }
      return this.formatWeekLabelFromKey(this.selectedWeek)
    },

    weekLabel() {
      return this.isCurrentWeek(this.selectedWeek) ? '本周' : '该周'
    }
  },
  watch: {
    activeTab() {
      this.updateChart()
    }
  },
  mounted() {
    this.loadLocalData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)

    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    getWeekRange(date) {
      const d = date || moment()
      const start = moment(d).startOf('week').add(1, 'day')
      const end = moment(start).add(6, 'days')
      return { start, end }
    },

    formatWeekKey(start, end) {
      return `${start.format('YYYY.MM.DD')}-${end.format('YYYY.MM.DD')}`
    },

    formatWeekLabel(start, end) {
      return `${start.format('YY.MM.DD')}-${end.format('MM.DD')}`
    },

    isCurrentWeek(weekKey) {
      const { start, end } = this.getWeekRange()
      return weekKey === this.formatWeekKey(start, end)
    },

    formatWeekLabelFromKey(key) {
      const [s, e] = key.split('-')
      const sm = moment(s, 'YYYY.MM.DD')
      const em = moment(e, 'YYYY.MM.DD')
      return this.formatWeekLabel(sm, em)
    },

    loadLocalData() {
      getLocalFortuneData().then(res => {
        this.localData = res || {}
        this.getData()
      }).catch(() => {
        this.getData()
      })
    },

    onWeekChange() {
      if (this.isCurrentWeek(this.selectedWeek)) {
        this.getData()
      } else if (this.localData[this.selectedWeek]) {
        this.genData(this.localData[this.selectedWeek])
      }
    },

    getData() {
      getWeeklyFortunenew(PERSON).then(res => {
        if (res.status === 0) {
          this.genData(res.data)
          const { start, end } = this.getWeekRange()
          saveFortuneData(this.formatWeekKey(start, end), res.data)
          return
        }

        alert(res.msg)
      })
    },

    genData(data) {
      const avg = (arr) => {
        let s = 0

        arr.forEach(i => {
          s += i
        })

        return parseInt(s / arr.length)
      }

      const label = (score) => {
        if (score >= 80) {
          return '大吉'
        }

        if (score >= 60) {
          return '小吉'
        }

        if (score >= 40) {
          return '平淡'
        }

        if (score >= 20) {
          return '低迷'
        }

        return '小凶'
      }

      this.averageScore = {
        overall: data.score,
        health: avg(data[1]),
        career: avg(data[2]),
        love: avg(data[3])
      }

      this.chartData = {
        overall: data[0],
        health: data[1],
        career: data[2],
        love: data[3]
      }

      this.description = data.description

      this.tabs.forEach(el => {
        el.level = label(this.averageScore[el.key])
      })

      this.initChart()
    },

    initChart() {
      const chartContainer = this.$refs.chartContainer
      if (!chartContainer) return

      this.chart = this.$echarts.init(chartContainer)

      this.$nextTick(() => {
        this.updateChart()
        this.chart.resize()
      })
    },

    updateChart() {
      if (!this.chart) return

      const cd = this.chartData[this.activeTab]
      const echarts = this.$echarts

      const option = {
        grid: {
          left: 50,
          right: 20,
          top: 10,
          bottom: 50,
          containLabel: false
        },
        xAxis: {
          type: 'category',
          data: this.days,
          axisLine: {
            lineStyle: {
              color: '#FFD700'
            }
          },
          axisLabel: {
            color: '#999',
            fontSize: 12
          },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLine: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          },
          axisLabel: {
            color: '#999',
            fontSize: 12
          }
        },
        series: [
          {
            data: cd,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#FFD700',
              borderColor: '#FFA500',
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(255, 212, 0, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(255, 212, 0, 0.05)'
                }
              ])
            },
            lineStyle: {
              color: '#FFD700',
              width: 2
            },
            markPoint: {
              data: [
                {
                  name: '平淡',
                  value: 36,
                  xAxisIndex: 0,
                  yAxisIndex: 0,
                  coord: [0, 36],
                  symbolSize: [40, 30],
                  label: {
                    show: false
                  }
                }
              ],
              symbol: 'none'
            }
          }
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          textStyle: {
            color: '#fff'
          },
          formatter: '{b}<br />{c}'
        }
      }

      this.chart.setOption(option)
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style scoped>
.fortune-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.week-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #FFF9E6;
  border: 1px solid #FFE58F;
  border-radius: 20px;
  padding: 4px 14px 4px 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.week-picker-wrapper:hover {
  border-color: #FFD700;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
}

.week-picker {
  border: none;
  background: transparent;
  font-size: 15px;
  color: #999;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  padding: 4px 20px 4px 4px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%23999' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 2px center;
}

.week-picker:focus {
  color: #333;
}

.date-range-display {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
  text-align: center;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f5f5;
}

.tab.active {
  background: #FFD700;
}

.tab-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.tab-level {
  font-size: 12px;
  color: #666;
}

.tab.active .tab-name,
.tab.active .tab-level {
  color: #fff;
}

.chart-wrapper {
  position: relative;
  width: 100%;
}

.chart {
  width: 100%;
  height: 280px;
}

.score {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.description {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
  text-align: justify;
}
</style>
