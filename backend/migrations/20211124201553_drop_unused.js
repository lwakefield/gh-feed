exports.up = async function(knex) {
  await knex.schema.raw(`
    drop table v2_opened_pull_requests;
    drop view v1_pr_stats_per_repo_per_day;
    drop view v1_pr_stats_per_repo_per_week;
    drop view v1_time_to_merge;
    drop view v1_opened_pull_requests;
    drop view v1_merged_pull_requests;
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
  `)
};
