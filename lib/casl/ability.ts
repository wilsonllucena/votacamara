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
export function defineAbilityFor(role: string, vereadorId: string | null = null) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (role === 'ADMIN') {
    // Admin pode fazer tudo em tudo
    can('manage', 'all');
    can('manage', 'Vereador');
    can('manage', 'Materia');
  } 
  
  else if (role === 'PRESIDENTE') {
    // Presidente pode fazer quase tudo o que o ADMIN faz
    can('manage', 'all');
    can('manage', 'Vereador');
    can('manage', 'Materia');
    
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
    
    // Pode criar matérias
    can('create', 'Materia');

    // Pode editar matérias que ele é autor
    if (vereadorId) {
      can('update', 'Materia', { autores_ids: vereadorId } as any);
    } else {
      // Se não tiver ID de vereador vinculado, não pode editar (segurança)
      cannot('update', 'Materia');
    }
  } 
  
  else {
    // Papéis desconhecidos ou 'PUBLICO' só podem ler
    can('read', 'all');
  }

  return build();
}
