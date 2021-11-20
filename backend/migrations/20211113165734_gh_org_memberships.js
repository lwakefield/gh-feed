exports.up = async function(knex) {
  await knex.schema.raw(`
    create table gh_org_memberships (
      user_id         uuid not null primary key,
      org_slugs  text[] not null,
      updated_at timestamptz not null default now()
    );
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
    drop table gh_org_memberships;
  `)
};


