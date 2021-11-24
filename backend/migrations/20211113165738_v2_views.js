exports.up = async function(knex) {
  await knex.schema.raw(`
    create or replace view v2_pr_stats_per_repo_per_week as (
      with stats as (
        select
          owned_by,
          repo_name,
          date_trunc('week', merged_at) as date,
          percentile_disc(0.99) within group (order by merged_at - opened_at) as p99_time_to_merge,
          percentile_disc(0.95) within group (order by merged_at - opened_at) as p95_time_to_merge,
          percentile_disc(0.90) within group (order by merged_at - opened_at) as p90_time_to_merge,
          percentile_disc(0.50) within group (order by merged_at - opened_at) as p50_time_to_merge,
          count(*) as merge_throughput
        from v2_merged_pull_requests
        where exists(
          select 1 from gh_org_memberships
          where
            (auth.uid()  = gh_org_memberships.user_id or user='postgres')
            and owned_by = any(gh_org_memberships.org_slugs)
        )
        group by owned_by, repo_name, date_trunc('week', merged_at)
      )
      select owned_by, repo_name, json_agg(stats order by date asc) as stats
      from stats
      group by owned_by, repo_name
    );
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
    drop view v2_pr_stats_per_repo_per_week;
  `)
};



