const express = require('express');
require('isomorphic-fetch');
const PORT = process.env.PORT || 8080;

express()
  .get('/', (request, responce) => {
    const query = request.query;
    const colorSuccess = 'green';
    const colorFailure = 'red';
    const content = query.content;
    const repo = query.repo;
    const jobNumber = query.job;
    const style = query.style || 'flat-square';
    const label = query.label || 'build';

    const shieldIo = (color, outcome) =>
      `https://img.shields.io/badge/${label}-${content ||
        outcome}-${color}.svg?longCache=false&style=${style}&label=${label}`;

    fetch(`https://api.travis-ci.org/repos/${repo}`)
      .then((res) => res.json())
      .then((build) => {
        fetch(`https://api.travis-ci.org/builds/${build.last_build_id}`)
          .then((res) => res.json())
          .then((travis) => {
            if(!jobNumber) {
              return responce.redirect(shieldIo(colorFailure, 'job number missing'));
            }

            if((jobNumber) > travis.matrix.length) {
              return responce.redirect(shieldIo(colorFailure, `job "${jobNumber}" not found`));
            }

            if (travis.matrix[jobNumber - 1].result === 0) {
              return responce.redirect(shieldIo(colorSuccess, 'passing'));
            } else if (travis.matrix[jobNumber - 1].result === 1) {
              return responce.redirect(shieldIo(colorFailure, 'failing'));
            } else {
              return responce.redirect(shieldIo(colorFailure, 'unknown'));
            }
          });
      });
  })
  // eslint-disable-next-line no-console
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
