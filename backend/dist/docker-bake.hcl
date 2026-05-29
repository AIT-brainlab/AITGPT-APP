group "default" {
  targets = ["backend"]
}
variable "TAG" { default = "latest" }
variable "VERSION" { default = "0.0.1" }
variable "PACKAGE_NAME" { default = "aitgpt_backend" }

target "backend" {
  context    = "."
  dockerfile = "dockerfile"

  platforms = ["linux/amd64"]

  tags = [
    "aitgpt-backend:latest",
    "aitgpt-backend:${TAG}"
    ]

  args = {
    BUILD_VERSION = "${TAG}"
    WORKDIR       = "/Projects/backend"
    TAG           = "${TAG}"
    VERSION       = "${VERSION}"
    PACKAGE_NAME  = "${PACKAGE_NAME}"
  }

  contexts = {
    root = "../"
  }
}