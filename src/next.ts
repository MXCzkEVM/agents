/* eslint-disable ts/ban-ts-comment */
import type { FunctionFragment } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Interface, JsonRpcProvider, verifyMessage, Wallet } from 'ethers'
import { parseMessage } from './utils'

// @ts-expect-error
BigInt.prototype.toJSON = function () {
  return this.toString()
}
export interface Transaction {
  from?: string
  data: string
  to: string
}
export interface SignedTransaction extends Transaction {
  signature: string
}
export interface TransactionReceipt {
  chainId: string
  data: string
  from: string
  to: string
  gasLimit: string
  gasPrice: string
  hash: string
  value: string
}
export interface TransactionAgentsOptions {
  privateKey: string | ((req: NextApiRequest) => string)
  rpc: string | ((req: NextApiRequest) => string)
}

export function TransactionAgents(options: TransactionAgentsOptions) {
  const cache = new Map<string, number>()

  function parseOptions(req: NextApiRequest) {
    const privateKey = typeof options.privateKey === 'function' ? options.privateKey(req) : options.privateKey
    const rpc = typeof options.rpc === 'function' ? options.rpc(req) : options.rpc
    return { privateKey, rpc }
  }

  return async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (!req.url?.startsWith('/api/agents'))
      return
    if (req.method !== 'POST')
      return res.status(405).json({ error: 'Method not allowed' })

    if (!req.body.data)
      return res.status(400).json({ error: 'Missing data' })

    const { privateKey, rpc } = parseOptions(req)
    const provider = new JsonRpcProvider(rpc)
    const signer = new Wallet(privateKey, provider)
    const nonce = cache.get(req.body.from)
    const interf = new Interface([req.body.fragment])
    const parsed = interf.parseTransaction({ data: req.body.data })

    if (!parsed)
      return res.status(400).json({ error: 'Invalid data' })

    if (req.url === '/api/agents/proof') {
      const nonce = Number(await signer.getNonce())
      const message = await parseMessage(
        req.body.from,
        req.body.to,
        parsed,
        nonce,
      )
      cache.set(req.body.from, nonce)
      return res.status(200).json({ data: message })
    }
    if (req.url === '/api/agents/agent') {
      if (!nonce)
        return res.status(401).json({ error: 'Not passed' })
      const message = await parseMessage(
        req.body.from,
        req.body.to,
        parsed,
        nonce,
      )
      const sender = verifyMessage(message, req.body.signature)

      if (sender !== req.body.from)
        return res.status(401).json({ error: 'Not passed' })

      cache.delete(req.body.from)

      try {
        const populateTransaction = await signer.populateTransaction({
          from: await signer.getAddress(),
          to: req.body.to,
          data: req.body.data,
          value: 0,
        })
        const transaction = await signer.sendTransaction(populateTransaction)
        return res.status(200).json(transaction.toJSON())
      }
      catch (error: any) {
        res.status(500).json({ statusCode: 500, ...error })
      }
    }

    return res.status(404).json({ error: 'Not found' })
  }
}

// todo
export async function proof(fragment: FunctionFragment, transaction: Transaction): Promise<string> {
  const response = await fetch('/api/agents/proof', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ fragment, ...transaction }),
  })

  const { data } = await response.json() as any
  return data
}
// todo
export async function agent(fragment: FunctionFragment, transaction: SignedTransaction): Promise<TransactionReceipt> {
  const response = await fetch('/api/agents/agent', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ fragment, ...transaction }),
  })
  return await response.json() as any
}
