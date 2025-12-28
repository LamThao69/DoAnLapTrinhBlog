/******
 * Knex migration: create initial schema
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('email',255).notNullable().unique();
    table.string('password_hash',255).notNullable();
    table.string('full_name',255);
    table.integer('birth_year');
    table.text('address');
    table.string('phone',30);
    table.enu('role',['user','admin']).notNullable().defaultTo('user');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true,true);
  });

  await knex.schema.createTable('categories', table => {
    table.increments('id').primary();
    table.string('name',120).notNullable().unique();
    table.string('slug',150).notNullable().unique();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('posts', table => {
    table.increments('id').primary();
    table.integer('author_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
    table.string('title',255).notNullable();
    table.string('slug',255).notNullable().unique();
    table.text('excerpt');
    table.text('content').notNullable();
    table.enu('status',['draft','published','hidden']).notNullable().defaultTo('published');
    table.dateTime('published_at');
    table.integer('view_count').unsigned().defaultTo(0);
    table.timestamps(true,true);
  });

  await knex.schema.createTable('comments', table => {
    table.increments('id').primary();
    table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('parent_comment_id').unsigned().references('id').inTable('comments').onDelete('SET NULL');
    table.text('content').notNullable();
    table.boolean('is_approved').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('saved_posts', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    table.timestamp('saved_at').defaultTo(knex.fn.now());
    table.unique(['user_id','post_id']);
  });

  await knex.schema.createTable('password_resets', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token',255).notNullable().unique();
    table.dateTime('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Indexes
  await knex.raw("CREATE INDEX idx_posts_status_published_at ON posts (status, published_at)");
  await knex.raw("CREATE INDEX idx_users_email ON users (email)");
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('password_resets');
  await knex.schema.dropTableIfExists('saved_posts');
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('posts');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
};
