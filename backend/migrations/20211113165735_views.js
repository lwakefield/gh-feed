exports.up = async function(knex) {
  await knex.schema.raw(`
    create or replace view v1_opened_pull_requests as select
      cast(body#>>'{pull_request,number}' as int) as pull_request_number,
      cast(body#>>'{pull_request,created_at}' as timestamptz) as opened_at,
      body#>>'{repository,owner,login}' as owned_by,
      body#>>'{repository,name}' as repo_name,
      body#>>'{sender,login}' as opened_by
    from gh_webhook_payloads where
      headers->>'x-github-event' = 'pull_request'
      and body->>'action' = 'opened'
      and exists(
        select 1 from gh_org_memberships
        where
          auth.uid()  = gh_org_memberships.user_id
          and body#>>'{repository,owner,login}' = any(gh_org_memberships.org_slugs)
      );

    create or replace view v1_merged_pull_requests as select
      cast(body#>>'{pull_request,number}' as int) as pull_request_number,
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
          auth.uid()  = gh_org_memberships.user_id
          and body#>>'{repository,owner,login}' = any(gh_org_memberships.org_slugs)
      );

    create or replace view v1_time_to_merge as
      select
        pull_request_number,
        v1_opened_pull_requests.owned_by,
        v1_opened_pull_requests.repo_name,
        opened_at,
        merged_at,
        merged_at - opened_at as time_to_merge
      from v1_opened_pull_requests
      left join v1_merged_pull_requests using (pull_request_number)
      where exists(
        select 1 from gh_org_memberships
        where
          auth.uid()  = gh_org_memberships.user_id
          and v1_opened_pull_requests.owned_by = any(gh_org_memberships.org_slugs)
      );
  `)
};

exports.down = async function(knex) {
  await knex.schema.raw(`
    drop view v1_time_to_merge;
    drop view v1_opened_pull_requests;
    drop view v1_merged_pull_requests;
  `)
};

