
interface M {
  key: string
  value: {
    [k in string]: string
  }
}

export interface Params {
  experience: string
  degree: string
  areaBusiness: string
}


export const experience_map: M = {
  key: 'experience',
  value: {
    103: '1年以内',
    104: '1-3年',
    105: '3-5年',
  }
}

export const degree_map: M = {
  key: 'degree',
  value: {
    202: '大专',
    203: '本科',
    204: '硕士',
  }
}

export const areabussiness_map: M = {
  key: 'areaBusiness',
  value: {
    // 110101: '东城区',
    110102: '西城区',
    110105: '朝阳区',
    110107: '石景山',
    110106: '丰台区',
    110109: '门头沟',
    110108: '海淀区',
    110111: '房山区',
    110113: '顺义区',
    110112: '通州区',
    110115: '大兴区',
    110114: '昌平区',
    110117: '平谷区',
    110116: '怀柔区',
    110119: '延庆区',
    110118: '密云区',
  }
}
