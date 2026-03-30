<template>
  <div class="admin-page">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <button class="btn btn-primary" @click="fetchData">刷新数据</button>
      <nuxt-link to="/" class="btn btn-secondary">返回首页</nuxt-link>
    </div>

    <!-- 提示消息 -->
    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>

    <!-- 周列表 -->
    <div v-if="weeks.length === 0 && !loading" class="empty">暂无数据</div>

    <div v-for="week in weeks" :key="week.key" class="week-card">
      <div class="week-header">
        <span class="week-title">{{ week.key }}</span>
        <span class="week-score">综合评分：{{ week.data.score }}</span>
      </div>

      <!-- 查看模式 -->
      <div v-if="editingKey !== week.key" class="week-view">
        <div class="week-desc">{{ week.data.description }}</div>
        <div class="week-scores">
          <div v-for="(cat, idx) in categories" :key="idx" class="score-row">
            <span class="score-label">{{ cat.label }}：</span>
            <span class="score-values">{{ week.data[String(idx)].join(', ') }}</span>
          </div>
        </div>
        <div class="week-actions">
          <button class="btn btn-edit" @click="startEdit(week)">编辑</button>
          <button class="btn btn-delete" @click="handleDelete(week.key)">删除</button>
        </div>
      </div>

      <!-- 编辑模式 -->
      <div v-else class="week-edit">
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="editForm.description" rows="3" />
        </div>
        <div class="form-group">
          <label>综合评分</label>
          <input v-model.number="editForm.score" type="number" min="0" max="100" />
        </div>
        <div v-for="(cat, idx) in categories" :key="idx" class="form-group">
          <label>{{ cat.label }}（7天，逗号分隔）</label>
          <input v-model="editForm[idx]" :placeholder="'如：80, 60, 70, 80, 60, 40, 40'" />
        </div>
        <div class="week-actions">
          <button class="btn btn-primary" @click="handleSave">保存</button>
          <button class="btn btn-secondary" @click="cancelEdit">取消</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
  </div>
</template>

<script>
import { getLocalFortuneData, updateFortuneData, deleteFortuneData } from '@/api/index.js'

const categories = [
  { label: '事业运' },
  { label: '财运' },
  { label: '爱情运' },
  { label: '健康运' }
]

export default {
  name: 'AdminPage',
  data() {
    return {
      rawData: {},
      loading: false,
      editingKey: null,
      editForm: {},
      message: null,
      categories
    }
  },
  computed: {
    weeks() {
      return Object.keys(this.rawData).map(key => ({
        key,
        data: this.rawData[key]
      })).sort((a, b) => b.key.localeCompare(a.key))
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      this.message = null
      try {
        const res = await getLocalFortuneData()
        this.rawData = res
      } catch (err) {
        this.showMessage('error', '加载数据失败：' + err.message)
      } finally {
        this.loading = false
      }
    },
    startEdit(week) {
      this.editingKey = week.key
      this.editForm = {
        description: week.data.description,
        score: week.data.score,
        0: week.data['0'].join(', '),
        1: week.data['1'].join(', '),
        2: week.data['2'].join(', '),
        3: week.data['3'].join(', ')
      }
    },
    cancelEdit() {
      this.editingKey = null
      this.editForm = {}
    },
    parseScores(str) {
      return str.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 100)
    },
    async handleSave() {
      const scores = {}
      for (let i = 0; i < 4; i++) {
        const arr = this.parseScores(this.editForm[i])
        if (arr.length !== 7) {
          this.showMessage('error', `${categories[i].label}需要7个0-100之间的数字，当前解析到${arr.length}个`)
          return
        }
        scores[String(i)] = arr
      }

      const data = {
        ...scores,
        description: this.editForm.description,
        score: Math.min(100, Math.max(0, Number(this.editForm.score) || 0))
      }

      try {
        await updateFortuneData(this.editingKey, data)
        this.rawData[this.editingKey] = data
        this.showMessage('success', '保存成功')
        this.cancelEdit()
      } catch (err) {
        this.showMessage('error', '保存失败：' + err.message)
      }
    },
    async handleDelete(key) {
      if (!confirm(`确定要删除 ${key} 的数据吗？`)) return
      try {
        await deleteFortuneData(key)
        this.$delete(this.rawData, key)
        this.showMessage('success', '删除成功')
      } catch (err) {
        this.showMessage('error', '删除失败：' + err.message)
      }
    },
    showMessage(type, text) {
      this.message = { type, text }
      setTimeout(() => { this.message = null }, 3000)
    }
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
}

h1 {
  font-size: 1.8em;
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.btn {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s;
}
.btn:hover { border-color: #999; }

.btn-primary { background: #4a90d9; color: #fff; border-color: #4a90d9; }
.btn-primary:hover { background: #3a7bc8; }

.btn-delete { background: #fff; color: #e74c3c; border-color: #e74c3c; }
.btn-delete:hover { background: #e74c3c; color: #fff; }

.btn-edit { background: #fff; color: #4a90d9; border-color: #4a90d9; }
.btn-edit:hover { background: #4a90d9; color: #fff; }

.btn-secondary { color: #666; }

.message {
  padding: 10px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}
.message.success { background: #e8f5e9; color: #2e7d32; }
.message.error { background: #fce4ec; color: #c62828; }

.empty, .loading {
  text-align: center;
  color: #999;
  padding: 40px;
}

.week-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.week-title { font-size: 16px; font-weight: 600; }
.week-score { color: #4a90d9; font-weight: 500; }

.week-desc {
  color: #555;
  margin-bottom: 12px;
  line-height: 1.6;
}

.week-scores { margin-bottom: 16px; }
.score-row {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
}
.score-label { color: #888; min-width: 60px; }
.score-values { color: #333; font-family: monospace; }

.week-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.week-edit {
  padding-top: 8px;
}

.form-group {
  margin-bottom: 14px;
}
.form-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a90d9;
}
</style>
