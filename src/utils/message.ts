import type { TransactionDescription } from 'ethers'
import crypto from 'node:crypto'

export async function parseMessage(
  from: string,
  to: string,
  parsed: TransactionDescription,
  nonce: number,
): Promise<string> {
  const key = `${from.slice(0, 16)}:nonce`

  const inputs = parsed.fragment.inputs.map((input, index) =>
    ` ${input.name}: ${parsed.args[index]}`,
  )
  const messages = [
    `from: ${from}`,
    `contract: ${to}`,
    `method: ${parsed.name}`,
    `params: `,
    ...(inputs.length
      ? [`params: `, ...inputs]
      : []),
    `nonce: ${generateRandom(`${key}:${nonce}`)}`,
  ]

  return messages.filter(Boolean).join('\n')
}

export function generateRandom(input: string, algorithm = 'sha256'): number {
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
