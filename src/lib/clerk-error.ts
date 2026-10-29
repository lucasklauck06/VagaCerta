import { isClerkAPIResponseError } from '@clerk/expo';

// Traduz erros do Clerk (login e cadastro) para mensagens amigáveis.
export function errorMessage(e: unknown) {
  const code = isClerkAPIResponseError(e) ? e.errors[0]?.code : (e as { code?: string })?.code;
  switch (code) {
    case 'form_password_incorrect':
      return 'Senha incorreta.';
    case 'form_identifier_not_found':
      return 'Não existe conta com esse e-mail.';
    case 'form_identifier_exists':
      return 'Já existe uma conta com esse e-mail.';
    case 'form_param_format_invalid':
      return 'E-mail inválido.';
    case 'form_password_pwned':
      return 'Essa senha apareceu em vazamentos de dados. Escolha outra.';
    case 'form_code_incorrect':
      return 'Código incorreto.';
    case 'network_error':
      return 'Sem conexão. Verifique sua internet.';
  }
  if (e instanceof TypeError || /network/i.test(String((e as Error)?.message))) {
    return 'Sem conexão. Verifique sua internet.';
  }
  // Inclui senha fraca/curta: o Clerk já devolve a regra exata em longMessage.
  if (isClerkAPIResponseError(e)) return e.errors[0]?.longMessage ?? e.message;
  return (e as Error)?.message ?? 'Algo deu errado. Tente novamente.';
}
