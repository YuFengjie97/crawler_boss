import { By, Builder, Browser, WebElement, WebDriver, until } from "selenium-webdriver";
import fs from 'fs'
import { type JobInfo } from './types/index'
import { type Params, areabussiness_map, degree_map, experience_map } from './params/index'
import * as chrome from 'selenium-webdriver/chrome';

class Crawler {
  base_url = 'https://www.zhipin.com/web/geek/job'
  driver: WebDriver
  data_file_name = ''
  log_file_name = ''

  params: Params = {
    experience: '',
    degree: '',
    areaBusiness: ''
  }

  constructor(driver: WebDriver) {
    this.driver = driver
  }

  update_params(params: Params) {
    this.params = params
  }

  generate_url_by_params() {
    // 关键字前端,地区北京
    const query = new URLSearchParams({ ...this.params, query: '前端', city: '101010100' }).toString()
    return `${this.base_url}?${query}`
  }

  create_log_file() {
    const currentDate = new Date();
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
    const day = currentDate.getDate().toString().padStart(2, '0')
    const hour = currentDate.getHours().toString().padStart(2, '0')
    const min = currentDate.getMinutes().toString().padStart(2, '0')
    const sec = currentDate.getSeconds().toString().padStart(2, '0')
    this.log_file_name = `${year}_${month}_${day}____${hour}_${min}_${sec}`;

    fs.writeFileSync(`log/${this.log_file_name}.txt`, '')
  }


  async save_err_log(info_ex: string = '') {
    const url = await this.driver.getCurrentUrl()
    const info = `
      ${url}
      ${areabussiness_map.value[this.params.areaBusiness]}-${experience_map.value[this.params.experience]}-${degree_map.value[this.params.degree]}
      ${info_ex}
      \n
      `
    fs.appendFileSync(`log/${this.log_file_name}.txt`, info)
  }

  async sleep(time_min: number = 1000, time_max = time_min) {
    const random_time = time_min + (time_max - time_min) * Math.random()
    await this.driver.sleep(random_time)
  }

  async simulate_human_scroll(target_el: WebElement) {

    const { y } = await target_el.getRect()
    const view_height = Number(await this.driver.executeScript('return innerHeight'))
    const target_scroll_min = y - 200 // 200是遮挡搜索框的高度
    const target_scroll_max = y + view_height * 0.7 * Math.random()
    let current_scroll_y = Number(await this.driver.executeScript('return window.scrollY'))


    while (current_scroll_y < target_scroll_min || current_scroll_y > target_scroll_max) {
      const step = 100 + Math.random()

      if (current_scroll_y <= target_scroll_min) {
        current_scroll_y += step
      }
      if (current_scroll_y >= target_scroll_max) {
        current_scroll_y -= step
      }
      await this.driver.executeScript(`
        window.scrollTo(0,${current_scroll_y})
      `)
      await this.sleep(200, 500)
    }

    console.log('人工滚动完毕');
    await this.sleep(1200, 2100)
  }

  // 在未登录时,连续爬取,ip会被封禁一天,登录后继续爬取
  // 来自未来的告示: 不要登录,如果被检测出爬虫,会封一天账号
  async check_ip_ban(): Promise<boolean> {
    const res = await this.wait_el_visable('#wrap #code31', this.driver, false)
    if (res !== null) {
      console.log('有20秒的时间,扫码登录, 20s后默认登录成功');
      await this.sleep(20000)
      return true
    }
    return false
  }

  // 在登录时,连续爬取,检测到异常访问,需要验证
  async check_need_verify() {
    const res = await this.wait_el_visable('.page-verify-slider', this.driver, false)
    if (res !== null) {
      console.log('需要在20秒内完成人工认证');
      await this.sleep(20000)
      await this.check_need_verify()
    }
  }



  save_data(data: {
    experience: string
    degree: string
    areaBusiness: string
    total: number
    jobs: JobInfo[]
  }) {
    fs.writeFileSync(`data/${this.data_file_name}.json`, JSON.stringify(data, null, 2))
  }


  async wait_el_visable(selector: string, el_father: WebDriver | WebElement = this.driver, save_error = true, timeout: number = 1000): Promise<WebElement | null> {

    let el: WebElement | null = null

    try {
      const el_located = until.elementLocated(By.css(selector))
      await this.driver.wait(el_located, timeout);

      el = await el_father.findElement(By.css(selector))
      const el_visable = until.elementIsVisible(el)
      await this.driver.wait(el_visable, timeout);
    } catch (err) {
      if (save_error) {
        console.error(`---元素没找到 "${selector}"`, err);
        await this.save_err_log(`selector not found ${selector}`)
      }
    } finally {
      return el
    }
  }


