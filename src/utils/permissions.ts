export type Permissao = 'admin' | 'visualizador';

export function checkPermission(
  userPermissao: Permissao,
  requiredPermissao: Permissao
): boolean {
  if (requiredPermissao === 'admin') {
    return userPermissao === 'admin';
  }
  return true;
}

export function canEditData(userPermissao: Permissao): boolean {
  return userPermissao === 'admin';
}

export function canDeleteData(userPermissao: Permissao): boolean {
  return userPermissao === 'admin';
}
