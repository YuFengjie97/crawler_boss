import * as echarts from 'echarts';
import { type JobInfo } from '@crawler/types/index'
import { areabussiness_map, degree_map, experience_map } from '@crawler/params/index'
import { getActiveTime, getBossJob, getCompanySize } from '../api';

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

  async init_chart(cb: Function = function () {}) {
    const res = await this.api()
    this.option.series[0].data = res.data
    cb.apply(this)
    const chart = echarts.init(this.el);
    chart.setOption(this.option)
  }
}



async function main() {
  const c1 = new Pie('.chart1', 'boss活跃时间', getActiveTime)
  c1.init_chart()

  const c2 = new Pie('.chart2', '公司规模', getCompanySize)
  c2.init_chart()

  const c3 = new Pie('.chart3', 'boss职位', getBossJob)
  c3.init_chart(function() {
    this.option.legend.show = false
  })
}


main()


