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

db.sets.where('name').equals('amount').toArray().then((amount) => {
    if (amount.length === 0) {
        db.sets.add({name: 'amount', content: 1});
    }

});
db.sets.where('name').equals('interval').toArray().then((interval) => {
    if (interval.length === 0) {
        db.sets.add({name: 'interval', content: 5});
    }
});

db.sets.where('name').equals('fontSize').toArray().then((fontSize) => {
    if (fontSize.length === 0) {
        db.sets.add({name: 'fontSize', content: 80});
    }
});

db.sets.where('name').equals('isRepeat').toArray().then((isRepeat) => {
    if (isRepeat.length === 0) {
        db.sets.add({name: 'isRepeat', content: true});
    }
});