  async getTextOrDefault(selector: string, el_father: WebElement | WebDriver = this.driver): Promise<string> {
    const el = await this.wait_el_visable(selector, el_father)
    return el === null ? '' : el.getText()
  }

  async get_job_info_by_job_card(job_card: WebElement, job_info_list: JobInfo[]) {
    try {
      console.log('----获取卡片信息');
      await this.simulate_human_scroll(job_card)
      // 滚动元素到视口内
      // await this.driver.executeScript("arguments[0].scrollIntoView(true);", job_card);

      // 获取卡片上的信息
      const job_name = await this.getTextOrDefault('span.job-name', job_card);
      const areaBusiness = await this.getTextOrDefault('span.job-area', job_card);
      const salary = await this.getTextOrDefault('span.salary', job_card);
      const experience = await this.getTextOrDefault('ul.tag-list li:nth-child(1)', job_card);
      const degree = await this.getTextOrDefault('ul.tag-list li:nth-child(2)', job_card);
      // 这个标签很容易报错,改在详情页获取
      // const boss_job = await this.getTextOrDefault('div.info-public em', job_card);
      // const boss_info = (await this.getTextOrDefault('div.info-public', job_card)).split('\n')[0];
      // const boss_name = boss_info.split(boss_job)[0]
      const company_name = await this.getTextOrDefault('h3.company-name a', job_card);
      const company_logo = await (await job_card.findElement(By.css('div.company-logo img'))).getAttribute('src');


      let company_kind = ''
      let company_listing = '无阶段'
      let company_size = ''

      const company_info = await job_card.findElements(By.css('ul.company-tag-list li'))
      if (company_info.length === 3) {
        company_kind = await company_info[0].getText()
        company_listing = await company_info[1].getText()
        company_size = await company_info[2].getText()
      }
      else {
        company_kind = await company_info[0].getText()
        company_size = await company_info[1].getText()
      }

      const job_info: JobInfo = {
        job_name,
        areaBusiness,
        salary,
        experience,
        degree,
        // boss_name,
        company_name,
        company_logo,
        company_kind,
        company_listing,
        company_size,
        boss_job:'',
        key_words: [],
        boss_active_time: '',
        detail: ''
      };


      // 获取详情页上的信息
      await job_card.click();
      const handles = await this.driver.getAllWindowHandles();
      await this.driver.switchTo().window(handles[1]); // 切换详情页标签
      console.log('----切换详情页标签');

      await this.sleep(5000, 10000)

      // console.log('--------------', await this.driver.getCurrentUrl());


      await this.wait_el_visable('ul.job-keyword-list') // 关键字el
      await this.wait_el_visable('div.job-detail-section div.job-sec-text:nth-child(4)') // 详情el

      const boss_info_el = await this.wait_el_visable('.boss-info-attr')
      const boss_info_text = await (boss_info_el as WebElement).getText()
      job_info.boss_job = boss_info_text.split('·')[1]
      
      const key_words_text = await this.getTextOrDefault('ul.job-keyword-list')
      const key_words = key_words_text.split('\n')

      job_info.key_words.push(...key_words)

      const boss_avatar = await this.wait_el_visable('.detail-figure')
      await this.simulate_human_scroll(boss_avatar as WebElement)

      const boss_active_time = await this.driver.findElements(By.css('span.boss-active-time'))
      if (boss_active_time.length > 0) {
        job_info.boss_active_time = await boss_active_time[0].getText()
      }
      const boss_online = await this.driver.findElements(By.css('span.boss-online-tag'))

      if (boss_online.length > 0) {
        job_info.boss_active_time = '刚刚活跃'
      }

      job_info.detail = await this.getTextOrDefault('div.job-detail-section div.job-sec-text:nth-child(4)');


      // 切回列表页
      await this.driver.close();
      await this.driver.switchTo().window(handles[0]);
      await this.check_need_verify()
      await this.sleep(3000, 5000)

      job_info_list.push(job_info)
      console.log('------current params get job: ', job_info_list.length);

    } catch (e) {
      await this.save_err_log(`get_job_info\n${JSON.stringify(e)}`)
      console.error('---get_job_info', e);
    }
  }

