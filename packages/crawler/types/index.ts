
export  interface JobInfo {
    job_name: string
    areaBusiness: string // 地区
    salary: string
    experience: string // 工作时间
    degree: string // 学历
    // boss_name: string
    boss_job: string
    company_name: string
    company_logo: string
    company_kind: string
    company_listing: string
    company_size: string
    key_words: string[]
    boss_active_time: string
    detail: string
    page: string // 所属页,异常中断时记录中断页数
    card_url: string
    detail_url: string
  }