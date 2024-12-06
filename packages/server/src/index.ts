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


app.listen(port, () => {
  console.log(`服务启动 ${port}`)
})