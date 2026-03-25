import axios from 'axios'

const service = axios.create({
  baseURL: 'https://coco70.51wnl-cq.com',
  timeout: 600000
})

// Request 拦截
service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

// Response 拦截
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default service
