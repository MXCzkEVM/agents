import type { TransactionDescription } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Interface, JsonRpcProvider, verifyMessage, Wallet } from 'ethers'

import { parseMessage } from './utils'

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
    const { privateKey, rpc } = parseOptions(req)
    const provider = new JsonRpcProvider(rpc)
    const signer = new Wallet(privateKey, provider)
    const nonce = Number(await signer.getNonce())
    if (!req.url?.startsWith('/api/agents'))
      return
    if (req.method !== 'POST')
      return res.status(405).json({ error: 'Method not allowed' })

    if (req.url === '/api/agents/proof') {
      const message = await parseMessage(
        req.body.from,
        req.body.to,
        req.body.parsed,
        nonce,
      )
      cache.set(req.body.from, nonce)
      return res.status(200).json({ data: message })
    }
    if (req.url === '/api/agents/agent') {
      if (!cache.has(req.body.from))
        return res.status(401).json({ error: 'Not passed' })
      const message = await parseMessage(
        req.body.from,
        req.body.to,
        req.body.parsed,
        cache.get(req.body.from)!,
      )
      const sender = verifyMessage(message, req.body.signature)
      cache.delete(req.body.from)
      if (sender !== req.body.from)
        return res.status(401).json({ error: 'Not passed' })

      const data = new Interface([req.body.parsed.fragment]).encodeFunctionData(
        req.body.parsed.name,
        req.body.parsed.args,
      )
      const populateTransaction = await signer.populateTransaction({
        from: await signer.getAddress(),
        to: req.body.to,
        data,
        value: 0,
      })
      const transaction = await signer.sendTransaction(populateTransaction)
      return res.status(200).json(transaction.toJSON())
    }

    return res.status(404).json({ error: 'Not found' })
  }
}

export interface ProofOptions {
  from: string
  to: string
  parsed: TransactionDescription
}
export interface AgentOptions {
  from: string
  to: string
  parsed: TransactionDescription
  signature: string
}

export interface AgentResponse {
  _type: 'TransactionResponse'
  chainId: string
  data: string
  from: string
  to: string
  gasLimit: string
  gasPrice: string
  hash: string
  value: string
}

// todo
export async function proof(options: ProofOptions): Promise<string> {
  const response = await fetch('/api/agents/proof', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(options),
  })
  const { data } = await response.json() as any
  return data
}
// todo
export async function agent(options: ProofOptions): Promise<AgentResponse> {
  const response = await fetch('/api/agents/agent', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(options),
  })
  return await response.json() as any
}
