const { db } = require('../../../db');

class StatsService {
  constructor(database = db) {
    this.db = database;
  }

  async stats() {
    const [result] = await db('subjects')
      .select(db.raw('count(subjects.id) as consented'))
      .join('subject_keys', 'subjects.id', 'subject_keys.subject_id');
    const consentedSubjectCount = parseInt(result.consented, 10);

    const [result2] = await db('subjects').select(db.raw('count(subjects.id) as total'));
    const totalSubjectCount = parseInt(result2.total, 10);

    const unconsentedSubjectCount = totalSubjectCount - consentedSubjectCount;

    const controllerData = {
      consented: consentedSubjectCount,
      unconsented: unconsentedSubjectCount,
      total: totalSubjectCount
    };

    const processorsWithSubjectCount = await db('subjects')
      .join('subject_processors', 'subjects.id', 'subject_processors.subject_id')
      .groupBy('subject_processors.processor_id')
      .select(db.raw('count(subjects.id) as subject_count'))
      .select('subject_processors.processor_id');

    const processorData = processorsWithSubjectCount.reduce((current, processor) => {
      current[processor.processor_id] = { consented: parseInt(processor.subject_count, 10) };
      return current;
    }, {});

    return {
      controller: controllerData,
      processors: processorData
    };
  }
}

module.exports = StatsService;
