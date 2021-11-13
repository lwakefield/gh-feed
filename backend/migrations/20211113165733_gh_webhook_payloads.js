
exports.up = async function(knex) {
  await knex.schema.raw(`
    create table gh_webhook_payloads (
      id         uuid default uuid_generate_v4() primary key,
      created_at timestamptz not null default now(),
      headers    jsonb not null,
      body       jsonb not null
    );
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
    drop table gh_webhook_payloads;
  `)
};
