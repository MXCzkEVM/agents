import { JsonRpcProvider, Wallet } from "ethers"
import { Redis } from '@upstash/redis'

export async function getSinger() {
  let privateKey: string
  const provider = new JsonRpcProvider(process.env.AGENT_NETWORK_RPC)

  if (process.env.UPSTASH_REST_URL) {
    const redis = new Redis({
      url: process.env.UPSTASH_REST_URL,
      token: process.env.UPSTASH_REST_TOKEN,
    })
    privateKey = await redis.get('AGENT_PRIVATE_KEY')
  }

  if (process.env.AGENT_PRIVATE_KEY)
    privateKey = process.env.AGENT_PRIVATE_KEY

  return new Wallet(privateKey, provider)
}