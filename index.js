require('./plugin')
  .init(process.env)
  .then(message => {
    console.log(message);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
