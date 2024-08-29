# Updated OAuth SPA and API Code Sample

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/fe321819b81b49d48ff4597210ac582c)](https://app.codacy.com/gh/gary-archer/oauth.websample2?utm_source=github.com&utm_medium=referral&utm_content=gary-archer/oauth.websample2&utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample2/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample2?targetFile=spa/package.json)
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample2/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample2?targetFile=api/package.json)

## Overview

An OAuth code sample to extend the [initial code sample](https://github.com/gary-archer/oauth.websample1) with the following behaviors:

- The SPA uses the traditional OpenID connect flow, with session management features.
- The API comsines claims-based authorization with finer-grained business permissions.
- The SPA and API use user attributes from both the OpenID Connect userinfo endpoint and its API.

## Views

The SPA is a simple UI with some basic navigation between views, to render fictional investment resources.

![SPA Views](./images/views.png)

## Local Development Quick Start

First ensure that Node.js 20+ is installed, then run the build script:

```bash
./build.sh
```

You must use custom development domains and add these DNS entries to your hosts file:

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

The system browser runs and you can sign in with my AWS test credentials:

- User: `guestuser@example.com`
- Password: `GuestPassword1`

You can then test all lifecycle operations, including token refresh, multi tab browsing and logout.

## Further Information

* See the [Updated SPA and API Code Sample](https://apisandclients.com/posts/improved-spa-code-sample-overview) blog post a walkthrough and the key technical points

## 2021 Security Update

$\color{red}{\textsf{The initial SPA uses OAuth tokens in JavaScript code, as the simplest way to get integrated.}}$\
$\color{red}{\textsf{In 2021 it is instead recommended to keep tokens out of the browser to limit the impact of XSS exploits.}}$\
See the [Final SPA Code Sample](https://github.com/gary-archer/oauth.websample.final) for a more secure implementation.

## Programming Languages

* The SPA and its views use plain TypeScript code.
* The API uses Node.js and TypeScript.

## Infrastructure

* Express is used as the HTTP server for both the API and the SPA's web static content.
* The SPA uses the [oidc-client-ts](https://github.com/authts/oidc-client-ts) library to implement OpenID Connect.
* The API uses the [jose](https://github.com/panva/jose) library to validate JWT access tokens.
* AWS Cognito is the default authorization server for the SPA and API.
