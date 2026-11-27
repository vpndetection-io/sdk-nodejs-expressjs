# Changelog

What each release changed for you, newest first. Each line is a commit's summary, linked to its full description and diff. Releases before 2.0.3 are described by their release commits.

## 2.1.5 - 2026-11-27

### Features

- Require vpndetection 5.23.0: a keyless answer without the AS's type reads ([`61adf0b`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/61adf0b89d56607343a750c6845e1a8cff5c63e8))

## 2.1.4 - 2026-11-26

### Fixes

- Require vpndetection 5.22.1: a condition on the verdict is no plan gap for a request that sent no agent ([`ac31df4`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/ac31df498fef78753d4ec291922b751c5297fb47))

## 2.1.3 - 2026-11-26

### Features

- Require vpndetection 5.22.0: allowBots sends only a crawler's User-Agent, at most four an address ([`e295712`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/e295712fa625d4c29f7443f39e1b9dc68f18543e))

## 2.1.2 - 2026-11-25

### Fixes

- Require vpndetection 5.21.1: its README and doc comments name the Data plan, not the retired plans ([`90357cc`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/90357ccd1dc1356d537b0faeb46a3d344134c697))

## 2.1.1 - 2026-11-24

### Fixes

- Require vpndetection 5.21.0: a condition on a list member, such as pubproxy.protocols or a web row's port, matches any element ([`2c2f65d`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/2c2f65dec4270ed0303ec28aba07f3e1fcc0d2ba))

## 2.1.0 - 2026-11-24

### Features

- Let a verified crawler through with allowBots ([`2e1d2a7`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/2e1d2a74989ce501e08ebe0a9828b69ecf7a178f))
- Require vpndetection 5.20.0: a user agent sent with a lookup, and twelve first_seen and last_seen members read as dates ([`975ca8b`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/975ca8b3965ef8b98591d1c58b799b0737e6d249))

## 2.0.40 - 2026-11-23

### Fixes

- Require vpndetection 5.19.2: a per-call timeout on a dataset download is refused rather than ignored ([`833c79b`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/833c79be5b524cab1cf537f46bd3ef0a2af56f35))

## 2.0.39 - 2026-11-23

### Fixes

- Require vpndetection 5.19.1: a timeout or retry count no lookup can run is refused when the middleware is built ([`f6bf54b`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/f6bf54b5e8128508eb51570883380db2d32e0ef4))

## 2.0.38 - 2026-11-23

### Features

- Require vpndetection 5.19.0: every request names the SDK in its User-Agent ([`6fb5ad3`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/6fb5ad3694fc60e912d33c3fce1c59291d56749d))

## 2.0.37 - 2026-11-22

### Features

- Require vpndetection 5.18.0: isBot and bot, and an AS without its country or RPKI status is refused ([`0951eea`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/0951eeae7f856d913fb7e620b9be0f27c2825475))

## 2.0.36 - 2026-11-22

### Fixes

- Require vpndetection 5.17.1: a cache TTL or size that is not a whole number from 1 is refused ([`b458fd3`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/b458fd390aefc19e5f62a5151905f27d32496d9c))

## 2.0.35 - 2026-11-20

### Features

- Require vpndetection 5.17.0: a lookup reads the network, service, company and abuse members ([`b769e79`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/b769e7927ac5d8da90c66f5189a856f95a361bee))

## 2.0.34 - 2026-11-19

### Fixes

- Require vpndetection 5.16.2: a reduced answer is cached a minute at most ([`a3ef3e7`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/a3ef3e70b58e8566ea6043fe17c3c5e3f6094f83))

## 2.0.33 - 2026-11-19

### Fixes

- Require vpndetection 5.16.1: re-pinned to spec 2026.11.18 ([`c2da477`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/c2da477ea8988b5921e486339576dba400848e27))

## 2.0.32 - 2026-11-18

### Fixes

- Require vpndetection 5.16.0: cap_reached past a paid plan's overage cap ([`1f30ebf`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/1f30ebfc5d9c09546895bb23263488063676c06a))

## 2.0.31 - 2026-11-16

### Fixes

- Require vpndetection 5.15.0: the plan's name ([`8277b74`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/8277b744c69d44f93d7be08fe926e2c9c3283ad4))

## 2.0.30 - 2026-11-14

### Fixes

- Require vpndetection 5.14.0: is_bogon on every answer, and provider_name beside each provider ([`ba80213`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/ba8021382f56fa664d560f72eae351909d685293))

## 2.0.29 - 2026-11-11

### Fixes

- Require vpndetection 5.13.2: Unlimited, the free plan, never the Unlimited tier ([`3d8c3c9`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/3d8c3c95e9fa0aab3b1ee7cb424ab8cad7ed02ff))

## 2.0.28 - 2026-11-11

### Fixes

- Require vpndetection 5.13.1: the free plan's daily trial, never a trial key ([`b26e57b`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/b26e57b97b43dcb7d6d8142997e999d3943f24c4))

## 2.0.27 - 2026-11-11

### Features

- Require vpndetection 5.13.0: trial_expired on a trial key's answers ([`29a7ecd`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/29a7ecdbe4699c900908af19c83eb64066f391de))

## 2.0.26 - 2026-11-11

### Fixes

- Require vpndetection 5.12.2: the Unlimited tier and its terms ([`fb53ffd`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/fb53ffd9b643f19340f4005d593494b57edffc02))

