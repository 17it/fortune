<template>
  <div class="fortune-container">
    <div class="header">
      <h2 class="title">本周运程</h2>
      <div class="date-range">2月23日-3月1日</div>
    </div>

    <div class="tabs">
      <div v-for="tab in tabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
        <div class="tab-name">{{ tab.name }}</div>
        <div class="tab-level">{{ tab.level }}</div>
      </div>
    </div>

    <div class="chart-wrapper">
      <div ref="chartContainer" class="chart"></div>
    </div>

    <div class="score">本周平均得分 {{ averageScore[activeTab] }}分</div>

    <div class="description">{{ description }}</div>
  </div>
</template>

<script>
import { getWeeklyFortunenew } from '../api/index.js'
import * as echarts from 'echarts'

export default {
  name: 'FortuneWeek',
  data() {
    return {
      activeTab: 'overall',
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
  mounted() {
    this.getData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)

    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    getData() {
      getWeeklyFortunenew({
        name: '唐永明',
        sex: '男',
        birthday: '1992-01-23 01:00'
      }).then(res => {
        if (res.status === 0) {
          this.genData(res.data)
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
        overall: data.score, // data[0]
        health: avg(data[1]), // data[1]
        career: avg(data[2]), // data[2]
        love: avg(data[3]) // data[3]
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

      this.chart = echarts.init(chartContainer)

      this.$nextTick(() => {
        this.updateChart()
      })
    },

    updateChart() {
      if (!this.chart) return

      const cd = this.chartData[this.activeTab]

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
  },
  watch: {
    activeTab() {
      this.updateChart()
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
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.date-range {
  font-size: 14px;
  color: #999;
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
  margin-bottom: 20px;
  position: relative;
  width: 100%;

  canvas {
    width: 100%;
  }
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
