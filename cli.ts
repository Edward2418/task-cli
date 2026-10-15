#!/usr/bin/env node
import { Command } from 'commander';
import { pathToFileURL } from 'node:url';
import { errorMessage } from './utils/errors.js';
import { writeMessage } from './utils/output.js';

export function createProgram(): Command {
  const program = new Command();
  program.name('task-cli').description('Gestión de tareas personales').version('0.1.0', '-V, --version', 'Mostrar versión')
    .helpOption('-h, --help', 'Mostrar ayuda').addHelpCommand(false).allowExcessArguments(false).exitOverride();
  program.configureOutput({ writeErr: () => {}, outputError: () => {} });
  program.configureHelp({
    formatHelp: cmd => [
      `Uso: ${cmd.name()} ${cmd.usage()}`,
      cmd.description(),
      '', 'Opciones:', ...cmd.options.map(option => `  ${option.flags}  ${option.description}`),
      '  -h, --help  Mostrar ayuda',
      ...(cmd.commands.length ? ['', 'Comandos:', ...cmd.commands.map(command => `  ${command.name()}  ${command.description()}`)] : []),
      '',
    ].join('\n'),
  });
  program.command('add <title>').description('Crear una tarea')
    .option('--description <text>', 'Descripción opcional')
    .option('--priority <priority>', 'Prioridad: high, medium, low')
    .action(async (title: string, options: { description?: string; priority?: string }) => {
      const { addCommand } = await import('./commands/add.js');
      await addCommand({ title, ...options });
    });
  program.command('list').description('Listar tareas')
    .option('--status <status>', 'Estado: todo, in-progress, done')
    .option('--priority <priority>', 'Prioridad: high, medium, low')
    .action(async (options: { status?: string; priority?: string }) => {
      const { listCommand } = await import('./commands/list.js');
      await listCommand(options);
    });
  program.command('status <id> <status>').description('Cambiar el estado de una tarea')
    .action(async (id: string, status: string) => {
      const { statusCommand } = await import('./commands/status.js');
      await statusCommand(id, status);
    });
  program.command('update <id>').description('Editar una tarea')
    .option('--title <text>', 'Nuevo título')
    .option('--description <text>', 'Nueva descripción; texto vacío para borrar')
    .option('--priority <priority>', 'Prioridad: high, medium, low')
    .action(async (id: string, options: { title?: string; description?: string; priority?: string }) => {
      const { updateCommand } = await import('./commands/update.js');
      await updateCommand(id, options);
    });
  program.command('delete <id>').description('Eliminar una tarea con confirmación')
    .option('--force', 'Eliminar sin confirmación')
    .action(async (id: string, options: { force?: boolean }) => {
      const { deleteCommand } = await import('./commands/delete.js');
      await deleteCommand(id, options.force);
    });
  program.action(() => { program.outputHelp(); });
  return program;
}

export async function main(args = process.argv): Promise<void> {
  try {
    await createProgram().parseAsync(args);
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
    if (code === 'commander.helpDisplayed' || code === 'commander.version') return;
    writeMessage(errorMessage(error), process.stderr);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
