# [<img src="https://s3.vpndetection.io/vpndetection-public/brand/mark.svg" alt="VPNDetection" height="28"/>](https://vpndetection.io/) VPNDetection Express Middleware

[![npm](https://img.shields.io/npm/v/vpndetection-express.svg)](https://www.npmjs.com/package/vpndetection-express)
[![license](https://img.shields.io/npm/l/vpndetection-express.svg)](LICENSE)

The official [Express](https://expressjs.com) middleware for the [VPNDetection](https://vpndetection.io) API.

It classifies the visitor behind each request — VPN, residential proxy, Tor, hosting, CDN, relay — and hands the answer to your handlers. Blocking is opt-in.

## Getting Started

```bash
npm install vpndetection-express
```

Requires Node.js 22 or newer and Express 4.18 or newer. TypeScript types are included.

You need an API key. Create one in the [console](https://app.vpndetection.io); the free tier's allowance is counted per source address, and a server is a single source address, so a key is what makes this usable in production rather than optional.

```js
import express from 'express';
import { vpndetection } from 'vpndetection-express';

const app = express();

app.set('trust proxy', true);  // see "Where the client address comes from" below
app.use(vpndetection({ apiKey: process.env.VPNDETECTION_API_KEY }));

app.get('/', (req, res) => {
    const { result } = req.vpndetection;
    res.send(result.isVpn ? 'Hello, VPN user' : 'Hello');
});
```

By default nothing is blocked. Every request gets a `req.vpndetection` and your own code decides what that means — which is usually what you want, because whether a VPN visitor is a problem depends entirely on what they are doing.

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
```

Values are matched by equality, strings without regard to case. An array means any-of. `{ gte, gt, lte, lt }` compares numbers, and every bound you give must hold, so two of them are a range. Members you set to `false` or `null` are ignored, so a condition states the signals you act on; one that constrains nothing would match every request, and is refused when the middleware is created rather than silently blocking all your traffic.

Replace the refusal with `onBlocked`:

```js
app.use(vpndetection({
    apiKey: process.env.VPNDETECTION_API_KEY,
    blockCondition: { isVpn: true },
    onBlocked: (req, res) => res.status(403).render('no-vpn'),
}));
```

## Where the client address comes from

This is the setting that decides whether any of the above works, and it is the one thing only you can get right.

By default the middleware uses `req.ip`, which is Express's own accessor. **Express resolves `req.ip` to the socket peer unless you set `trust proxy`.** So if your app sits behind nginx, a load balancer, or a CDN and you have not set it, every visitor arrives wearing your proxy's address — which is a datacenter address, so a hosting rule would block all of them.

If you are behind a proxy you control, setting Express's own option is the right fix and everything else here follows from it:

```js
app.set('trust proxy', true);
```

For an edge that writes the address into its own header, name the header:

```js
import { headerIpSelector } from 'vpndetection-express';

app.use(vpndetection({
    apiKey: process.env.VPNDETECTION_API_KEY,
    ipSelector: headerIpSelector('CF-Connecting-IP'),  // or True-Client-IP, or your own
}));
```

`xffIpSelector()` reads `X-Forwarded-For` directly. Be aware that the left-most entry is whatever the caller sent, because proxies append to that header — it is only trustworthy when an edge you control overwrites it. If you know how many proxies sit in front, count from the right instead: `xffIpSelector({ depth: 1 })` is the address your nearest proxy saw.

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

Answers are cached per middleware for an hour, so a returning visitor costs nothing, and private addresses never leave the process. A cache miss is one request to our API, bounded at 2500 ms by default and not retried — on a request path, failing open quickly beats holding a visitor while we try again. Both are adjustable, along with the cache itself:

```js
vpndetection({ apiKey: KEY, timeoutMs: 1000, retries: 1, cache: { max: 50000, ttlMs: 600000 } })
```

Mount it on the routes that matter rather than the whole app, or skip what you do not care about:

```js
app.use(vpndetection({ apiKey: KEY, skip: (req) => req.path.startsWith('/static') }));
```

If you already hold a `VPNDetection` client, pass it as `client` and the middleware will share it rather than building a second cache.

Beyond a few million distinct visitors a day, stop calling the API per request: [download the dataset](https://vpndetection.io/databases) and look addresses up locally instead.

## Absent is not false

Only `ip` and `isVpn` come back on every plan. A field your plan does not include is `undefined`, which means "not in your plan" rather than "checked, and no".

```js
req.vpndetection.result.isHosting ?? false   // when you only want the flag
```

A `blockCondition` naming a member your plan does not serve can never match, so the middleware warns once instead of failing silently. Set `onMissingField: 'throw'` to make it an error.

## Other Libraries

There are official VPNDetection client libraries available for many languages including PHP, Python, Go, Java, Ruby, and many popular frameworks such as Django, Rails, and Laravel. See our GitHub at https://github.com/vpndetection-io for more.

## About VPNDetection

VPN Detection API: Accurate anonymity detection identifying VPNs, residential proxies, hosting servers, Tor nodes, CDNs, relays and more.

[<img src="https://s3.vpndetection.io/vpndetection-public/brand/mark.svg" alt="VPNDetection" width="96"/>](https://vpndetection.io/)

## License

This project is licensed under the [MIT License](LICENSE).
