import { AbilityBuilder, createMongoAbility, MongoAbility, RawRuleOf } from '@casl/ability';

/**
 * Ações possíveis no sistema
 */
export type Action = 'manage' | 'read' | 'create' | 'update' | 'delete' | 'votar' | 'configurar';

/**
 * Assuntos (Módulos/Recursos) do sistema
 */
export type Subject = 'Sessao' | 'Materia' | 'Vereador' | 'Comissao' | 'Configuracao' | 'MesaDiretora' | 'all';

/**
 * Definição do tipo de Abilidade para o TypeScript
 */
export type AppAbility = MongoAbility<[Action, Subject]>;

/**
 * Define as regras de abilidade baseadas no papel (role) do usuário
 */
export function defineAbilityFor(role: string) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (role === 'ADMIN') {
    // Admin pode fazer tudo em tudo
    can('manage', 'all');
  } 
  
  else if (role === 'PRESIDENTE') {
    // Presidente pode fazer quase tudo o que o ADMIN faz
    can('manage', 'all');
    
    // EXCETO:
    // 1. Excluir sessões
    cannot('delete', 'Sessao');
    
    // 2. Editar dados da câmara nas configurações
    cannot('update', 'Configuracao');
    
    // Pode votar
    can('votar', 'Sessao');
  } 
  
  else if (role === 'VEREADOR') {
    // Vereador pode visualizar tudo
    can('read', 'all');
    
    // Pode votar
    can('votar', 'Sessao');
    
    // Pode criar/editar matérias (geralmente permitido a todos os parlamentares)
    can('create', 'Materia');
    can('update', 'Materia');
  } 
  
  else {
    // Papéis desconhecidos ou 'PUBLICO' só podem ler
    can('read', 'all');
  }

  return build();
}
