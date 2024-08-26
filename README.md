# Updated OAuth SPA and API Code Sample

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/fe321819b81b49d48ff4597210ac582c)](https://app.codacy.com/gh/gary-archer/oauth.websample2?utm_source=github.com&utm_medium=referral&utm_content=gary-archer/oauth.websample2&utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample2/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample2?targetFile=spa/package.json)
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample2/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample2?targetFile=api/package.json)

## Overview

A sample focused on the following OAuth areas for SPAs and APIs:

- The SPA uses the traditional OpenID connect flow, with session management features
- The API authorizes access to data using claims from multiple data sources

## Views

The SPA is a simple UI with some basic navigation between views, to render fictional resources.\
The data is returned from an API that authorizes using claims from multiple sources.

![SPA Views](./images/views.png)

## Local Development Quick Start

First ensure that Node.js 20+ is installed, then run the build script:

```bash
./build.sh
```

Custom development domains are used so you must add these entries to your hosts file:

```
127.0.0.1 localhost www.authsamples-dev.com api.authsamples-dev.com
```

Next configure [Browser SSL Trust](https://apisandclients.com/posts/developer-ssl-setup) for the SSL root certificate:

```
./api/certs/localhost/authsamples-dev.com.ca.crt
```

Then run the following script to run the code for both SPA and API:

```bash
./run.sh
```

The browser is invoked and you can sign in with my AWS test credentials:

- User: `guestuser@example.com`
- Password: `GuestPassword1`

You can then test all lifecycle operations, including token refresh, multi tab browsing and logout.

## Further Information

* See the [Updated SPA and API Code Sample](https://apisandclients.com/posts/improved-spa-code-sample-overview) blog post a walkthrough and the key technical points

## 2021 Security Update

- In 2021 it is instead recommended to keep tokens out of the browser, using a Backend for Frontend
- See the [Final SPA Code Sample](https://github.com/gary-archer/oauth.websample.final) for an API driven implementation

## Programming Languages

* Plain TypeScript is used for the SPA, to explain OAuth behaviour in the simplest way
* Node.js and TypeScript are used to implement the API

## Infrastructure

* Express is used to host both the API and the SPA content
* AWS Cognito is used as the default Authorization Server
* The [oidc-client-ts](https://github.com/authts/oidc-client-ts) library is used by the SPA to implement OpenID Connect
* The [jose](https://github.com/panva/jose) library is used by the API to validate JWT access tokens
* The [node-cache](https://github.com/mpneuried/nodecache) library is used to cache extra claims, when access tokens are first received
