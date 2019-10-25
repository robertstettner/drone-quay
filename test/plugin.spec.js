const { expect } = require('chai');
const nock = require('nock');

const plugin = require('../plugin');

describe('Drone Quay', () => {
  it('should return error when quay_token is missing', async () => {
    try {
      await plugin.init({
        PLUGIN_NAMESPACE: 'mynamespace',
        PLUGIN_REPOSITORY: 'testing123',
        PLUGIN_DESCRIPTION: 'Just a test',
        PLUGIN_VISIBILITY: 'public'
      });
    } catch ({ message }) {
      expect(message).to.eql('quay_token is missing or invalid');
    }
  });
  it('should return error when namespace is missing', async () => {
    try {
      await plugin.init({
        PLUGIN_REPOSITORY: 'testing123',
        PLUGIN_DESCRIPTION: 'Just a test',
        PLUGIN_VISIBILITY: 'public',
        PLUGIN_TOKEN: 'mytoken'
      });
    } catch ({ message }) {
      expect(message).to.eql('namespace is missing or invalid');
    }
  });
  it('should return error when repository is missing', async () => {
    try {
      await plugin.init({
        PLUGIN_NAMESPACE: 'mynamespace',
        PLUGIN_DESCRIPTION: 'Just a test',
        PLUGIN_VISIBILITY: 'public',
        QUAY_TOKEN: 'mytoken'
      });
    } catch ({ message }) {
      expect(message).to.eql('repository is missing or invalid');
    }
  });
  it('should create a repository in Quay', async () => {
    const scope = nock('https://quay.io', {
      reqheaders: {
        Authorization: 'Bearer mytoken'
      }
    })
      .post('/api/v1/repository', {
        repo_kind: 'image',
        namespace: 'mynamespace',
        visibility: 'private',
        repository: 'testing123',
        description: 'Just a test'
      })
      .reply(201, {
        kind: 'image',
        namespace: 'mynamespace',
        name: 'testing123'
      });

    const message = await plugin.init({
      PLUGIN_NAMESPACE: 'mynamespace',
      PLUGIN_REPOSITORY: 'testing123',
      PLUGIN_DESCRIPTION: 'Just a test',
      PLUGIN_VISIBILITY: 'private',
      QUAY_TOKEN: 'mytoken'
    });

    expect(message).to.eql('Created repository in Quay.io');

    expect(scope.pendingMocks()).to.have.lengthOf(0);
  });
  it('should create a repository in Quay with default public visibility', async () => {
    const scope = nock('https://quay.io', {
      reqheaders: {
        Authorization: 'Bearer mytoken'
      }
    })
      .post('/api/v1/repository', {
        repo_kind: 'image',
        namespace: 'mynamespace',
        visibility: 'public',
        repository: 'testing123',
        description: 'Just a test'
      })
      .reply(201, {
        kind: 'image',
        namespace: 'mynamespace',
        name: 'testing123'
      });

    const message = await plugin.init({
      PLUGIN_NAMESPACE: 'mynamespace',
      PLUGIN_REPOSITORY: 'testing123',
      PLUGIN_DESCRIPTION: 'Just a test',
      PLUGIN_TOKEN: 'mytoken'
    });

    expect(message).to.eql('Created repository in Quay.io');

    expect(scope.pendingMocks()).to.have.lengthOf(0);
  });
  it('should return warning that a repository already exists in Quay', async () => {
    const scope = nock('https://quay.io', {
      reqheaders: {
        Authorization: 'Bearer mytoken'
      }
    })
      .post('/api/v1/repository', {
        repo_kind: 'image',
        namespace: 'mynamespace',
        visibility: 'public',
        repository: 'testing123',
        description: 'Just a test'
      })
      .reply(400, {
        status: 400,
        error_message: 'Repository already exists',
        title: 'invalid_request',
        error_type: 'invalid_request',
        detail: 'Repository already exists',
        type: 'https://quay.io/api/v1/error/invalid_request'
      });

    const message = await plugin.init({
      PLUGIN_NAMESPACE: 'mynamespace',
      PLUGIN_REPOSITORY: 'testing123',
      PLUGIN_DESCRIPTION: 'Just a test',
      PLUGIN_VISIBILITY: 'public',
      QUAY_TOKEN: 'mytoken'
    });

    expect(message).to.eql('Repository already exists in Quay.io');

    expect(scope.pendingMocks()).to.have.lengthOf(0);
  });
  it('should return error when posting request with bad token', async () => {
    const scope = nock('https://quay.io', {
      reqheaders: {
        Authorization: 'Bearer badtoken'
      }
    })
      .post('/api/v1/repository', {
        repo_kind: 'image',
        namespace: 'mynamespace',
        visibility: 'public',
        repository: 'testing123',
        description: 'Just a test'
      })
      .reply(403, {
        message: 'CSRF token was invalid or missing.'
      });

    try {
      await plugin.init({
        PLUGIN_NAMESPACE: 'mynamespace',
        PLUGIN_REPOSITORY: 'testing123',
        PLUGIN_DESCRIPTION: 'Just a test',
        PLUGIN_VISIBILITY: 'public',
        QUAY_TOKEN: 'badtoken'
      });
    } catch ({ message }) {
      expect(message).to.eql('CSRF token was invalid or missing.');
    }

    expect(scope.pendingMocks()).to.have.lengthOf(0);
  });
});
