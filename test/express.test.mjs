// The adapter, against a real Express app on a real socket. The shared
// conformance corpus is asserted in conformance.test.mjs.
//
// A test server answers on the loopback, so `req.ip` is a bogon and is answered
// locally without a request. Anything that needs a served answer therefore has
// to arrive wearing a public address - through `trust proxy`, or a selector.

import assert from 'node:assert/strict';
import { after, test } from 'node:test';

import express from 'express';
import { VPNDetection } from 'vpndetection';

import {
    defaultIpSelector, headerIpSelector, vpndetection, xffIpSelector,
} from '../dist/index.js';

const PUBLIC_IP = '45.83.91.1';
const servers = [];

after(() => {
    for (const s of servers) {
        s.close();
    }
});

// A client whose every answer is `body`, recording the addresses it was asked
// about - which is what the client-address tests actually assert on.
function stubClient(body = { is_vpn: true, vpn: { provider: 'nordvpn' } }) {
    const asked = [];
    const client = new VPNDetection({
        cache: false,
        retries: 0,
        fetch: async (input) => {
            const url = new URL(typeof input === 'string' ? input : input.url);
            const ip = decodeURIComponent(url.pathname.slice(1));
            asked.push(ip);
            return new Response(JSON.stringify({ ip: ip, ...body }), {
                status: 200, headers: { 'content-type': 'application/json' },
            });
        },
    });
    return { client: client, asked: asked };
}

async function serve(configure) {
    const app = express();
    configure(app);
    app.get('/', (req, res) => {
        res.json({
            ip: req.vpndetection?.ip ?? null,
            isVpn: req.vpndetection?.result?.isVpn ?? null,
            isBogon: req.vpndetection?.result?.isBogon ?? null,
            error: req.vpndetection?.error?.kind ?? null,
            attached: req.vpndetection !== undefined,
        });
    });
    const server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    servers.push(server);
    const base = `http://127.0.0.1:${server.address().port}`;
    return async (headers = {}) => {
        const res = await fetch(`${base}/`, { headers: headers });
        return { status: res.status, body: await res.json().catch(() => null) };
    };
}

// Most cases only care about the decision, not about where the address came
// from, so they pin the address and let the selectors be tested on their own.
const fixedIp = () => PUBLIC_IP;

test('enriches the request and leaves the decision to the app', async () => {
    const { client: client, asked: asked } = stubClient();
    const call = await serve((app) => app.use(vpndetection({
        client: client, ipSelector: fixedIp,
    })));
    const res = await call();
    assert.equal(res.status, 200);
    assert.equal(res.body.attached, true);
    assert.equal(res.body.isVpn, true);
    assert.equal(res.body.ip, PUBLIC_IP);
    assert.deepEqual(asked, [PUBLIC_IP]);
});

test('blocks with 403 when the condition matches, and passes when it does not', async () => {
    const vpn = stubClient({ is_vpn: true, vpn: { provider: 'nordvpn' } });
    const blocked = await serve((app) => app.use(vpndetection({
        client: vpn.client, ipSelector: fixedIp, blockCondition: { isVpn: true },
    })));
    const denied = await blocked();
    assert.equal(denied.status, 403);
    assert.deepEqual(denied.body, { error: 'access denied' });

    const clean = stubClient({ is_vpn: false, vpn: {} });
    const allowed = await serve((app) => app.use(vpndetection({
        client: clean.client, ipSelector: fixedIp, blockCondition: { isVpn: true },
    })));
    assert.equal((await allowed()).status, 200);
});

test('a condition reaching the evidence fields is what a flag list cannot do', async () => {
    const nord = stubClient({ is_vpn: true, vpn: { provider: 'nordvpn' } });
    const call = await serve((app) => app.use(vpndetection({
        client: nord.client, ipSelector: fixedIp, blockCondition: { vpn: { provider: 'mullvad' } },
    })));
    assert.equal((await call()).status, 200, 'a different provider must not match');

    const mullvad = stubClient({ is_vpn: true, vpn: { provider: 'mullvad' } });
    const call2 = await serve((app) => app.use(vpndetection({
        client: mullvad.client, ipSelector: fixedIp,
        blockCondition: { vpn: { provider: 'mullvad' } },
    })));
    assert.equal((await call2()).status, 403);
});

test('onBlocked replaces the refusal entirely', async () => {
    const { client: client } = stubClient();
    const call = await serve((app) => app.use(vpndetection({
        client: client,
        ipSelector: fixedIp,
        blockCondition: { isVpn: true },
        onBlocked: (req, res, lookup) => {
            res.status(451).json({ why: lookup.result.vpn.provider });
        },
    })));
    const res = await call();
    assert.equal(res.status, 451);
    assert.deepEqual(res.body, { why: 'nordvpn' });
});

test('skip leaves the request untouched', async () => {
    const { client: client, asked: asked } = stubClient();
    const call = await serve((app) => app.use(vpndetection({
        client: client, ipSelector: fixedIp, blockCondition: { isVpn: true },
        skip: (req) => req.path === '/',
    })));
    const res = await call();
    assert.equal(res.status, 200);
    assert.equal(res.body.attached, false);
    assert.deepEqual(asked, []);
});

