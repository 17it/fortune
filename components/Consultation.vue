<template>
  <div class="consultation-container">
    <div class="top-bar">
      <h2 class="title">八字运程</h2>
      <div class="user-info">
        <svg class="edit-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span class="user-name">唐永明</span>
      </div>
    </div>

    <div class="main-content">
      <div class="score-section">
        <div class="circular-score">
          <div ref="scoreChart" class="score-chart"></div>
          <div class="score-overlay">
            <div class="score-value">60</div>
            <div class="score-label">平淡</div>
          </div>
        </div>

        <div class="fortune-items">
          <div class="fortune-item">
            <div class="fortune-label">健康</div>
            <div class="fortune-dots">
              <span
                v-for="i in 5"
                :key="`health-${i}`"
                class="dot"
                :class="{ filled: i <= 3 }"
              >
                <span v-if="i <= 3" class="icon">🍃</span>
                <span v-else class="icon-gray">🍃</span>
              </span>
            </div>
          </div>

          <div class="fortune-item">
            <div class="fortune-label">事业</div>
            <div class="fortune-dots">
              <span
                v-for="i in 5"
                :key="`career-${i}`"
                class="dot"
                :class="{ filled: i <= 4 }"
              >
                <span v-if="i <= 4" class="icon">💼</span>
                <span v-else class="icon-gray">💼</span>
              </span>
            </div>
          </div>

          <div class="fortune-item">
            <div class="fortune-label">爱情</div>
            <div class="fortune-dots">
              <span
                v-for="i in 5"
                :key="`love-${i}`"
                class="dot"
                :class="{ filled: i <= 3 }"
              >
                <span v-if="i <= 3" class="icon">❤️</span>
                <span v-else class="icon-gray">🤍</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="attributes-section">
        <div class="attributes-grid">
          <div class="attribute-card">
            <div class="attribute-label">宜运数字</div>
            <div class="attribute-value">四</div>
          </div>

          <div class="attribute-card">
            <div class="attribute-label">开运食物</div>
            <div class="attribute-value">榴莲 香蕉</div>
          </div>

          <div class="attribute-card">
            <div class="attribute-label">幸运色彩</div>
            <div class="attribute-value">蓝色</div>
          </div>

          <div class="attribute-card">
            <div class="attribute-label">适宜方位</div>
            <div class="attribute-value">正北 东北</div>
          </div>

          <div class="attribute-card">
            <div class="attribute-label">宜做</div>
            <div class="attribute-value">读书 求子</div>
          </div>

          <div class="attribute-card">
            <div class="attribute-label">不宜做</div>
            <div class="attribute-value">合作 远行</div>
          </div>
        </div>
      </div>
    </div>

    <div class="description">
      聪明诚实，做事讲信用的你，易得到大家的认可，人脉也会为你带来好运啊！ 适合参加聚会，在不经意的交流之间，或许你会认识让你心动的女孩。
    </div>
  </div>
</template>

<script>
export default {
  name: 'Consultation',
  data() {
    return {
      scorePercentage: 60,
      scoreChart: null
    }
  },
  mounted() {
    this.initScoreChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.scoreChart) {
      this.scoreChart.dispose()
    }
  },
  methods: {
    initScoreChart() {
      const chartContainer = this.$refs.scoreChart
      if (!chartContainer) return

      this.scoreChart = this.$echarts.init(chartContainer)
      this.updateScoreChart()
    },
    updateScoreChart() {
      if (!this.scoreChart) return

      const option = {
        tooltip: {
          show: false,
          trigger: 'item'
        },
        legend: {
          left: 'center',
          show: false
        },
        color: ['#e22c37', '#f8ecec'],
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['72%', '90%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.scorePercentage, name: '', itemStyle: { borderRadius: 100, borderWidth: 1 } },
              { value: 100 - this.scorePercentage, name: '' }
            ]
          }
        ]
      }

      this.scoreChart.setOption(option)
    },
    handleResize() {
      if (this.scoreChart) {
        this.scoreChart.resize()
      }
    }
  }
}
</script>

<style scoped>
.consultation-container {
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-bar {
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: auto;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
  letter-spacing: 0.5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 13px;
}

.edit-icon {
  width: 16px;
  height: 16px;
  stroke: #999;
  opacity: 0.7;
  cursor: pointer;
  flex-shrink: 0;
}

.main-content {
  padding: 0 0 20px 0;
}

.score-section {
  display: flex;
  gap: 28px;
  margin-bottom: 12px;
  align-items: center;
}

.circular-score {
  position: relative;
  width: 160px;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.score-chart {
  width: 160px;
  height: 160px;
}

.score-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value {
  font-size: 44px;
  font-weight: 700;
  color: #FF6B6B;
  line-height: 1;
  margin-bottom: 6px;
}

.score-label {
  font-size: 14px;
  color: #aaa;
  letter-spacing: 0.5px;
}

.fortune-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fortune-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.fortune-label {
  font-size: 16px;
  color: #2c2c2c;
  font-weight: 500;
  width: 36px;
  flex-shrink: 0;
}

.fortune-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
}

.dot.filled {
  background: transparent;
}

.icon {
  display: inline-block;
  opacity: 1;
}

.icon-gray {
  display: inline-block;
  opacity: 0.3;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.attribute-card {
  background: #ffffff;
  padding: 14px 12px;
  text-align: center;
  border: 1px solid #f0f0f0;
}

.attribute-label {
  font-size: 11px;
  color: #fff;
  margin-bottom: 10px;
  display: inline-block;
  background: linear-gradient(90deg, #FFA726 0%, #FFB347 100%);
  padding: 5px 11px;
  border-radius: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.attribute-value {
  font-size: 14px;
  color: #2c2c2c;
  font-weight: 600;
  margin-top: 8px;
  line-height: 1.3;
}

.description {
  padding: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #666;
  text-align: justify;
}
</style>
