/* eslint-disable camelcase */

exports.up = (pgm) => {
  // threads: add date with default now()
  pgm.addColumn('threads', {
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // comments: add date and is_delete
  pgm.addColumn('comments', {
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    is_delete: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('comments', 'is_delete');
  pgm.dropColumn('comments', 'date');
  pgm.dropColumn('threads', 'date');
};


