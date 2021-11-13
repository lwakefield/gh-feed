variable "gh_owner" {}
variable "gh_token" {}

provider "github" {
  owner = var.gh_owner
  token = var.gh_token
}

resource "github_repository" "foo" {
  name             = "foo"
  auto_init        = true
  allow_auto_merge = true
}

locals { timestamp = formatdate("YYYY/MM/DD/hh/mm", timestamp()) }

resource "github_branch" "foo" {
  repository = github_repository.foo.name
  branch     = local.timestamp
}

resource "github_repository_file" "foo" {
  repository          = github_repository.foo.name
  branch              = github_branch.foo.branch
  file                = "timestamp.txt"
  content             = local.timestamp
  overwrite_on_create = true
}

resource "github_repository_pull_request" "foo" {
  depends_on      = [github_repository_file.foo]
  base_repository = github_repository.foo.name
  base_ref        = github_repository.foo.default_branch
  head_ref        = github_branch.foo.branch
  title           = local.timestamp

  provisioner "local-exec" {
    command = "curl -XPUT -u :${var.gh_token} https://api.github.com/repos/${var.gh_owner}/${github_repository.foo.name}/pulls/${github_repository_pull_request.foo.number}/merge"
  }
}
