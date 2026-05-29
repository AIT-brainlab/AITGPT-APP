group "default" {
  targets = ["backend"]
}

target "backend" {
  context    = "."
  dockerfile = "dockerfile"

  platforms = ["linux/amd64"]

  tags = ["aitgpt-backend:latest"]

  args = {
    BUILD_VERSION = "PROD"
    WORKDIR       = "/Projects/backend"
  }

  contexts = {
    root = "../"
  }
}