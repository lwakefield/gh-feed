terraform {
  backend "remote" {
    organization = "lwak"

    workspaces {
      name = "gh-feed"
    }
  }
}

variable "gh_owner" {}
variable "gh_token" {}

provider "github" {
  owner = var.gh_owner
  token = var.gh_token
}

locals { timestamp = formatdate("YYYY/MM/DD/hh/mm", timestamp()) }
