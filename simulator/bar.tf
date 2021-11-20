resource "github_repository" "bar" {
  name             = "bar"
  auto_init        = true
  allow_auto_merge = true
}

resource "github_branch" "bar" {
  repository = github_repository.bar.name
  branch     = local.timestamp
}

resource "github_repository_file" "bar" {
  repository          = github_repository.bar.name
  branch              = github_branch.bar.branch
  file                = "timestamp.txt"
  content             = local.timestamp
  overwrite_on_create = true
}

resource "github_repository_pull_request" "bar" {
  depends_on      = [github_repository_file.bar]
  base_repository = github_repository.bar.name
  base_ref        = github_repository.bar.default_branch
  head_ref        = github_branch.bar.branch
  title           = local.timestamp

  provisioner "local-exec" {
    command = "curl -XPUT -u :${var.gh_token} https://api.github.com/repos/${var.gh_owner}/${github_repository.bar.name}/pulls/${github_repository_pull_request.bar.number}/merge"
  }
}
