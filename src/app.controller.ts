import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import { AgentTransactionBody, AgentTransactionResponse, ProofTransactionBody, ProofTransactionResponse } from './dtos';
import { getSinger, parseMessage } from './utils';
import { verifyMessage, Interface, JsonRpcProvider, Wallet } from 'ethers';
@Controller()
export class AppController {
  logger = new Logger('Agent')

  @Post('proof')
  @ApiBody({ type: ProofTransactionBody, required: true })
  @ApiResponse({ type: ProofTransactionResponse })
  async proof(@Body() body: ProofTransactionBody) {
    const message = await parseMessage(
      body.from,
      body.to,
      body.parsed,
      true
    )
    return { data: message }
  }

  @Post('agent')
  @ApiBody({ type: AgentTransactionBody, required: true })
  @ApiResponse({ type: AgentTransactionResponse })
  async agent(@Body() body: AgentTransactionBody) {
    const signer = await getSinger()
    const message = await parseMessage(
      body.from,
      body.to,
      body.parsed,
    )
    const sender = verifyMessage(message, body.signature)

    if (sender !== body.from)
      throw new Error('Agent Error: Not passed')

    try {
      const data = new Interface([body.parsed.fragment]).encodeFunctionData(
        body.parsed.name,
        body.parsed.args
      )
      const populateTransaction = await signer.populateTransaction({
        from: await signer.getAddress(),
        to: body.to,
        data,
        value: 0
      })
      const transaction = await signer.sendTransaction(populateTransaction)

      return transaction.toJSON()
    } catch (error) {
      return { statusCode: 500, ...error }
    }
  }

}
