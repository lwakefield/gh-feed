exports.up = async function(knex) {
  await knex.schema.raw(`
    alter table knex_migrations enable row level security;
    alter table knex_migrations_lock enable row level security;
    alter table gh_webhook_payloads enable row level security;
    alter table gh_org_memberships enable row level security;
    alter table v2_merged_pull_requests enable row level security;
    alter table v2_opened_pull_requests enable row level security;

    create policy "Users can only view prs for orgs they are a part of"
    on v2_merged_pull_requests
    for select using (
      auth.uid() in (
        select user_id from gh_org_memberships
        where owned_by = any(org_slugs)
      )
    );
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
  `)
};
