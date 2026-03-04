<template>
  <div id="app">
    <Consultation />
    <FortuneWeek />
  </div>
</template>

<script>
import Consultation from './components/Consultation.vue'
import FortuneWeek from './components/FortuneWeek.vue'

export default {
  name: 'App',
  components: {
    Consultation,
    FortuneWeek
  }
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
