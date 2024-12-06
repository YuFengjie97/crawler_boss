import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000'
})

export function getActiveTime() {
  return api.post('/activetime')
}

export function getCompanySize() {
  return api.post('/companysize')
}

export function getBossJob() {
  return api.post('/bossjob')
}