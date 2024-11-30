import axios from "axios";
import * as cherrio from "cheerio";
import express from 'express'
const app = express()
const port = 3000


const axios_ins = axios.create({
  timeout: 60000,
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  },
})

async function get_ips_by_89(): Promise<string[]> {
  const api_89 = 'http://api.89ip.cn/tqdl.html?api=1&num=100&port=8089&address=&isp='

  try {
    const res = await axios_ins.get(api_89)
    if (res.status === 200) {
      const ips = res.data.match(/\d+\.\d+\.\d+\.\d+\:\d+/gim)
      return ips
    }
    return []
  } catch (e) {
    return []
  }
}

function check_ip_work_by_axios(ip: string): Promise<{ ip: string, work: boolean }> {
  return new Promise((resolve, reject) => {
    const [host, port] = ip.split(':')
    axios_ins.get('https://ip.900cha.com/', {
      proxy: {
        host,
        port: Number(port)
      },
      timeout: 3000
    }).then(res => {
      if (res.status === 200) {
        const $ = cherrio.load(res.data)
        const ip_check = $('.text-danger.mt-2').text()
        console.log(`ip检测是否一致:${ip_check === ip}, ${ip_check}  ${ip}`);
        if (ip_check === ip) {
          resolve({ ip, work: true })
        }
        resolve({ ip, work: false })
      }
      console.log('----------------not 200');
      
      resolve({ ip, work: false })
    }).catch(e => {
      console.error('----------------error', e);

      resolve({ ip, work: false })
    })
  })
}


async function get_work_proxy(ips: string[]) {
  const tasks = []
  for (let ip of ips) {
    const task = check_ip_work_by_axios(ip)
    tasks.push(task)
  }
  const res = await Promise.all(tasks)
  return {
    success: res.filter((item) => item.work).map(item => item.ip),
    fail: res.filter((item) => !item.work).map(item => item.ip)
  }
}


app.get('/proxy', async (req, res) => {
  console.log('---api----/proxy');
  // const ips = get_ips_by_89()
  const ips = ['218.87.205.194:21273']

  const proxy_status = await get_work_proxy(ips)
  res.send(proxy_status)
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})