## 2.0.25 - 2026-11-11

### Fixes

- Require vpndetection 5.12.1: plainer words on lookups without a key ([`02cf1af`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/02cf1af771e3e41104a08291f97295045c2c54ed))

## 2.0.24 - 2026-11-11

### Features

- Require vpndetection 5.12.0: a lookup without a key answers more ([`cd3427b`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/cd3427b876434b4a0f6f9f9daf7cca0095d7f974))

## 2.0.23 - 2026-11-07

### Features

- Require vpndetection 5.11.0: downloads take the build a webhook names ([`235e4c9`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/235e4c9e92a344f2842c5decc8c682594a9042eb))

## 2.0.22 - 2026-11-07

### Fixes

- Require vpndetection 5.10.4, which refuses a bad client concurrency as bad_request ([`e75880b`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/e75880b397544e0f6006554ee5c3256b29d91bc0))

## 2.0.21 - 2026-11-04

### Fixes

- Require vpndetection 5.10.3, which sends no poll at the deadline ([`47e0808`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/47e080875e3e1d52e0f44200510121f9da54291e))

## 2.0.20 - 2026-10-26

### Fixes

- Require vpndetection 5.10.2, which reads dates as RFC 3339 alone ([`fde6599`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/fde65990b7254991bd580ac8210175332ff3f1bb))

## 2.0.19 - 2026-10-23

### Fixes

- Require vpndetection 5.10.1, which types every answer member ([`852392f`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/852392f7bc75cf20fc07290ffbee217fb95018bb))

## 2.0.18 - 2026-10-20

### Features

- Require vpndetection 5.10.0: lookup results carry location and asn ([`c2eeed4`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/c2eeed4ff2a6064561c3c2d5080177348be0a56e))

## 2.0.17 - 2026-10-20

### Fixes

- Require vpndetection 5.9.0: oauth.register, and OAuth answers that are not JSON ([`35dc103`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/35dc103e29f6273117c4ff0067fb5f651573e406))

## 2.0.16 - 2026-10-20

### Fixes

- Require vpndetection 5.8.1: a batch entry is read by the answer's own keys ([`99639c4`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/99639c479169ecfac7f08fb1076d7dda5e0b1641))

## 2.0.15 - 2026-10-19

### Fixes

- Require vpndetection 5.8.0: num_ports and num_proxies in the pubproxy detail ([`5d40602`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/5d40602c2eec97335e3953b846c56db8687954fc))

## 2.0.14 - 2026-10-18

### Fixes

- Require vpndetection 5.7.0: isPubproxy and the pubproxy detail ([`817e50d`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/817e50dc0759fc1be829f45dc9891056e1761afe))

## 2.0.13 - 2026-10-17

### Features

- Require vpndetection 5.6.0: OauthMetadata carries registration_endpoint ([`53c5fed`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/53c5fedb26445a9fe981567d30bd4a28f2b0402c))

## 2.0.12 - 2026-10-16

### Fixes

- Require vpndetection 5.5.3: the spec re-pinned to 2026.10.15 ([`307f004`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/307f0045d98ceaf4f81dd0fff36220d54c921beb))

## 2.0.11 - 2026-10-12

### Fixes

- Require vpndetection 5.5.2: an unreadable answer is retried, a blank key sends none ([`8a73904`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/8a73904b17c3262d7b77cb2a556249cdd4d0bb60))

## 2.0.10 - 2026-10-10

### Fixes

- Require vpndetection 5.5.1: no Retry-After is waited out after the last attempt ([`760e4f6`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/760e4f62dee60b31724f2d1c62db3ba9c0cf232b))

## 2.0.9 - 2026-10-05

### Features

- Require vpndetection 5.4.0: the authorization code sign-in ([`2212c30`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/2212c30e74d027a0bb43c304c94915636c9fa359))

## 2.0.8 - 2026-10-04

### Fixes

- Require vpndetection 5.3.4, re-pinned to spec 2026.10.03 ([`bf60713`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/bf607134db1512ed0ccb9191e5e48dca4e531823))

## 2.0.7 - 2026-09-29

### Fixes

- Require vpndetection 5.3.3: 26 more reserved ranges are answered locally ([`f95489d`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/f95489dc66380989cdab691cea290d2e244126fb))

## 2.0.6 - 2026-09-28

### Fixes

- Require vpndetection 5.3.2: IPv4-mapped visitors are looked up, not waved through ([`56f5cef`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/56f5ceff55d181f345ec4b0f8d30d4faa95f26c2))

## 2.0.5 - 2026-09-27

### Fixes

- Require vpndetection 5.3.1: no doubled slash, impossible timeouts refused, poll cut ([`3a1292a`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/3a1292ab840e4447d19dbd671a6d9c0730dd1255))

## 2.0.4 - 2026-09-27

### Features

- Require vpndetection 5.3.0: OauthMetadata carries client_id_metadata_document_supported ([`5d7084b`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/5d7084b419860ed927ce269dc9d87a7ed56aa891))

## 2.0.3 - 2026-09-25

### Fixes

- Raise the base floor to vpndetection 5.2.2 ([`e3ff135`](https://github.com/vpndetection-io/sdk-nodejs-expressjs/commit/e3ff13546ce9bd54141211defb091ea6bebfa37d))
