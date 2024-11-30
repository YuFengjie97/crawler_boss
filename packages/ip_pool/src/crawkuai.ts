import axios from "axios";
import * as cheerio from 'cheerio'
import fs from 'fs'


const axios_ins = axios.create({
  timeout: 60000,
  headers: {
    'content-type': 'application/json',
    'host': 'www.89ip.cn',
    'origin': 'https://www.89ip.cn',
    'referer': 'https://www.89ip.cn/index_1.html',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  },
})

async function get_ip_list_by_parse_page(html: string) {
  const $ = cheerio.load(html)
  const ips: string[] = []
  $('tbody').find('tr').each((index, row_el) => {
    const ip = $(row_el).children('td').eq(0).text()
    const port = $(row_el).children('td').eq(1).text()
    let ip_full = `${ip}:${port}`
    ip_full = ip_full.replace(/[\r\n\s]/g, '')
    ips.push(ip_full)
    console.log(ip_full);

  })

  return ips
}

async function get_ip_list_from_page(url: string) {

  const res = await axios_ins.get(url)
  const html = res.data
  const ip_list = await get_ip_list_by_parse_page(html)
  return ip_list
}


async function get_ip_from_mult_page() {
  const ip_list: string[] = []
  for (let i = 1; i <= 1; i += 1) {
    console.log('----page ', i);

    const url = `https://www.89ip.cn/index_${i}.html`

    const ips = await get_ip_list_from_page(url)
    ip_list.push(...ips)
  }
  fs.writeFileSync('./data/ips.json', JSON.stringify({ ip_list }, null, 2))
}


(async () => {
  await get_ip_from_mult_page()
})();