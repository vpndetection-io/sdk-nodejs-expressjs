// The published package, mounted in a real Express app, against staging.
//
// The unit suite stubs the transport, so it proves the wiring and nothing about
// the artifact a stranger installs: a `files` list shipping no `dist`, an
// export map a consumer cannot resolve, or a release that never landed all pass
// it. It also cannot prove that the API key reaches the wire, because a stub
// answers the same either way.

import assert from 'node:assert/strict';
import { after, test } from 'node:test';

import express from 'express';
import { vpndetection } from 'vpndetection-express';

import { MAX_RUNG, RUNGS, keyFor, skipFor } from '../lib/tiers.mjs';

const BASE_URL = 'https://api-staging.vpndetection.io';

// A known VPN address on staging, which serves real data. Sent as the client
// address through a selector rather than by spoofing a header, so the test is
// about the lookup rather than about trust-proxy configuration.
const VPN_IP = '45.83.91.1';

const servers = [];

after(() => {
    for (const s of servers) {
        s.close();
    }
});

async function serve(options) {
    const app = express();
    app.use(vpndetection({ baseUrl: BASE_URL, ipSelector: () => VPN_IP, ...options }));
    app.get('/', (req, res) => {
        res.json({
            ip: req.vpndetection?.ip ?? null,
            error: req.vpndetection?.error?.kind ?? null,
            members: Object.keys(req.vpndetection?.result?.raw ?? {}).sort(),
        });
    });
    const server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    servers.push(server);
    const url = `http://127.0.0.1:${server.address().port}/`;
    return async () => {
        const res = await fetch(url);
        return { status: res.status, body: await res.json().catch(() => null) };
    };
}

for (const rung of RUNGS) {
    test(`${rung.tier}: the middleware enriches a request`, { skip: skipFor(rung) }, async () => {
        const call = await serve({ apiKey: keyFor(rung) || undefined });
        const res = await call();
        assert.equal(res.status, 200, 'enrichment alone must never refuse a request');
        assert.equal(res.body.error, null, `lookup failed: ${res.body.error}`);
        assert.equal(res.body.ip, VPN_IP);
        assert.ok(res.body.members.includes('is_vpn'), 'is_vpn is on every plan');
    });
}

test('the key reaches the wire', { skip: skipFor(MAX_RUNG) }, async () => {
    const withKey = await serve({ apiKey: keyFor(MAX_RUNG) });
    const withoutKey = await serve({ apiKey: undefined });

    const paid = (await withKey()).body.members;
    const anonymous = (await withoutKey()).body.members;

    // Not a field COUNT, which a pricing change would turn red: the max tier
    // serving no more than an anonymous caller is what a dropped key looks like.
    assert.ok(
        paid.length > anonymous.length,
        `max served ${paid.join(',')} and unauthenticated served ${anonymous.join(',')},`
        + ' so the key did not reach the request',
    );
    for (const member of anonymous) {
        assert.ok(paid.includes(member), `max is missing ${member}, which unauthenticated served`);
    }
});

test('a condition blocks a real answer', { skip: skipFor(MAX_RUNG) }, async () => {
    const call = await serve({ apiKey: keyFor(MAX_RUNG), blockCondition: { isVpn: true } });
    assert.equal((await call()).status, 403);
});

test('a clean address is not blocked', { skip: skipFor(MAX_RUNG) }, async () => {
    const call = await serve({
        apiKey: keyFor(MAX_RUNG),
        ipSelector: () => '1.1.1.1',
        blockCondition: { isVpn: true },
    });
    assert.equal((await call()).status, 200);
});

test('an unreachable API fails open', async () => {
    // A reserved-for-documentation host that resolves to nothing routable, so
    // this exercises a transport failure rather than an error response.
    const call = await serve({
        baseUrl: 'https://api.invalid.vpndetection.example',
        blockCondition: { isVpn: true },
        timeoutMs: 2000,
    });
    const res = await call();
    assert.equal(res.status, 200, 'an outage of ours must not take the customer down');
    assert.ok(res.body.error !== null, 'and the reason must be on the request');
});
