exports.up = async function(knex) {
  await knex.schema.raw(`
    create or replace view v1_opened_pull_requests as select
      cast(body#>>'{pull_request,number}' as int) as pull_request_number,
      body#>>'{pull_request,title}' as pull_request_title,
      cast(body#>>'{pull_request,created_at}' as timestamptz) as opened_at,
      body#>>'{repository,owner,login}' as owned_by,
      body#>>'{repository,name}' as repo_name,
      body#>>'{sender,login}' as opened_by,
      now() - cast(body#>>'{pull_request,created_at}' as timestamptz) as open_for
    from gh_webhook_payloads where
      headers->>'x-github-event' = 'pull_request'
      and body->>'action' = 'opened'
      and exists(
        select 1 from gh_org_memberships
        where
          (auth.uid()  = gh_org_memberships.user_id or user='postgres')
          and body#>>'{repository,owner,login}' = any(gh_org_memberships.org_slugs)
      );

    create or replace view v1_merged_pull_requests as select
      cast(body#>>'{pull_request,number}' as int) as pull_request_number,
      body#>>'{pull_request,title}' as pull_request_title,
      cast(body#>>'{pull_request,merged_at}' as timestamptz) as merged_at,
      body#>>'{repository,owner,login}' as owned_by,
      body#>>'{repository,name}' as repo_name,
      body#>>'{sender,login}' as merged_by
    from gh_webhook_payloads where
      headers->>'x-github-event' = 'pull_request'
      and body->>'action' = 'closed'
      and body#>'{pull_request,merged}' = 'true'
      and exists(
        select 1 from gh_org_memberships
        where
          (auth.uid()  = gh_org_memberships.user_id or user='postgres')
          and body#>>'{repository,owner,login}' = any(gh_org_memberships.org_slugs)
      );

    create or replace view v1_time_to_merge as
      select
        pull_request_number,
        v1_opened_pull_requests.pull_request_title,
        v1_opened_pull_requests.owned_by,
        v1_opened_pull_requests.repo_name,
        opened_by,
        merged_by,
        opened_at,
        merged_at,
        merged_at - opened_at as time_to_merge
      from v1_opened_pull_requests
      left join v1_merged_pull_requests using (pull_request_number)
      where exists(
        select 1 from gh_org_memberships
        where
          (auth.uid()  = gh_org_memberships.user_id or user='postgres')
          and v1_opened_pull_requests.owned_by = any(gh_org_memberships.org_slugs)
      );

    create or replace view v1_pr_stats_per_repo_per_day as
      with stats as (
        select
          owned_by,
          repo_name,
          date_trunc('day', merged_at) as date,
          avg(time_to_merge) as mean_time_to_merge,
          percentile_disc(0.99) within group (order by time_to_merge) as p99_time_to_merge,
          percentile_disc(0.95) within group (order by time_to_merge) as p95_time_to_merge,
          percentile_disc(0.90) within group (order by time_to_merge) as p90_time_to_merge,
          percentile_disc(0.50) within group (order by time_to_merge) as p50_time_to_merge,
          count(*) as merge_throughput
        from v1_time_to_merge
        group by owned_by, repo_name, date_trunc('day', merged_at)
        order by date desc
      )
      select
        owned_by,
        repo_name,
        json_agg(stats) as stats
      from stats
      group by owned_by, repo_name;

    create or replace view v1_pr_stats_per_repo_per_week as
      with stats as (
        select
          owned_by,
          repo_name,
          date_trunc('week', merged_at) as date,
          avg(time_to_merge) as mean_time_to_merge,
          percentile_disc(0.99) within group (order by time_to_merge) as p99_time_to_merge,
          percentile_disc(0.95) within group (order by time_to_merge) as p95_time_to_merge,
          percentile_disc(0.90) within group (order by time_to_merge) as p90_time_to_merge,
          percentile_disc(0.50) within group (order by time_to_merge) as p50_time_to_merge,
          count(*) as merge_throughput
        from v1_time_to_merge
        group by owned_by, repo_name, date_trunc('week', merged_at)
        order by date desc
      )
      select
        owned_by,
        repo_name,
        json_agg(stats) as stats
      from stats
      group by owned_by, repo_name;
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
    drop view v1_pr_stats_per_repo_per_day;
    drop view v1_pr_stats_per_repo_per_week;
    drop view v1_time_to_merge;
    drop view v1_opened_pull_requests;
    drop view v1_merged_pull_requests;
  `)
};

