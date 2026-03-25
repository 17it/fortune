export default {
  target: 'server',
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  head: {
    title: '八字运程 - 本周运势',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '八字运程，查看本周运势' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  css: [
    '@/assets/css/main.css'
  ],
  plugins: [
    { src: '@/plugins/echarts', ssr: false }
  ],
  serverMiddleware: [
    { path: '/api/saveFortuneData', handler: '~/api/saveFortuneData' },
    { path: '/api/getFortuneData', handler: '~/api/getFortuneData' },
    { path: '/api/proxyFortune', handler: '~/api/proxyFortune' }
  ],
  components: true,
  modules: [
    '@nuxtjs/axios'
  ],
  axios: {
    baseURL: 'https://coco70.51wnl-cq.com',
    timeout: 600000
  },
  build: {
    transpile: ['echarts'],
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    }
  }
}
