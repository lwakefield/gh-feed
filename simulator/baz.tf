resource "github_repository" "baz" {
  name             = "baz"
  auto_init        = true
  allow_auto_merge = true
}

resource "github_branch" "baz" {
  repository = github_repository.baz.name
  branch     = local.timestamp
}

resource "github_repository_file" "baz" {
  repository          = github_repository.baz.name
  branch              = github_branch.baz.branch
  file                = "timestamp.txt"
  content             = local.timestamp
  overwrite_on_create = true
}

resource "github_repository_pull_request" "baz" {
  depends_on      = [github_repository_file.baz]
  base_repository = github_repository.baz.name
  base_ref        = github_repository.baz.default_branch
  head_ref        = github_branch.baz.branch
  title           = local.timestamp

  provisioner "local-exec" {
    command = "curl -XPUT -u :${var.gh_token} https://api.github.com/repos/${var.gh_owner}/${github_repository.baz.name}/pulls/${github_repository_pull_request.baz.number}/merge"
  }
}
