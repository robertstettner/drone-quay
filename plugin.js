const needle = require('needle');

const validate = env => {
  if (!env.QUAY_TOKEN && !env.PLUGIN_TOKEN)
    throw new Error('quay_token is missing or invalid');
  if (!env.PLUGIN_NAMESPACE) throw new Error('namespace is missing or invalid');
  if (!env.PLUGIN_REPOSITORY)
    throw new Error('repository is missing or invalid');
  return env;
};

const sendRequest = async env => {
  const { statusCode, body } = await needle(
    'post',
    'https://quay.io/api/v1/repository',
    {
      repo_kind: 'image',
      namespace: env.PLUGIN_NAMESPACE,
      visibility: env.PLUGIN_VISIBILITY || 'public',
      repository: env.PLUGIN_REPOSITORY,
      description: env.PLUGIN_DESCRIPTION
    },
    {
      json: true,
      headers: {
        Authorization: `Bearer ${env.QUAY_TOKEN || env.PLUGIN_TOKEN}`
      }
    }
  );

  if (statusCode === 400 && body.error_message === 'Repository already exists')
    return 'Repository already exists in Quay.io';
  if (statusCode >= 400)
    throw new Error(body.message || body.error_message || 'Unknown error');
  return 'Created repository in Quay.io';
};

const init = env =>
  Promise.resolve(env)
    .then(validate)
    .then(sendRequest);

module.exports = {
  init
};
