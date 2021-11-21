exports.up = async function(knex) {
  await knex.schema.raw(`
    insert into v2_opened_pull_requests
    select
      uuid_generate_v4() as id,
      now() as created_at,
      owned_by,
      repo_name,
      pull_request_number,
      pull_request_title,
      opened_by,
      opened_at
    from v1_opened_pull_requests
    where opened_at < '2021-11-21T17:40:22.464Z';

    insert into v2_merged_pull_requests
    select
      uuid_generate_v4() as id,
      now() as created_at,
      owned_by,
      repo_name,
      pull_request_number,
      pull_request_title,
      merged_by,
      merged_at,
      num_commits,
      num_lines_added,
      num_lines_deleted,
      num_changed_files,
      num_comments
    from v1_merged_pull_requests
    where merged_at < '2021-11-21T17:40:22.464Z';
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
  `)
};



