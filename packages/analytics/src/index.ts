import * as echarts from 'echarts';
import { type JobInfo } from '@crawler/types/index'
import { areabussiness_map, degree_map, experience_map } from '@crawler/params/index'
import { getActiveTime } from '../api';

// 学历歧视关键字
const super_education = ['985', '211']
// 外包关键字
const suck_blood_words = ['外包', '外派', '劳务派遣', '人力', '驻场', '压力', '加班']
const other_words = ['nextjs', 'next', 'web3', '区块链', 'jquery', '国企']
const key_words = [...super_education, ...suck_blood_words, ...other_words];


const pie_option_public = {
  title: {
    text: '',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'right'
  },
  series: [
    {
      name: 'Access From',
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


async function init_charts() {
  const res = await getActiveTime()
  console.log('boss活跃时间',res.data);
  
  const option = JSON.parse(JSON.stringify(pie_option_public))
  option.series[0].data = res.data
  option.title.text = 'boss活跃时间'
  
  const chart1 = echarts.init(document.querySelector('.chart1') as HTMLElement);
  chart1.setOption(option)
}


init_charts()