  async get_jobs_from_page(job_info_list: JobInfo[]) {
    await this.wait_el_visable('ul.job-list-box li.job-card-wrapper:nth-child(1)')

    const job_cards = await this.driver.findElements(By.css('ul.job-list-box li.job-card-wrapper'));
    for (let job_card of job_cards) {
      await this.get_job_info_by_job_card(job_card, job_info_list);
    }
  }


  // 返回值为是否已到达最后一页
  async go_next_page(): Promise<boolean> {
    const next_page_bt = await this.wait_el_visable('div.options-pages a:last-of-type')
    if (next_page_bt === null) {
      return true
    }

    const bt_class_name = await next_page_bt.getAttribute('class')
    const is_disabled = bt_class_name.includes('disabled');


    if (is_disabled) {
      return true
    } else {
      await this.simulate_human_scroll(next_page_bt)
      await next_page_bt.click()
      await this.check_need_verify()
      return false
    }
  }

  // 获取当前参数下的所有页的job
  async get_jobs_by_current_params() {
    let is_finished = false
    const job_info_list: JobInfo[] = []
    let page_num = 1
    do {
      console.log('----page ', page_num);

      await this.get_jobs_from_page(job_info_list);
      is_finished = await this.go_next_page()
      await this.sleep(3000, 5000)
      page_num += 1
    } while (!is_finished)

    this.save_data({
      experience: this.params.experience,
      degree: this.params.degree,
      areaBusiness: this.params.areaBusiness,
      total: job_info_list.length,
      jobs: job_info_list
    })
  }

  async hide_annoy_el() {
    // 隐藏在未登录状态下,不定时弹出来的登录弹框
    const el_login_pop = await this.wait_el_visable('div.boss-login-dialog', this.driver, false)
    if (el_login_pop !== null) {
      await this.driver.executeScript(`arguments[0].style.display = 'none';`, el_login_pop)
    }
    // await this.driver.executeScript(`
    //     const dialog = document.querySelector('div.boss-login-dialog');
    //     if(dialog !== null) {
    //       dialog.style.display = 'none';
    //     }
    //   `);

    //隐藏列表页,中间的二维码横条
    const el_weixincode = await this.wait_el_visable('div.subscribe-weixin-wrapper', this.driver, false)
    if (el_weixincode !== null) {
      await this.driver.executeScript(`arguments[0].style.display = 'none';`, el_weixincode)
    }

    // 隐藏列表页的搜索浮框和header
    const el_search = await this.wait_el_visable('div.job-search-wrapper', this.driver, false)
    if (el_search !== null) {
      await this.driver.executeScript(`arguments[0].style.display = 'none';`, el_search)
    }
    const el_header = await this.wait_el_visable('#header', this.driver, false)
    if (el_header !== null) {
      await this.driver.executeScript(`arguments[0].style.display = 'none';`, el_header)
    }
  }


  async get_all_job() {
    this.create_log_file()


    const url = 'http://www.zhipin.com/web/geek/job?query=&page=1'
    // const url = 'http://www.bilibili.com'
    await this.driver.get(url)
    await this.driver.executeScript(`Object.defineProperty(navigator, 'webdriver', { get: () => undefined });`)
    await this.sleep(5000, 10000)



    for (let [areaBusiness_key, areaBusiness_info] of Object.entries(areabussiness_map.value)) {
      for (let [experience_key, experience_info] of Object.entries(experience_map.value)) {
        for (let [degree_key, degree_info] of Object.entries(degree_map.value)) {
          const current_params: Params = {
            areaBusiness: areaBusiness_key,
            experience: experience_key,
            degree: degree_key
          }
          this.update_params(current_params)
          this.data_file_name = `${areaBusiness_info}-${experience_info}-${degree_info}`

          const url = this.generate_url_by_params()
          console.log('---new params-----', this.data_file_name);

          await this.driver.get(url);
          await this.check_need_verify()

          // const login_after_ban = await this.check_ip_ban()
          // if (login_after_ban) {
          //   // 因为登录后,会重定向页面,所以重新请求
          //   await this.driver.get(url);
          // }

          await this.sleep(5000, 10000)
          // await this.hide_annoy_el()

          // 空页判断
          const res = await this.wait_el_visable('ul.job-list-box li.job-card-wrapper:nth-child(1)')
          if (res === null) continue

          await this.get_jobs_by_current_params()
        }
      }
    }
    this.driver.quit()
  }
}




(async function main() {

  const options = new chrome.Options();
  options.addArguments("--ignore-certificate-errors");


  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  const c = new Crawler(driver)
  c.get_all_job()

})();