test('a failing lookup lets the visitor through', async () => {
    const failing = new VPNDetection({
        retries: 0,
        fetch: async () => new Response('{"error":"boom"}', { status: 500 }),
    });
    const call = await serve((app) => app.use(vpndetection({
        client: failing, ipSelector: fixedIp, blockCondition: { isVpn: true },
    })));
    const res = await call();
    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'server_error');
});

test('onMissingField: throw reaches the express error handler', async () => {
    const free = stubClient({ is_vpn: true });
    const call = await serve((app) => {
        app.use(vpndetection({
            client: free.client, ipSelector: fixedIp,
            blockCondition: { isHosting: true }, onMissingField: 'throw',
        }));
        app.use((err, _req, res, _next) => {
            res.status(500).json({ message: err.message });
        });
    });
    const res = await call();
    assert.equal(res.status, 500);
    assert.match(res.body.message, /does not include/);
});

// The test that matters. Every other assertion here would pass whether or not
// the selector is right, because a direct connection has nothing to confuse.
test('a forged X-Forwarded-For is ignored by default and honoured only on request', async () => {
    const forgery = { 'x-forwarded-for': PUBLIC_IP };

    const plain = stubClient();
    const untrusting = await serve((app) => app.use(vpndetection({ client: plain.client })));
    const direct = await untrusting(forgery);
    assert.equal(direct.body.ip, '127.0.0.1',
        'with trust proxy off, req.ip is the socket peer and the header is a forgery');
    assert.deepEqual(plain.asked, [], 'and a bogon is answered locally, so nothing was asked');

    const trusting = stubClient();
    const trusted = await serve((app) => {
        app.set('trust proxy', true);
        app.use(vpndetection({ client: trusting.client }));
    });
    const viaTrust = await trusted(forgery);
    assert.equal(viaTrust.body.ip, PUBLIC_IP,
        'trust proxy is the application saying it believes the header');
    assert.deepEqual(trusting.asked, [PUBLIC_IP]);

    const explicit = stubClient();
    const viaSelector = await serve((app) => app.use(vpndetection({
        client: explicit.client, ipSelector: xffIpSelector(),
    })));
    assert.equal((await viaSelector(forgery)).body.ip, PUBLIC_IP);
    assert.deepEqual(explicit.asked, [PUBLIC_IP]);
});

test('a header selector reads the edge that writes it', async () => {
    const { client: client, asked: asked } = stubClient();
    const call = await serve((app) => app.use(vpndetection({
        client: client, ipSelector: headerIpSelector('CF-Connecting-IP'),
    })));
    assert.equal((await call({ 'cf-connecting-ip': '45.83.91.9' })).body.ip, '45.83.91.9');
    assert.equal((await call({})).body.ip, '127.0.0.1',
        'and falls back to req.ip when the edge did not write one');
    assert.deepEqual(asked, ['45.83.91.9']);
});

test('depth counts trusted hops from the right', async () => {
    const { client: client, asked: asked } = stubClient();
    const call = await serve((app) => app.use(vpndetection({
        client: client, ipSelector: xffIpSelector({ depth: 1 }),
    })));
    await call({ 'x-forwarded-for': `${PUBLIC_IP}, 70.41.3.18, 150.172.238.178` });
    assert.deepEqual(asked, ['150.172.238.178']);
});

test('the default selector is req.ip', async () => {
    const { client: client } = stubClient();
    const call = await serve((app) => app.use(vpndetection({
        client: client, ipSelector: defaultIpSelector,
    })));
    assert.equal((await call()).body.ip, '127.0.0.1');
});

test('a private client address is answered locally and never blocks', async () => {
    const { client: client, asked: asked } = stubClient();
    const warnings = [];
    const call = await serve((app) => app.use(vpndetection({
        client: client, blockCondition: { isVpn: true }, onWarn: (m) => warnings.push(m),
    })));
    const res = await call();
    assert.equal(res.status, 200, 'local development must not lock you out of your own app');
    assert.equal(res.body.isBogon, true);
    assert.deepEqual(asked, []);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /not a public address/);
});

test('the deadline bounds the request rather than the visitor waiting on us', async () => {
    const hung = new VPNDetection({ retries: 0, fetch: () => new Promise(() => {}) });
    const call = await serve((app) => app.use(vpndetection({
        client: hung, ipSelector: fixedIp, timeoutMs: 150, blockCondition: { isVpn: true },
    })));
    const started = Date.now();
    const res = await call();
    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'network');
    assert.ok(Date.now() - started < 3000, 'the visitor was held past the budget');
});

test('a condition that constrains nothing is refused at construction', () => {
    assert.throws(() => vpndetection({ blockCondition: { isVpn: false } }), /constrains nothing/);
    assert.throws(() => vpndetection({ blockCondition: {} }), /constrains nothing/);
});
