# [<img src="https://s3.vpndetection.io/vpndetection-public/brand/mark.svg" alt="VPNDetection" height="28"/>](https://vpndetection.io/) VPNDetection Express Middleware

[![npm](https://img.shields.io/npm/v/vpndetection-express.svg)](https://www.npmjs.com/package/vpndetection-express)
[![license](https://img.shields.io/npm/l/vpndetection-express.svg)](LICENSE)

The official [Express](https://expressjs.com) middleware for the [VPNDetection](https://vpndetection.io) API: it checks each visitor's IP for VPN, Tor and proxy use, and can block them with a 403.

It classifies the visitor behind each request: VPN, residential proxy, Tor, hosting, CDN, relay. It hands the answer to your handlers. Blocking is opt-in.

## Getting Started

```bash
npm install vpndetection-express
```

Requires Node.js 22 or newer and Express 4.18 or newer. TypeScript types are included.

No API key needed to start. Without one, a lookup is on Unlimited, the free plan, which answers VPN, Tor and relay detection with no daily or monthly cap. A paid plan's key adds the hosting, CDN and proxy flags and the provider behind each flag: create one in the [console](https://app.vpndetection.io). A free account tries every field.

```js
import express from 'express';
import { vpndetection } from 'vpndetection-express';

const app = express();

app.set('trust proxy', 'loopback');  // your proxy; see "Where the client address comes from" below
app.use(vpndetection({ apiKey: process.env.VPNDETECTION_API_KEY }));

app.get('/', (req, res) => {
    const { result } = req.vpndetection;
    res.send(result.isVpn ? 'Hello, VPN user' : 'Hello');
});
```

By default nothing is blocked. Every request gets a `req.vpndetection` and your own code decides what to do with it, since whether a VPN visitor is a problem depends on what they're doing.

## Blocking

Pass a `blockCondition` and a matching request is answered with `403` and never reaches your handlers.

```js
app.use(vpndetection({
    apiKey: process.env.VPNDETECTION_API_KEY,
    blockCondition: { isVpn: true },
}));
```

A condition is written in the shape of a result, and only the members you name are considered. That lets it reach the evidence, not just the flags:

```js
blockCondition: { isVpn: true, vpn: { provider: 'nordvpn' } }         // one provider
blockCondition: { isResproxy: true, resproxy: { hits: { gte: 5 } } }  // a numeric threshold
blockCondition: { vpn: { confidence: ['high', 'medium'] } }           // any of these
blockCondition: [{ isTor: true }, { isResproxy: true }]               // a list is OR
blockCondition: { isBot: true }                                       // a bot, such as a crawler, on every plan
```

Values are matched by equality, strings without regard to case. An array means any-of. `{ gte, gt, lte, lt }` compares numbers, and every bound you give must hold, so two of them are a range. A member the answer holds as a list (`web`, `pubproxy.protocols`, `bittorrent.clients`, `bot.agents`, `bot.categories`) matches when any element does: `{ pubproxy: { protocols: 'socks5' } }` matches a proxy that speaks SOCKS5 among others, and an object term such as `{ web: { port: 443 } }` must match one element in full. Members you set to `false` or `null` are ignored, so a condition states the signals you act on; one that constrains nothing would match every request, and is refused when the middleware is created rather than silently blocking all your traffic.

Replace the refusal with `onBlocked`:

```js
app.use(vpndetection({
    apiKey: process.env.VPNDETECTION_API_KEY,
    blockCondition: { isVpn: true },
    onBlocked: (req, res) => res.status(403).render('no-vpn'),
}));
```

## Let a verified crawler through

`allowBots` sends each request's own `User-Agent` with its lookup, and a request whose answer's `userAgent.verdict` is `verified`, a crawler its operator vouches for such as Googlebot from Google's addresses, is never blocked, whatever `blockCondition` matches. The answer is still on `req.vpndetection`:

```js
app.use(vpndetection({
    apiKey: process.env.VPNDETECTION_API_KEY,
    blockCondition: { isBot: true },
    allowBots: true,
}));
```

A client claiming to be a crawler from an address its operator does not vouch for reads `spoofed`, so `blockCondition: { userAgent: { verdict: 'spoofed' } }` refuses a forged crawler. A request with no `User-Agent` sends none. It is off by default, and then no agent is sent and the cache keeps one answer per address rather than one per address and agent. A verdict needs a paid plan or the trial: a served answer without one is reported once under `onMissingField`.

## Where the client address comes from

Get this setting right, or none of the above works.

By default the middleware uses `req.ip`, which is Express's own accessor. **Express resolves `req.ip` to the socket peer unless you set `trust proxy`.** So if your app sits behind nginx, a load balancer, or a CDN and you have not set it, every visitor arrives wearing your proxy's address, and that is the address that gets checked: VPN visitors pass unnoticed, and if it is a hosting address, a hosting rule blocks everyone. nginx on the same machine is `127.0.0.1` and a load balancer usually has a private address, which the middleware answers locally without a lookup, flagging nobody and logging a warning.

If you are behind a proxy you control, setting Express's own option to that proxy's address is the right fix and everything else here follows from it:

```js
app.set('trust proxy', 'loopback');    // a proxy on the same machine
app.set('trust proxy', '10.0.0.0/8');  // or your load balancer's subnet
```

Name your proxies rather than setting `true`. With `true`, `req.ip` is the left-most `X-Forwarded-For` entry, and the visitor writes that one: nginx, AWS's Application Load Balancer and Cloudflare all append to the header rather than replace it, so a visitor on a VPN who sends `X-Forwarded-For: 1.1.1.1` is looked up as `1.1.1.1`. A hop count such as `1` is no better, because it believes whoever connects to the app directly. Keep `true` only behind an edge you control that overwrites `X-Forwarded-For`.

For an edge that writes the address into its own header, name the header:

```js
import { headerIpSelector } from 'vpndetection-express';

app.use(vpndetection({
    apiKey: process.env.VPNDETECTION_API_KEY,
    ipSelector: headerIpSelector('CF-Connecting-IP'),  // or True-Client-IP, or your own
}));
```

`xffIpSelector()` reads `X-Forwarded-For` directly. The left-most entry is whatever the caller sent, since proxies append to that header, so trust it only when an edge you control overwrites it. If you know how many proxies sit in front, count from the right instead: `xffIpSelector({ depth: 1 })` is the address your nearest proxy saw.

Anything else, pass your own function. It receives the Express request and returns an address:

```js
ipSelector: (req) => req.headers['x-real-ip'] ?? req.ip,
```

If the address resolves to a private one, the middleware says so once on `console.warn`. That is expected on localhost and is the signal to fix your configuration anywhere else.

## When a lookup fails

The request is let through, and the reason is recorded on `req.vpndetection.error`. Our outage should not become yours, so a network failure, an exhausted quota or a rejected key all fail open.

```js
app.get('/', (req, res) => {
    const { result, error } = req.vpndetection;
    if (error) {
        req.log.warn({ kind: error.kind }, 'vpndetection unavailable');
    }
    res.send(result?.isVpn ? 'Hello, VPN user' : 'Hello');
});
```

Pass `failClosed: true` to block instead. Private addresses are answered locally and never fail, so this will not lock you out in development.

## Cost and latency

Answers are cached per middleware for an hour, so a returning visitor costs nothing, and private addresses never leave the process. A cache miss is one request to our API, bounded at 2500 ms by default and not retried: on a request path, failing open fast beats holding a visitor while we retry. Both are adjustable, along with the cache itself:

```js
vpndetection({ apiKey: KEY, timeoutMs: 1000, retries: 1, cache: { max: 50000, ttlMs: 600000 } })
```

Mount it on the routes that matter rather than the whole app, or skip what you do not care about:

```js
app.use(vpndetection({ apiKey: KEY, skip: (req) => req.path.startsWith('/static') }));
```

If you already hold a `VPNDetection` client, pass it as `client` and the middleware will share it rather than building a second cache.

Beyond a few million distinct visitors a day, stop calling the API per request: [download the dataset](https://vpndetection.io/#databases) and look addresses up locally instead.

## Absent is not false

Unlimited, with a key or without one, leaves out `isHosting`, `isCdn`, the four proxy flags, the carrier, satellite and service flags, `bot`, `userAgent`, `company` and `abuse`, and of the detail behind each flag it answers only Tor's and relay's. A field your plan does not include is `undefined`, which means "not in your plan" rather than "checked, and no".

```js
req.vpndetection.result.isHosting ?? false   // when you only want the flag
```

A `blockCondition` naming a member your plan does not serve can never match, so the middleware warns once instead of failing silently. Set `onMissingField: 'throw'` to make it an error.

## Other Libraries

There are official VPNDetection client libraries available for many languages including PHP, Python, Go, Java, Ruby, and many popular frameworks such as Django, Rails, and Laravel. See our GitHub at https://github.com/vpndetection-io for more.

## About VPNDetection

VPN Detection API: Accurate anonymity detection identifying VPNs, residential proxies, hosting servers, Tor nodes, CDNs, relays and more.

[<picture><source media="(prefers-color-scheme: dark)" srcset="https://s3.vpndetection.io/vpndetection-public/brand/logo-dark.svg"><img src="https://s3.vpndetection.io/vpndetection-public/brand/logo.svg" alt="VPNDetection" height="40"/></picture>](https://vpndetection.io/)

## License

This project is licensed under the [MIT License](LICENSE).
