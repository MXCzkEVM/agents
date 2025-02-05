import { ApiProperty } from '@nestjs/swagger'
import { TransactionDescription } from 'ethers'

export class ProofTransactionBody {
  @ApiProperty()
  from: string
  @ApiProperty()
  to: string
  @ApiProperty()
  parsed: TransactionDescription
}

export class ProofTransactionResponse {
  @ApiProperty()
  data: string
}

export class AgentTransactionBody {
  @ApiProperty()
  from: string
  @ApiProperty()
  to: string
  @ApiProperty()
  parsed: TransactionDescription
  @ApiProperty()
  signature: string
}

export class AgentTransactionResponse {
  @ApiProperty()
  _type: 'TransactionResponse'

  @ApiProperty()
  chainId: string

  @ApiProperty()
  data: string

  @ApiProperty()
  from: string

  @ApiProperty()
  to: string

  @ApiProperty()
  gasLimit: string

  @ApiProperty()
  gasPrice: string

  @ApiProperty()
  hash: string

  @ApiProperty()
  value: string
}