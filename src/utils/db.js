import Dexie from 'dexie';

export const db = new Dexie('roll');
db.version(1).stores({
    //内容表
    contents: '++id, content, type',
    //记录表
    records: '++id, round, record, type',
    //剩余内容表
    residual: '++id, content, type',
    //系统设置
    sets: 'name, content',
});

const amount = await db.sets.where('name').equals('amount').toArray();
if (amount.length === 0) {
    await db.sets.add({name: 'amount', content: 1});
}

const interval = await db.sets.where('name').equals('interval').toArray();
if (interval.length === 0) {
    await db.sets.add({name: 'interval', content: 5});
}

const fontSize = await db.sets.where('name').equals('fontSize').toArray();
if (fontSize.length === 0) {
    await db.sets.add({name: 'fontSize', content: 80});
}

const isRepeat = await db.sets.where('name').equals('isRepeat').toArray();
if (isRepeat.length === 0) {
    await db.sets.add({name: 'isRepeat', content: true});
}