import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000'
})

export function get_total_num() {
  return api.post('/total_num')
}

export function get_active_time() {
  return api.post('/activetime')
}

export function get_company_size() {
  return api.post('/companysize')
}

export function get_boss_job() {
  return api.post('/bossjob')
}

export function get_degree() {
  return api.post('/degree')
}

export function get_wai_bao() {
  return api.post('/waibao')
}

export function get_wai_bao_in_half_year() {
  return api.post('wai_bao_in_half_year')
}


export function get_wai_bao_in_month() {
  return api.post('wai_bao_in_month')
}