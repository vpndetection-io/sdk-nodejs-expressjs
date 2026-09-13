// Which plan tiers this run can observe, and the secret each one needs.
//
// Imported by `scripts/run.mjs` as well as by the tests, so it must not import
// the package under test: the runner reads it BEFORE `npm install` has put
// anything in `node_modules`.
//
// A tier is observable only when its secret holds something non-empty. Actions
// interpolates a secret that does not exist to an EMPTY STRING rather than
// leaving the variable unset, and `new VPNDetection({ apiKey: '' })` sends no
// auth header at all, so an empty key runs as a second unauthenticated client
// and every comparison against it is vacuously true.

// Ascending, one rung per plan tier. `widens` is what the rung promises against
// whichever observable rung sits below it: a paid tier serves strictly more than
// the tier under it, while a free key and no key at all are the same
// entitlement reached two ways.
//
// Field COUNTS are deliberately absent. Pinning "starter answers seven fields"
// turns a pricing change into a red SDK build; the relation between the tiers is
// what the client actually has to keep.
export const RUNGS = [
    { tier: 'unauth', secret: null, widens: false },
    { tier: 'free', secret: 'VPNDETECTION_STAGING_KEY_FREE', widens: false },
    { tier: 'starter', secret: 'VPNDETECTION_STAGING_KEY_STARTER', widens: true },
    { tier: 'scale', secret: 'VPNDETECTION_STAGING_KEY_SCALE', widens: true },
    { tier: 'max', secret: 'VPNDETECTION_STAGING_KEY_MAX', widens: true },
];

export const UNAUTH_RUNG = RUNGS[0];
export const MAX_RUNG = RUNGS[RUNGS.length - 1];

export function keyFor(rung) {
    if (rung.secret === null) {
        return '';
    }
    return (process.env[rung.secret] ?? '').trim();
}

// A reason string, or false, which is the shape node:test's `skip` option wants.
export function skipFor(rung) {
    if (rung.secret === null || keyFor(rung) !== '') {
        return false;
    }
    return `${rung.secret} is not set, so the ${rung.tier} tier cannot be exercised`;
}

export function observableRungs() {
    return RUNGS.filter((rung) => skipFor(rung) === false);
}
