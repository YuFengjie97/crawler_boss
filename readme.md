# crawler boss

## 使用selenium爬取(node.js version需要18)
```
pnpm run cs
```

## json转mongodb数据库
> 本来可以在爬取过程中,存入数据库,转数据库是后来心血来潮加上的
```
pnmp run json_to_db
```

## 启动后端服务
```
pnpm run serve
```

## 饼图分析
```
pnpm run dev
```

## 项目目录

```
crawler_boss
└─packages
     ├─analytics 前端饼图分析
     ├─crawler 爬虫
     └─server node后端服务
```

## 最后差不多长这个样子
![Alt text](image.png)
![Alt text](image-1.png)


## 开发流水账

> boss直聘爬虫,一开始是想直接axios模拟前端请求,但是他里面加了防爬的token.太鸡巴麻烦,么得调试.

> 机缘巧合下得知selenium,还有js的版本.这个本来是给高级点点点工程师做的自动化测试,然后查了查,可以做爬虫,开搞

> 流程:每个url页面都有搜索词,地区,经验,学历这种对用boss列表搜索框的参数.就根据这个去每个关键情况新开页面爬取.因为列表页和切页都是ajax异步加载,所以没必要重新加载页面.selenium找到下一页按钮,模拟点击来翻页

> 我想爬工作的详情页,因为可以看到工作详情里隐藏起来的东西,比如:劳务派遣,人力,驻场,985,211,这种外包吸血或是学历歧视的关键词.还有boss的活跃时间.这样最后在dev用echart就可以统计现在到底有多少外包公司,到底有多少吸血的,到底有多少学历歧视的

> 加了随机延时也没用,ip被封了,要登录,我天真的以为登录后,可以一直爬,无非是弹几个弹框遮挡关键dom元素(先给隐藏掉,就可以用selenium继续获取关键元素了).登录之后,爬了几个关键词,账号给封了.

> 于是,先帝创业未半,而中道崩殂.ip封是一天,账号封,不知道过多久解封.反正也找不到工作.哦呼,真是完蛋

> 反思一下,为什么用selenium这种唤起浏览器的测试工具都会被检测出来.
1. boss直聘会记录用户鼠标行为,然后发送服务端,判断是不是机器人
2. 周期请求数量判断,如果一段时间请求数量太多,或者连续请求,会被识别出来,我被封之前,每个请求的动作都会有3-5s的sleep.太长了,我就接受不了了,太鸡巴慢了
3. selenium给加随机滚动页面,随机鼠标点击,太麻烦,而且好像会导致之前获取到的webElement引用失效.唉~~~~~,好麻烦,好不想做啊.

> 后期还想着把爬到的数据部署到githubPage上,全他妈完了,美好的愿望落空

> ip,解封了,账号也解封了,但是不能再冒着永久封号的风险用登录了.屏蔽掉所有登录等待

> boss直聘每次进新页面,总是会自动切到`/web/common/security-check.html`这个地址,在目标地址之间来回切换,像是不停刷新一样,一开始我还以为是selenium的问题,看html名字猜想是检测出爬虫,在上报数据,但是没有立即封掉,也是请求数达到一定数量,重定向验证页面`/web/user/safe/verify-slider`,可以直接不去爬detail页面的信息来减少请求,但是详情和boss活跃时间,我特别想要.因为不能说的话都在这两个字段里了

> 只爬取卡片列表页,一次也没有报需要验证的页面,而且,我把模拟人为滚动也禁掉了.也没有报.即使,刷新页面重定向`/web/common/security-check.html`也没有报需要验证.全部参数请求是3x3x16---3x3x16x10.差不多是两个钟头内完成的,最差情况请求了1440次/2h.请求次数的限制主要击中在详情页,可以认为,boss的爬虫策略不需要模拟人为滚动

> 用过快代理的试用ip,太慢了,比本地ip慢太多了,而且容易被封.不知道是不是boss可以检测ip是不是代理ip.调试的时候发现只要多等一会,无登录的状态下,也不会弹人类认证,模模糊糊感觉对ip的请求频繁度有三个临界,1弹出登录框,2跳转人类验证页面,3ip异常请求登录,4账号请求异常

> ip又被封了,这次爬的比较多