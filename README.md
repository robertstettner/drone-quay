# drone-quay [![Build Status](https://travis-ci.org/robertstettner/drone-quay.svg?branch=master)](https://travis-ci.org/robertstettner/drone-quay) [![Coverage Status](https://coveralls.io/repos/github/robertstettner/drone-quay/badge.svg?branch=master)](https://coveralls.io/github/robertstettner/drone-quay?branch=master)

Drone CI plugin for creating repositories in [Quay.io](https://quay.io).

The plugin will create a repository, and if it exists will only warn the user, and not error.

## Configuration

The following parameters are used to configure the plugin:

* `namespace`: the Quay.io namespace (user or organisation). Required.
* `repository`: the name of the repository. Required.
* `visibility`: the visibility of the repository (`public` or `private`). Defaults to `public`.
* `description`: the description of the repository. Optional.

### Secrets

The following secrets are used to configure the plugin with Drone v1.x:

* `token`: the Quay.io API token. Required.

The following secrets are used to configure the plugin with Drone v0.8 and lower:

* `quay_token`: the Quay.io API token. Required.

### Drone CI configuration example

#### Drone CI v1.x

```yaml
kind: pipeline
name: default

steps:
- name: quay  
  image: robertstettner/drone-quay
  settings:
    namespace: octocat
    repository: hello-world
    visibility: private
    token:
      from_secret: quay_token
```

#### Drone CI v8.x and lower

```yaml
pipeline:
  quay:
    image: robertstettner/drone-quay
    namespace: octocat
    repository: hello-world
    visibility: private
    secrets: [ quay_token ]
```

## Usage with Docker

Execute from the working directory:
```
docker run -t --rm \
  -v $(pwd):$(pwd) \
  -w $(pwd) \
  -e PLUGIN_NAMESPACE=octocat \
  -e PLUGIN_REPOSITORY=hello-world \
  -e PLUGIN_VISIBILITY=private \
  -e PLUGIN_TOKEN=<insert token here> \
  robertstettner/drone-quay
```

## License

[MIT](LICENSE)