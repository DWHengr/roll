import Dexie from 'dexie';

export const db = new Dexie('roll');
db.version(1).stores({
    //内容表
    contents: '++id, content, type',
    //记录表
    records: '++id, round, record, type',
    //剩余内容表
    residual: '++id, content, type'
});
