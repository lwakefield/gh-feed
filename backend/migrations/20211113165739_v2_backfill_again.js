exports.up = async function(knex) {
  await knex.schema.raw(`
    alter table v2_merged_pull_requests
      add column opened_by text,
      add column opened_at timestamptz;

    update v2_merged_pull_requests
    set (opened_by, opened_at) = (
      select opened_by, opened_at from v2_opened_pull_requests
      where v2_opened_pull_requests.owned_by = v2_merged_pull_requests.owned_by
        and v2_opened_pull_requests.repo_name = v2_merged_pull_requests.repo_name
        and v2_opened_pull_requests.pull_request_number = v2_merged_pull_requests.pull_request_number
      order by opened_at asc
      limit 1
    );

    -- alter table v2_merged_pull_requests
    --   alter column opened_by set not null,
    --   alter column opened_at set not null;
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
  `)
};
