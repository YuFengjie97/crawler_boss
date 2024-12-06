import * as echarts from 'echarts';
import { type JobInfo } from '@crawler/types/index'
import { areabussiness_map, degree_map, experience_map } from '@crawler/params/index'
import {
  get_active_time,
  get_boss_job,
  get_key_word,
  get_company_size,
  get_degree, get_total_num,
  get_wai_bao,
  get_wai_bao_in_half_year,
  get_wai_bao_in_month,
  get_wai_bao_in_month_normal_benke_experience_in_3_year
} from '../api';

// 学历歧视关键字
const super_education = ['985', '211']
// 外包关键字
const suck_blood_words = ['外包', '外派', '劳务派遣', '人力', '驻场', '压力', '加班']
const other_words = ['nextjs', 'next', 'web3', '区块链', 'jquery', '国企']
const key_words = [...super_education, ...suck_blood_words, ...other_words];


class Pie {
  option = {
    title: {
      text: '',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      show: true
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  el: HTMLElement
  api: Function

  constructor(css_selector: string, title: string, api: Function) {
    this.el = document.querySelector(css_selector)
    this.option.title.text = title
    this.api = api
  }

  async init_chart(cb: Function = function () { }) {
    const res = await this.api()
    this.option.series[0].data = res.data
    cb.apply(this)
    const chart = echarts.init(this.el);
    chart.setOption(this.option)
  }
}



async function main() {
  const res = await get_total_num()
  const total_el = document.querySelector('#total')
  total_el.innerHTML = res.data[0].total


  const c1 = new Pie('.chart1', 'boss活跃时间', get_active_time)
  c1.init_chart()

  const c2 = new Pie('.chart2', '公司规模', get_company_size)
  c2.init_chart()

  const c3 = new Pie('.chart3', 'boss职位', get_boss_job)
  c3.init_chart(function () {
    this.option.legend.show = false
  })

  const c4 = new Pie('.chart4', '学历分布', get_degree)
  c4.init_chart()

  const c5 = new Pie('.chart5', '外包分布', get_wai_bao)
  c5.init_chart()

  const c6 = new Pie('.chart6', '外包分布-半年内', get_wai_bao_in_half_year)
  c6.init_chart()

  const c7 = new Pie('.chart7', '外包分布-本月内', get_wai_bao_in_month)
  c7.init_chart()

  const c8 = new Pie('.chart8', '外包分布-本月内-普通本科-1-3年', get_wai_bao_in_month_normal_benke_experience_in_3_year)
  c8.init_chart(function (){
    this.option.title.subtext = '权当是给自己查的'
  })

  const c9 = new Pie('.chart9', '技术关键字', get_key_word)
  c9.init_chart(function() {
    this.option.title.subtext = '只展示前10个'
  })
}

main()


