# CTP ANAPP e.Rede gateway

Gateway mínimo para fazer chamadas OAuth 2.0 e transações e.Rede a partir do
IPv4 fixo do CTP ANAPP.

## Segurança

- O processo escuta somente em `127.0.0.1:8080`.
- O Caddy publica exclusivamente HTTPS.
- Os endpoints de OAuth e transação exigem HMAC-SHA256, timestamp e nonce.
- Cada transação exige uma chave de idempotência persistida antes da chamada.
- PAN, CVV, OAuth token e secrets não são registrados em logs ou no arquivo de
  idempotência.
- O gateway força crédito com captura automática.

## Rotas

- `GET /health`: verificação pública sem dados sensíveis.
- `POST /v1/rede/oauth/status`: validação OAuth autenticada por HMAC.
- `POST /v1/rede/transactions`: autorização e captura e.Rede autenticada por
  HMAC e chave de idempotência.

As credenciais ficam somente no servidor em
`C:\ProgramData\CTPANAPP\gateway-config.json`, com ACL restrita a
`SYSTEM` e `Administrators`.
