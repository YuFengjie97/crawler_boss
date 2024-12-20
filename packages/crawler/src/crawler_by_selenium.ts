import { By, Builder, Browser, WebElement, WebDriver, until } from "selenium-webdriver";
import fs from 'fs'
import { type JobInfo } from '../types/index'
import { type Params, areabussiness_map, degree_map, experience_map } from '../params/index'
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


  create_data_file() {
    const data = {
      ...this.params,
      jobs: []
    }
    fs.writeFileSync(`data/${this.data_file_name}.json`, JSON.stringify(data, null, 2))
  }

  save_job(job: JobInfo) {
    try {
      const res = fs.readFileSync(`data/${this.data_file_name}.json`, 'utf-8')
      const data = JSON.parse(res)
      data.jobs.push(job)
      fs.writeFileSync(`data/${this.data_file_name}.json`, JSON.stringify(data, null, 2))
      console.log(`写入数据success,${this.data_file_name}`);
    } catch (e) {
      console.log(`写入数据fail,${this.data_file_name}`,e);
    }
  }


  async sleep(time_min: number = 1000, time_max = time_min) {
    const random_time = time_min + (time_max - time_min) * Math.random()
    console.log(`sleep ${random_time}ms`);

    await this.driver.sleep(random_time)
  }

  async simulate_human_scroll(target_el: WebElement) {

    const { y } = await target_el.getRect()
    const view_height = Number(await this.driver.executeScript('return innerHeight'))
    const target_scroll_min = y - 300 // 200是遮挡搜索框的高度 + 100微信码横条高度
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
      await this.sleep(100, 300)
    }

    console.log('人工滚动完毕');
    await this.sleep(1000, 1500)
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

  // 未登录/登录状态,都有可能被检测出异常请求的ip
  async check_need_verify() {
    const res = await this.wait_el_visable('.page-verify-slider', this.driver, false)
    if (res !== null) {
      console.log('需要在20秒内完成人工认证');
      await this.sleep(20000)
      await this.check_need_verify()
    }
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
        await this.save_err_log(`---元素没找到  ${selector}`)
      }
    } finally {
      return el
    }
  }


  async getTextOrDefault(selector: string, el_father: WebElement | WebDriver = this.driver): Promise<string> {
    const el = await this.wait_el_visable(selector, el_father)
    return el === null ? '' : await el.getText()
  }

  async get_job_info_by_job_card(job_card: WebElement) {
    try {
      console.log('----获取卡片信息');

      // 获取卡片上的信息
      const job_name = await this.getTextOrDefault('span.job-name', job_card);
      const areaBusiness = await this.getTextOrDefault('span.job-area', job_card);
      const salary = await this.getTextOrDefault('span.salary', job_card);
      const experience = await this.getTextOrDefault('ul.tag-list li:nth-child(1)', job_card);
      const degree = await this.getTextOrDefault('ul.tag-list li:nth-child(2)', job_card);
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
      const card_url = await this.driver.getCurrentUrl()

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
        boss_job: '',
        key_words: [],
        boss_active_time: '',
        detail: '',
        page: '1',
        card_url,
        detail_url: ''
      };

      const url = new URL(await this.driver.getCurrentUrl())
      const page = url.searchParams.get('page')
      job_info.page = page !== null ? page : '1'


      // 获取详情页上的信息
      await job_card.click();
      const handles = await this.driver.getAllWindowHandles();
      await this.driver.switchTo().window(handles[1]); // 切换详情页标签
      console.log('----切换详情页标签');
      await this.before_page()
      job_info.detail_url = await this.driver.getCurrentUrl()


      const boss_info_el = await this.wait_el_visable('.boss-info-attr')
      const boss_info_text = await (boss_info_el as WebElement).getText()
      job_info.boss_job = boss_info_text.split('·\n')[1]

      const key_words_text = await this.getTextOrDefault('ul.job-keyword-list')
      const key_words = key_words_text.split('\n')

      job_info.key_words.push(...key_words)


      const boss_active_time = await this.driver.findElements(By.css('span.boss-active-time'))
      if (boss_active_time.length > 0) {
        job_info.boss_active_time = await boss_active_time[0].getText()
      }
      const boss_online = await this.driver.findElements(By.css('span.boss-online-tag'))

      if (boss_online.length > 0) {
        job_info.boss_active_time = '刚刚活跃'
      }

      job_info.detail = await this.getTextOrDefault('div.job-detail-section div.job-sec-text');

     
      console.log('------current params get job: ');

      this.save_job(job_info)


      // 切回列表页
      await this.driver.close();
      await this.driver.switchTo().window(handles[0]);

    } catch (e) {
      await this.save_err_log(`get_job_info\n${JSON.stringify(e)}`)
      console.error('---get_job_info', e);
    }
  }


  async go_next_page(): Promise<boolean> {
    const next_page_bt = await this.wait_el_visable('div.options-pages a:last-of-type')

    if (next_page_bt === null) {
      return true
    }

    const bt_class_name = await next_page_bt.getAttribute('class')
    const is_disabled = bt_class_name.includes('disabled');

    if (next_page_bt !== null && !is_disabled) {
      next_page_bt.click()
      return false
    }
    return true
  }


  // 获取当前参数下的所有页的job
  async get_jobs_by_current_params(start_page = 1) {
    let page_num = 1
    while (page_num < start_page) {
      console.log('----page ', page_num);
      await this.go_next_page()
      page_num += 1
      await this.sleep(5000)
    }

    do {
      console.log('----page ', page_num);
      const job_cards = await this.driver.findElements(By.css('ul.job-list-box li.job-card-wrapper'));

      for (let job_card of job_cards) {
        await this.get_job_info_by_job_card(job_card);
      }

      const is_finished = await this.go_next_page()
      page_num += 1
      if (is_finished) break

      await this.before_page()
    } while (true)
  }

  async hide_annoy_el() {
    // 隐藏在未登录状态下,不定时弹出来的登录弹框
    const el_login_pop = await this.wait_el_visable('div.boss-login-dialog', this.driver, false)
    if (el_login_pop !== null) {
      await this.driver.executeScript(`arguments[0].style.display = 'none';`, el_login_pop)
    }

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

  async before_page() {
    try {
      await this.sleep(5000)
      await this.driver.executeScript(`Object.defineProperty(navigator, 'webdriver', { get: () => undefined });`)
      await this.check_need_verify()
      await this.close_dialog()
      await this.sleep(5000, 10000)
    } catch (e) {
      this.save_err_log('--before_page--\n' + JSON.stringify(e))
    }
  }
  async close_dialog() {
    const dialog = await this.wait_el_visable('.boss-login-dialog', this.driver, false)
    if (dialog !== null) {
      const close_bt = await this.wait_el_visable('.boss-login-close', dialog, false)
      close_bt?.click()
      console.log('------------------关闭登录弹框');
      await this.sleep(500, 1000)
    }
  }


  async check_proxy_work() {
    try {
      await this.driver.get('https://www.zhipin.com/web/geek/job?query=')
      const flag = this.wait_el_visable('.job-list-box li:nth_child(1)', this.driver, false, 10000)
      if (flag !== null) return true
      return false
    } catch (e) {
      console.log('---------', e);
      return false
    }
  }
  async get_all_job() {

    this.create_log_file()
    const res = fs.readFileSync('data/complete.json', 'utf-8')
    const complete = JSON.parse(res)
    let start_page = Number(complete.quit_page)
    const complete_arr = complete.arr
    console.log(start_page)
    console.log(complete_arr)
    


    for (let [areaBusiness_key, areaBusiness_info] of Object.entries(areabussiness_map.value)) {
      for (let [experience_key, experience_info] of Object.entries(experience_map.value)) {
        for (let [degree_key, degree_info] of Object.entries(degree_map.value)) {
          const current_params: Params = {
            areaBusiness: areaBusiness_key,
            experience: experience_key,
            degree: degree_key
          }
          const complete_id = `${areaBusiness_key}_${experience_key}_${degree_key}`
          if(complete_arr.includes(complete_id)){
            continue
          }

          this.update_params(current_params)
          this.data_file_name = `${areaBusiness_info}-${experience_info}-${degree_info}`
          // 续写,不需要新建
          if(start_page === 1) {
            this.create_data_file()
          }

          const url = this.generate_url_by_params()
          console.log('---new params-----', this.data_file_name, '\n');

          await this.driver.get(url);
          await this.before_page()


          await this.get_jobs_by_current_params(start_page)
          // 续写完毕,重置起始页
          start_page = 1

          complete_arr.push(complete_id)
          fs.writeFileSync('data/complete.json', JSON.stringify({
            quit_page: 1,
            arr: complete_arr
          }, null, 2))
        }
      }
    }
    this.driver.quit()
  }
}

(async function main() {

  const options = new chrome.Options();

  options.addArguments("--ignore-certificate-errors");
  options.addArguments("--disable-blink-features=AutomationControlled");
  // options.addArguments('--headless', '--disable-gpu', '--window-size=1920,1080');
  // options.addArguments('--disable-blink-features=AutomationControlled');

  // const res = await get_proxy()
  // const proxy = res.data

  // const tunnelHost = 'a209.kdltps.com'
  // const tunnelPort = '15818'
  // const proxy = `${tunnelHost}:${tunnelPort}`
  // options.addArguments(`--proxy-server=http://${proxy}`);

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  const c = new Crawler(driver)
  await c.get_all_job()

  // await c.driver.get('http://www.bilibili.com')
  // await c.sleep(5000)
  // const el = await c.wait_el_visable('.bili-video-card__cover')
  // console.log('----------',el);

})();
