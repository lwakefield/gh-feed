exports.up = async function(knex) {
  await knex.schema.raw(`
    create table v2_opened_pull_requests (
      id                  uuid default uuid_generate_v4() primary key,
      created_at          timestamptz not null default now(),
      owned_by            text not null,
      repo_name           text not null,
      pull_request_number int not null,
      opened_by           text not null,
      opened_at           timestamptz not null
    );
    create index on v2_opened_pull_requests(owned_by);
    create index on v2_opened_pull_requests(repo_name);
    create index on v2_opened_pull_requests(pull_request_number);
    create index on v2_opened_pull_requests(opened_by);
    create index on v2_opened_pull_requests(opened_at);

    create table v2_merged_pull_requests (
      id                  uuid default uuid_generate_v4() primary key,
      created_at          timestamptz not null default now(),
      owned_by            text not null,
      repo_name           text not null,
      pull_request_number int not null,
      merged_by           text not null,
      merged_at           timestamptz not null,
      num_commits         int not null,
      num_lines_added     int not null,
      num_lines_deleted   int not null,
      num_changed_files   int not null,
      num_comments        int not null
    );
    create index on v2_merged_pull_requests(owned_by);
    create index on v2_merged_pull_requests(repo_name);
    create index on v2_merged_pull_requests(pull_request_number);
    create index on v2_merged_pull_requests(merged_by);
    create index on v2_merged_pull_requests(merged_at);
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
    drop table v2_opened_pull_requests;
    drop table v2_merged_pull_requests;
  `)
};


