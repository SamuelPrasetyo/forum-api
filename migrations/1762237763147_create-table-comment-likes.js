/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments',
      onDelete: 'cascade',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      onDelete: 'cascade',
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Add unique constraint to prevent duplicate likes
  pgm.addConstraint('comment_likes', 'unique_comment_user_like', {
    unique: ['comment_id', 'user_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comment_likes');
};
