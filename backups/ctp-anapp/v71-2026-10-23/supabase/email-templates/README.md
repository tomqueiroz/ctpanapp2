# Templates de autenticação do CTP ANAPP

Estes arquivos são a fonte oficial dos e-mails transacionais do Supabase Auth.
Eles não enviam e-mails por conta própria: devem ser copiados para **Authentication
→ Email Templates** no projeto Supabase `egihufoowzfykieozusr`.

## Configuração obrigatória de URLs

- Site URL: `https://ctp-anapp-3.skywork.website`
- Redirect URL de confirmação: `https://ctp-anapp-3.skywork.website/login?confirmed=1`
- Redirect URL de recuperação: `https://ctp-anapp-3.skywork.website/reset-password`

## Assuntos padronizados

- Confirmação de cadastro: `Confirme seu cadastro no CTP ANAPP`
- Recuperação de senha: `Redefina sua senha do CTP ANAPP`
- Alteração de e-mail: `Confirme seu novo e-mail no CTP ANAPP`

## Arquivos

- `confirmation.html`: confirmação de uma nova conta.
- `recovery.html`: redefinição segura de senha.
- `change-email.html`: confirmação de alteração de e-mail.

Os templates usam `{{ .ConfirmationURL }}`, variável oficial do Supabase Auth.
Não substitua essa variável por um link montado manualmente.
