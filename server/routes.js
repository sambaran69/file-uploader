const path = require('path');
const glob = require('glob');
const express = require('express');
const csrf = require('csurf');
const useragent = require('useragent');

/**
 * Injects all routes found inside the /api directory, convention explained below
 *
 * For injector to work, routes must be contained inside the api directory, and accessed
 * through an index.js initializing file. For example: /api/v1/user/index.js
 * then initializes other nested routes which are first accessed through
 * /api/v1/user/... endpoints.
 *
 * @param app
 */
module.exports = function (app) {
  'use strict';

  // Get route middleware
  let routesPath = path.normalize(global.appRoot + '/app/api');
  let globPattern = routesPath + '/**/**/index.js';
  let csrfProtection = csrf({cookie: true});

  // Site-wide middleware
  app.use((req, res, next) => {
    // Fallback authorization header 'X-Authorization' in case Auth header is hijacked by safari/IE
    if (req.headers && req.headers['x-authorization'] && !req.headers.authorization) {
      req.headers.authorization = req.headers['x-authorization'];
    }

    next();
  });

  // Inject all protected routes inside the api directory
  let routes = glob.sync(globPattern);
  routes.forEach((originalRoute) => {
    let routeName = path.relative(routesPath, originalRoute);
    let route = (`/api/${routeName}`).replace('/index.js', '');

    // Inject route
    app.use(route, require(global.appRoot + '/app' + route));
  });

};
