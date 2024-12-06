import { MongoClient } from 'mongodb'
import jsondb from '../../crawler/data/index'

const uri = "mongodb://localhost:27017/"

const client = new MongoClient(uri);


async function jsonSaveToDB() {
  try {
    const database = client.db('bossDB');
    const jobsCollection = database.collection('jobs');

    const jobs = []

    for(let json of jsondb) {
      const areaBusinessId = json.areaBusiness
      const degreeId = json.degree
      const experienceId = json.experience
      for (let job of json.jobs) {
        job.areaBusinessId = areaBusinessId
        job.degreeId = degreeId
        job.experienceId = experienceId
        jobs.push(job)
      }
    }

    const res = await jobsCollection.insertMany(jobs)
    console.log(res);
  } finally {
    await client.close();
  }
}
jsonSaveToDB().catch(console.dir);