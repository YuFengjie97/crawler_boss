import { MongoClient } from 'mongodb'
import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

const uri = "mongodb://localhost:27017/"
const client = new MongoClient(uri);

const database = client.db('bossDB');
const jobsCollection = database.collection('jobs');


app.use(cors({
  origin: 'http://localhost:4000', // 允许的来源，支持字符串或函数
  methods: ['GET', 'POST'], // 允许的 HTTP 方法
}));



app.post('/activetime', async (req, res) => {
  console.log('/activetime');
  try {
    const pipeline = [
      {
        $group: {
          _id: "$boss_active_time", // 按 boss_active_time 字段分组
          count: { $sum: 1 }        // 统计每组的数量
        }
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          _id: 0
        }
      }
    ]
    const data = await jobsCollection.aggregate(pipeline).toArray()
    res.send(data)
  } catch (e) { }
})



app.post('/companysize', async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$company_size", // 按 boss_active_time 字段分组
          count: { $sum: 1 }        // 统计每组的数量
        }
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          _id: 0
        }
      }
    ]
    const data = await jobsCollection.aggregate(pipeline).toArray()
    res.send(data)
  } catch (e) { }
})


app.post('/bossjob', async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$boss_job",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          _id: 0
        }
      }
    ]
    const data = await jobsCollection.aggregate(pipeline).toArray()
    res.send(data)
  } catch (e) { }
})


app.post('/degree', async (req, res) => {
  try {
    const pipeline = [
      {
        $set: {
          dazhuan: { $eq: ["$degree", "大专"] },
          benke: {
            $and: [
              { $eq: ["$degree", "本科"] },
              { $not: { $regexMatch: { input: "$detail", regex: /985|211/gm } } }
            ]
          },
          benke_985: {
            $and: [
              { $eq: ["$degree", "本科"] },
              { $regexMatch: { input: "$detail", regex: /985|211/gm } }
            ]
          },
          shuoshi: {
            $and: [
              { $eq: ["$degree", "硕士"] },
              { $not: { $regexMatch: { input: "$detail", regex: /985|211/gm } } }
            ]
          },
          shuoshi_985: {
            $and: [
              { $eq: ["$degree", "硕士"] },
              { $regexMatch: { input: "$detail", regex: /985|211/gm } }
            ]
          }
        }
      },
      {
        $group: {
          _id: null, // 聚合统计，不需要具体分组字段
          dazhuan_count: { $sum: { $cond: ["$dazhuan", 1, 0] } },
          benke_count: { $sum: { $cond: ["$benke", 1, 0] } },
          benke_985_count: { $sum: { $cond: ["$benke_985", 1, 0] } },
          shuoshi_count: { $sum: { $cond: ["$shuoshi", 1, 0] } },
          shuoshi_985_count: { $sum: { $cond: ["$shuoshi_985", 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0, // 隐藏 `_id` 字段
          dazhuan_count: 1,
          benke_count: 1,
          benke_985_count: 1,
          shuoshi_count: 1,
          shuoshi_985_count: 1
        }
      },{
        $project: {
          resultArray: [
            {name: '大专', value: "$dazhuan_count"},
            {name: '普通本科', value: "$benke_count"},
            {name: '985/211本科', value: "$benke_985_count"},
            {name: '普通硕士', value: "$shuoshi_count"},
            {name: '985/211硕士', value: "$shuoshi_985_count"},
          ]
        } 
      },
      { $unwind: "$resultArray" },
      { $replaceRoot: { newRoot: "$resultArray" } }
    ];
    
    const data = await jobsCollection.aggregate(pipeline).toArray()
    console.log(data);
    
    res.send(data)
  } catch (e) { }
})



app.listen(port, () => {
  console.log(`服务启动 ${port}`)
})