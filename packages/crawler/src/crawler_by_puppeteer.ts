import puppeteer, { Browser, Page } from 'puppeteer-core';
import { areabussiness_map, degree_map, experience_map, type Params } from '../params';
import fs from 'fs'

class Crawler {
  data_file_name = ''
  log_file_name = ''
  base_url = 'https://www.zhipin.com/web/geek/job'
  params: Params = {
    experience: '',
    degree: '',
    areaBusiness: ''
  }

  browser: Browser
  constructor(browser: Browser) {
    this.browser = browser
    browser.createBrowserContext()
  }
  async goToPage(url: string) {
    const page = await this.browser.newPage()
    await page.goto(url)
    await page.setViewport({ width: 1080, height: 1024 });
    return page
  }

  async getJobCardOnPage(page: Page) { 


  }

  getAllJobByParams() { }



  async getAllParams() {
    for (let [areaKey, areaVal] of Object.entries(areabussiness_map.value)) {
      for (let [degreeKey, degreeVal] of Object.entries(degree_map.value)) {
        for (let [experienceKey, experienceVal] of Object.entries(experience_map.value)) {
          this.params = {
            experience: experienceKey,
            degree: degreeKey,
            areaBusiness: areaKey
          }
          const url = this.generate_url_by_params()
          const page = await this.goToPage(url)
          const jobCards = await this.getJobCardOnPage(page)
        }
      }
    }
  }

  generate_url_by_params() {
    // 关键字前端,地区北京
    const p = {
      ...this.params,
      query: '前端', city: '101010100'
    }

    const query = new URLSearchParams(p).toString()
    return `${this.base_url}?${query}`
  }
  
}

function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`sleep ${timeout}ms over`);
      resolve('')
    }, timeout);
  })
}

(async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto('https://www.zhipin.com/web/geek/job?query=&page=1');

  await page.setViewport({ width: 1080, height: 1024 });

  /**
   * todo: 判断空页
   */

  await sleep(5000)
  console.log(await page.title());
  
  // await page.locator('.job-card-wrapper:nth-child(1)')
  
  const jobs = await page.$$eval('.job-card-wrapper', (cards) => {
    return cards.map(card => {
      console.log('card',card);
      
      return  {
        jobName: card.querySelector('.job-name') || ''
      }
    })
  })

  console.log('jobs',jobs);
  
  await page.close()
  await browser.close()

})();
