

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import sqlite3 from 'sqlite3'

sqlite3.verbose();

const __dirname = dirname(fileURLToPath(import.meta.url));
const parent = dirname(__dirname)
console.log(process.env.MODE)
const dbName = process.env.MODE ? process.env.MODE === "devDocker" ? 'freelance_customer_dev_docker.sqlite' : 'freelance_customer_prod.sqlite' : 'freelance_customer_dev.sqlite'

const dbPath = join(parent, 'db', dbName);
const db = new sqlite3.Database(dbPath);

export default db

