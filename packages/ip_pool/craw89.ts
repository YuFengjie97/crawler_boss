import axios from "axios";
import express from 'express'
const app = express()
const port = 3000


const axios_ins = axios.create({
  timeout: 60000,
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  },
})

async function get_ips(): Promise<string[]> {
  const res = await axios_ins.get('http://api.89ip.cn/tqdl.html?api=1&num=100&port=&address=北京&isp=')
  if (res.status === 200) {
    const ips = res.data.match(/\d+\.\d+\.\d+\.\d+\:\d+/gim)
    return ips
  }
  return []
}

function check_ip_work(ip: string) {
  return new Promise((resolve, reject) => {
    const [host, port] = ip.split(':')
    axios_ins.get('http://www.bilibili.com', {
      proxy: {
        host,
        port: Number(port)
      },
      timeout: 3000
    }).then(res => {
      if (res.status === 200) {
        resolve(ip)
      }
      reject()
    }).catch(e => {
      reject()
    })
  })
}

async function get_work_ip() {
  const ips = await get_ips()

  const tasks = []
  for (let ip of ips) {
    const task = check_ip_work(ip)
    tasks.push(task)
  }
  const res = await Promise.any(tasks)
  return res
}


app.get('/proxy', async (req, res) => {
  const ip = await get_work_ip()
  console.log('---获取到可用ip----', ip);
  res.send(ip)
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})