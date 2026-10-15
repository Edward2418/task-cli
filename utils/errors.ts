export function userError(message: string): Error {
  return Object.assign(new Error(message), { code: 'TASK_INPUT' });
}

export function errorMessage(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (code === 'TASK_INPUT' && error instanceof Error) return error.message;
  if (code.startsWith('commander.')) return 'Argumentos no válidos. Consulte task-cli --help o la ayuda del comando.';
  if (code.startsWith('SQLITE_BUSY') || code.startsWith('SQLITE_LOCKED')) {
    return 'El almacenamiento está ocupado. Vuelva a reintentar la operación.';
  }
  if (code === 'SQLITE_CORRUPT' || code === 'SQLITE_NOTADB') {
    return 'No se puede leer la base de datos. Restaure una copia válida; el archivo no se ha reemplazado.';
  }
  if (code.startsWith('SQLITE_CONSTRAINT')) {
    return 'No se pudo guardar la tarea por una restricción de datos. Revise los valores y el límite de IDs.';
  }
  if (['EACCES', 'EPERM', 'ENOSPC', 'ENOENT', 'ENOTDIR', 'SQLITE_CANTOPEN', 'SQLITE_READONLY', 'SQLITE_FULL', 'SQLITE_IOERR'].some(value => code.startsWith(value))) {
    return 'No se pudo acceder al almacenamiento. Revise la ruta, los permisos y el espacio disponible.';
  }
  return 'No se pudo completar la operación. Revise la instalación y el acceso al almacenamiento; vuelva a intentarlo.';
}
