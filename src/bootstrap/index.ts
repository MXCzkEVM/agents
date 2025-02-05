import { INestApplication, Logger } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export function withNestjsRepairDecimal(_app: INestApplication) {
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    get() { return () => String(this) },
  })
}

export function withNestjsSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Agent Server Swagger')
    .setDescription('The Moonchain Transaction Agents libraries are designed for proxying transactions on Moonchain or other chains, allowing users to send contract transactions without paying gas fees.')
    .setVersion('1.0.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup(
    '_swagger',
    app, document,
    { jsonDocumentUrl: 'swagger/json' }
  )
}
export function withNestjsListen(app: INestApplication, port: string | number) {
  const logger = new Logger()
  app.listen(port).then(() => {
    logger.log(`${('Listening on:')} ${(`http://127.0.0.1:${port}`)}`)
    logger.log(`${('Swaggier URL:')} ${(`http://127.0.0.1:${port}/_swagger`)}`)
  })
}