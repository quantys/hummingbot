/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/ban-types */
import { NextFunction, Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error-handler';
import {
  approve,
  allowances,
  balances,
  nonce,
  poll,
  cancel,
} from '../chains/ethereum/ethereum.controllers';
import {
  AllowancesRequest,
  AllowancesResponse,
  ApproveRequest,
  ApproveResponse,
  BalanceRequest,
  BalanceResponse,
  CancelRequest,
  CancelResponse,
  NonceRequest,
  NonceResponse,
  PollRequest,
  PollResponse,
} from './trading.requests';

import {
  validateAllowancesRequest,
  validateApproveRequest,
  validateBalanceRequest,
  validateCancelRequest,
  validateNonceRequest,
  validatePollRequest,
} from '../chains/ethereum/ethereum.validators';
import { Ethereum } from '../chains/ethereum/ethereum';
import { Avalanche } from '../chains/avalanche/avalanche';
import { Ethereumish } from '../services/ethereumish.interface';

export namespace TradingRoutes {
  export const router = Router();

  async function getChain(chain: string, network: string) {
    let chainInstance: Ethereumish;
    if (chain === 'ethereum') chainInstance = Ethereum.getInstance(network);
    else if (chain === 'avalanche')
      chainInstance = Avalanche.getInstance(network);
    else throw new Error('unsupported chain');
    if (!chainInstance.ready()) {
      await chainInstance.init();
    }
    return chainInstance;
  }

  router.post(
    '/nonce',
    asyncHandler(
      async (
        req: Request<{}, {}, NonceRequest>,
        res: Response<NonceResponse | string, {}>
      ) => {
        validateNonceRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        res.status(200).json(await nonce(chain, req.body));
      }
    )
  );

  router.post(
    '/allowances',
    asyncHandler(
      async (
        req: Request<{}, {}, AllowancesRequest>,
        res: Response<AllowancesResponse | string, {}>
      ) => {
        validateAllowancesRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        res.status(200).json(await allowances(chain, req.body));
      }
    )
  );

  router.post(
    '/balances',
    asyncHandler(
      async (
        req: Request<{}, {}, BalanceRequest>,
        res: Response<BalanceResponse | string, {}>,
        _next: NextFunction
      ) => {
        validateBalanceRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        res.status(200).json(await balances(chain, req.body));
      }
    )
  );

  router.post(
    '/approve',
    asyncHandler(
      async (
        req: Request<{}, {}, ApproveRequest>,
        res: Response<ApproveResponse | string, {}>
      ) => {
        validateApproveRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        res.status(200).json(await approve(chain, req.body));
      }
    )
  );

  router.post(
    '/poll',
    asyncHandler(
      async (
        req: Request<{}, {}, PollRequest>,
        res: Response<PollResponse, {}>
      ) => {
        validatePollRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        res.status(200).json(await poll(chain, req.body));
      }
    )
  );

  router.post(
    '/cancel',
    asyncHandler(
      async (
        req: Request<{}, {}, CancelRequest>,
        res: Response<CancelResponse, {}>
      ) => {
        validateCancelRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        res.status(200).json(await cancel(chain, req.body));
      }
    )
  );
}