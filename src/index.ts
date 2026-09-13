import { bindSelectors, createCore } from 'vpndetection/middleware';
import type { IpSelector, Lookup, MiddlewareOptions } from 'vpndetection/middleware';

import type { NextFunction, Request, RequestHandler, Response } from 'express';

export type { BlockCondition, IpSelector, Lookup, NumericBound } from 'vpndetection/middleware';

declare global {
    namespace Express {
        interface Request {
            /**
             * What the middleware found out about this visitor. Absent when the
             * middleware has not run for this route, or when `skip` claimed it.
             */
            vpndetection?: Lookup;
        }
    }
}

export interface Options extends MiddlewareOptions<Request> {
    /**
     * How a blocked request is answered. Defaults to `403` with a short JSON
     * body. Whatever you pass must end the response.
     */
    onBlocked?: (req: Request, res: Response, lookup: Lookup) => void;
}

/**
 * Classify the visitor and hang the answer off `req.vpndetection`.
 *
 * Without a `blockCondition` this only enriches the request and never refuses
 * one, leaving the decision to your own handlers. With one, a matching request
 * is answered by `onBlocked` and never reaches them.
 *
 * A lookup that fails - network, quota, an outage of ours - lets the request
 * through and records why on `req.vpndetection.error`, unless you set
 * `failClosed`.
 */
export function vpndetection(options: Options = {}): RequestHandler {
    const core = createCore<Request>(options, defaultIpSelector);
    const onBlocked = options.onBlocked ?? refuse;
    return (req: Request, res: Response, next: NextFunction) => {
        core.evaluate(req).then((lookup) => {
            if (lookup === undefined) {
                next();
                return;
            }
            req.vpndetection = lookup;
            if (lookup.blocked) {
                onBlocked(req, res, lookup);
                return;
            }
            next();
        }, next);
    };
}

const view = (req: Request) => ({
    header: (name: string) => {
        const value = req.headers[name.toLowerCase()];
        return Array.isArray(value) ? value[0] : value;
    },
    frameworkIp: () => req.ip,
});

// Each of these is annotated rather than inferred: the inferred shape reaches
// through `@types/express` into its own transitive types, which TypeScript
// refuses to name in a declaration file a consumer would have to resolve.
const selectors = bindSelectors<Request>(view);

/**
 * `req.ip`, which is the socket peer unless you have set Express's `trust
 * proxy`. Behind a load balancer without it, every visitor looks like the load
 * balancer - so if you are behind one, set it or pick another selector.
 */
export const defaultIpSelector: IpSelector<Request> = selectors.defaultIpSelector;

/**
 * An address from `X-Forwarded-For`.
 *
 * **The left-most entry is whatever the caller sent**, since proxies append, so
 * this is only trustworthy when an edge you control overwrites the header. When
 * you know how many proxies sit in front, count from the right instead:
 * `xffIpSelector({ depth: 1 })` is the address your nearest proxy saw.
 */
export const xffIpSelector: (options?: { depth?: number }) => IpSelector<Request>
    = selectors.xffIpSelector;

/**
 * An address from a single-value header your edge writes -
 * `headerIpSelector('CF-Connecting-IP')` behind Cloudflare,
 * `headerIpSelector('True-Client-IP')` behind Akamai. Falls back to `req.ip`
 * when the header is absent.
 */
export const headerIpSelector: (name: string) => IpSelector<Request>
    = selectors.headerIpSelector;

function refuse(_req: Request, res: Response) {
    res.status(403).json({ error: 'access denied' });
}
