<template>
  <div class="fortune-container">
    <div class="header">
      <h2 class="title">本周运程</h2>
      <div class="date-range">2月23日-3月1日</div>
    </div>

    <div class="tabs">
      <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
      >
        <div class="tab-name">{{ tab.name }}</div>
        <div class="tab-level">{{ tab.level }}</div>
      </div>
    </div>

    <div class="chart-wrapper">
      <div ref="chartContainer" class="chart"></div>
    </div>

    <div class="score">本周平均得分 {{ averageScore }}分</div>

    <div class="description">
      本周运势不错，工作事情较多，但阻碍较小。财运上有小耗现象，需扎紧钱袋。情侣间的感情会升温，单身的朋友桃花运旺。
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'FortuneWeek',
  data() {
    return {
      activeTab: 'overall',
      tabs: [
        { key: 'overall', name: '综合', level: '小吉' },
        { key: 'health', name: '健康', level: '平淡' },
        { key: 'career', name: '事业', level: '小吉' },
        { key: 'love', name: '爱情', level: '小吉' }
      ],
      days: ['今天', '周二', '周三', '周四', '周五', '周六', '周日'],
      chartData: [36, 45, 35, 40, 75, 70, 65],
      averageScore: 63,
      chart: null
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      const chartContainer = this.$refs.chartContainer
      if (!chartContainer) return

      this.chart = echarts.init(chartContainer)
      this.updateChart()
    },
    updateChart() {
      if (!this.chart) return

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
            data: this.chartData,
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

.tab.active .tab-level {
  color: #333;
}

.chart-wrapper {
  margin-bottom: 20px;
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
