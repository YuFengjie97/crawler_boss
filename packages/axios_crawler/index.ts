import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://www.zhipin.com/wapi/zpgeek/',
  headers: {
    'cookie': 'ab_guid=0e404819-c119-4b6e-9bef-266a7dff3b5a; lastCity=101010100; __g=-; Hm_lvt_194df3105ad7148dcf2b98a91b5e727a=1732779252,1732779550,1732795981,1732847300; HMACCOUNT=A53F18CD8D77DB48; __zp_seo_uuid__=2e21bd93-0ff8-4f1e-aa87-ca9823d7113d; __l=r=https%3A%2F%2Fwww.bing.com%2F&l=%2F&s=1; __c=1732846554; __a=76799112.1732599225.1732844493.1732846554.172.11.27.172; Hm_lpvt_194df3105ad7148dcf2b98a91b5e727a=1732856880; __zp_stoken__=6919fw4VWw58MOA4GD3MKVklUwr1HwoDCtMKjwrzCqMKyX2pCYG3Cv03Cv1dFwo1UwqhYwrDCqcKQwq3CrlHCgkPCkEPCrVHDv8KzwpZKwqxRwpXElsOpwrzCj8Kawr%2FCtsKUNS8HBRAFBxAKBwoQBAYCDw0HBRAFBwYEEQQGOSvCijs3NkE7KE1NTw1MXF9GWEgCWUdMNjgLEAQGOCo2OzY0wrtRw4HDoMK7S8K0w5XDgUvCuSQ7PjQ0wrVaIyMGAhgiwrcwAsOAFQjCtMO6D8OGXX9pUMK2w4wwNEHCtsS1OzUdQDc3P0A1PDc1LTUYw4RfeGlHwrcfMDYXPzVAPDk3NUA6Nz0pQD40JTU7JjsIBBANDCZAwr%2FCvMK0w5w1QA%3D%3D; SERVERID=669c12b6205dadc4b25f7f10ddc9cc19|1732857208|1732846553',
    'referer': 'https://www.zhipin.com/web/geek/job?city=101010100',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  }
})

instance.get('search/joblist.json?scene=1&query=&city=101010100&experience=&payType=&partTime=&degree=&industry=&scale=&stage=&position=&jobType=&salary=&multiBusinessDistrict=&multiSubway=&page=1&pageSize=30').then(res => {
  const zpData = res.data.zpData
  console.log(zpData);
  
  const joblist = zpData.joblist
  joblist.forEach(job => {
    console.log(job);
  });
})