

import * as sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { addUser, addWebConfig, createTable } from './handle-database';

const __dirname = dirname(fileURLToPath(import.meta.url));
const parent = dirname(__dirname)

sqlite3.verbose();

const dbPath = join(parent, 'db', 'freelance_customer.sqlite');

// Enable verbose mode for better debugging
const db = new sqlite3.Database(dbPath,(err)=>{
  if (err) {
    console.log("err",err.message,dbPath)
  } else {
    /*createTable();*/
    //addUser()
    /*addWebConfig()*/
    console.log("connxion ok")
  }
});
//console.log("db",db)
export default db

