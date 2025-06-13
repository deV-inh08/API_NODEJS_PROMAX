import mongoose from "mongoose";
import os from 'os'
import process from "process";

const _SECONDS = 10000

// check connect
const countConnect = () => {
  const numConnection = mongoose.connections.length
  console.log(`Number of connection: ${numConnection}`);
  return numConnection
}

// check overload connect
const checkOverLoad = () => {
  // monitor 5s
  setInterval(() => {
    const numConnection = countConnect()
    const numsCore = os.cpus().length
    const memoryUsage = process.memoryUsage().rss
    // Example maximum number of connection based on number of cores

    console.log('numsCore', numsCore);
    // 1 core - 5 connects
    const maxConnections = numsCore * 5

    console.log(`Memory usage:: ${memoryUsage / 1024 / 1024} MB`);



    if (numConnection > maxConnections) {
      console.log(`Connection overload  detected !`);
    }

  }, _SECONDS)
}

export {
  countConnect,
  checkOverLoad
}