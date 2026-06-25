/**
 * Controle de acesso por senha aos cases.
 *
 * Para proteger um projeto: locked: true + passwordHash.
 * Para liberar: locked: false
 *
 * Para gerar um novo hash: npm run hash-password -- "sua-senha"
 * Edite pelo painel: admin.html
 */
window.PROJECT_ACCESS = {
  adminPasswordHash: '69e8477de745e36dc0de387b967f4fc531ba9fbe23cddb03ce4280296683e7e2',
  projects: {
    'projeto-a': { locked: false, passwordHash: 'a1a839fe07a7f16447bbe6434ac6de04930efd69afa82b1a8bbb593c3c5a85d7' },
    'projeto-b': { locked: false, passwordHash: 'a1a839fe07a7f16447bbe6434ac6de04930efd69afa82b1a8bbb593c3c5a85d7' },
    'projeto-c': { locked: false, passwordHash: 'a1a839fe07a7f16447bbe6434ac6de04930efd69afa82b1a8bbb593c3c5a85d7' },
    'projeto-d': { locked: false, passwordHash: 'a1a839fe07a7f16447bbe6434ac6de04930efd69afa82b1a8bbb593c3c5a85d7' },
    'projeto-e': { locked: false, passwordHash: 'a1a839fe07a7f16447bbe6434ac6de04930efd69afa82b1a8bbb593c3c5a85d7' },
  },
  unlockTTLDays: 30,
};
