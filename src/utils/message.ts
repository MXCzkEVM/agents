import crypto from 'node:crypto'
import { TransactionDescription } from "ethers";
import { storage } from "./storage";

export async function parseMessage(
  from: string,
  to: string,
  parsed: TransactionDescription,
  next?: boolean
) {
  const key = `${from.slice(0, 16)}:nonce`
  let nonce = await storage.getItem<number>(key) || 0
  
  if (next) {
    nonce++
    await storage.setItem(key, nonce)
  }

  const inputs = parsed.fragment.inputs.map((input, index) =>
    ` ${input.name}: ${parsed.args[index]}`
  )
  const messages = [
    `From: ${from}`,
    `Contract: ${to}`,
    `Params: `,
    ...(inputs.length
      ? [`Params: `, ...inputs] 
      : []),
    `UNonce: ${generateRandom(`${key}:${nonce}`)}`,
  ]

  return messages.filter(Boolean).join('\n')
}


export function generateRandom(input: string, algorithm = 'sha256') {
  const hash = crypto.createHash(algorithm)
  hash.update(input)
  const hashValue = hash.digest('hex')

  // Convert the hexadecimal hash value to a decimal number
  const decimal = Number.parseInt(hashValue, 16)
  // Limit the random number to a specific range
  const min = 0
  const max = 100000

  return min + (decimal % (max - min + 1))
}
