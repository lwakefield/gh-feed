exports.up = async function(knex) {
  await knex.schema.raw(`
    create table gh_webhook_payloads (
      id         uuid default uuid_generate_v4() primary key,
      created_at timestamptz not null default now(),
      headers    jsonb not null,
      body       jsonb not null
    );
    create index on gh_webhook_payloads using gin ( headers );
    create index on gh_webhook_payloads using gin ( body );
    create index on gh_webhook_payloads using gin (( body #> '{repository,owner,login}' ));
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
    drop table gh_webhook_payloads;
  `)
};
