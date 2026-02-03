declare module 'unix-sqlcipher' {
    import { sqlite3 } from 'sqlite3';
    const content: sqlite3;
    export default content;
    export function verbose(): sqlite3;
}