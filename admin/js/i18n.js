/**
 * Internationalization (i18n) for Admin Console
 * Supports: English, Portuguese, Spanish
 */

window.AdminI18n = {
  currentLang: 'en',

  translations: {
    en: {
      // Header
      'header.title': 'Admin Console',
      'header.configuration': 'Configuration',
      'header.logout': 'Logout',

      // Loading
      'loading.console': 'Loading Admin Console...',
      'loading.systemConfig': 'Loading system configuration...',
      'loading.auditLog': 'Loading audit log...',

      // Client Selector
      'client.label': 'Client:',
      'client.select': 'Select a client...',
      'client.selectToView': 'Select a client to view their configuration',

      // Sidebar Tabs
      'tab.overview': 'Overview',
      'tab.schedule': 'Schedule',
      'tab.themes': 'Themes',
      'tab.prompts': 'Prompts',
      'tab.rules': 'Rules',
      'tab.branding': 'Branding',
      'tab.hashtags': 'Hashtags',
      'tab.system': 'System',
      'tab.auditLog': 'Audit Log',

      // Overview Tab
      'overview.clientInfo': 'Client Information',
      'overview.clientId': 'Client ID:',
      'overview.clientKey': 'Client Key:',
      'overview.businessName': 'Business Name:',
      'overview.status': 'Status:',
      'overview.industry': 'Industry:',
      'overview.timezone': 'Timezone:',
      'overview.created': 'Created:',
      'overview.onboarding': 'Onboarding:',
      'overview.quickStats': 'Quick Stats',
      'overview.themes': 'Themes',
      'overview.prompts': 'Prompts',
      'overview.pendingPosts': 'Pending Posts',
      'overview.failedTasks': 'Failed Tasks',
      'overview.quickActions': 'Quick Actions',
      'overview.resetFailed': 'Reset Failed Tasks',
      'overview.resendWelcome': 'Resend Welcome Email',
      'overview.deleteClient': 'Delete Client...',

      // Schedule Tab
      'schedule.title': 'Schedule Settings',
      'schedule.addPlatform': 'Add Platform',
      'schedule.selectClient': 'Select a client to manage schedules',

      // Themes Tab
      'themes.title': 'Content Themes',
      'themes.filter': 'All Themes',
      'themes.filterActive': 'Active Only',
      'themes.filterInactive': 'Inactive Only',
      'themes.addTheme': 'Add Theme',
      'themes.selectClient': 'Select a client to manage themes',
      'themes.theme': 'Theme',
      'themes.category': 'Category',
      'themes.used': 'Used',
      'themes.priority': 'Priority',
      'themes.active': 'Active',
      'themes.actions': 'Actions',
      'themes.enableSelected': 'Enable Selected',
      'themes.disableSelected': 'Disable Selected',
      'themes.resetUsage': 'Reset Usage',

      // Prompts Tab
      'prompts.title': 'AI Prompts',
      'prompts.warning': 'Warning: Editing prompts affects AI content generation quality.',
      'prompts.addPrompt': 'Add Prompt',
      'prompts.selectClient': 'Select a client to manage prompts',
      'prompts.type': 'Type',
      'prompts.platform': 'Platform',
      'prompts.length': 'Length',
      'prompts.active': 'Active',
      'prompts.actions': 'Actions',

      // Rules Tab
      'rules.title': 'Client Rules',
      'rules.warning': 'Advanced: Changes here affect core system behavior.',
      'rules.validateJson': 'Validate JSON',
      'rules.saveRules': 'Save Rules',
      'rules.selectClient': 'Select a client to manage rules',
      'rules.aiSettings': 'AI Settings',
      'rules.model': 'Model',
      'rules.temperature': 'Temperature',
      'rules.maxTokens': 'Max Tokens',
      'rules.limits': 'Limits',
      'rules.maxTasksPerRun': 'Max Tasks Per Run',
      'rules.taskDedupe': 'Task Dedupe (sec)',
      'rules.followupCooldown': 'Followup Cooldown (sec)',
      'rules.rawJsonEditor': 'Raw JSON Editor',
      'rules.rawJsonWarning': 'Edit with caution. Invalid JSON will be rejected.',

      // Branding Tab
      'branding.title': 'Branding Settings',
      'branding.saveBranding': 'Save Branding',
      'branding.selectClient': 'Select a client to manage branding',
      'branding.logo': 'Logo',
      'branding.uploadLogo': 'Upload Logo',
      'branding.logoHelp': 'PNG, JPG, GIF or WebP. Max 2MB. Recommended: 512x512',
      'branding.remove': 'Remove',
      'branding.colors': 'Colors',
      'branding.primaryColor': 'Primary:',
      'branding.secondaryColor': 'Secondary:',
      'branding.companyInfo': 'Company Info',
      'branding.tagline': 'Tagline',
      'branding.taglinePlaceholder': 'Connect. Automate. Grow.',
      'branding.emailFooter': 'Email Footer HTML',
      'branding.footerPlaceholder': '<p>Best regards,<br>The Team</p>',

      // Hashtags Tab
      'hashtags.title': 'Hashtag Packs',
      'hashtags.addPack': 'Add Pack',
      'hashtags.selectClient': 'Select a client to manage hashtags',
      'hashtags.pack': 'Pack',
      'hashtags.category': 'Category',
      'hashtags.platform': 'Platform',
      'hashtags.count': 'Hashtags',
      'hashtags.active': 'Active',
      'hashtags.actions': 'Actions',

      // System Tab
      'system.title': 'System Settings',
      'system.warning': 'Changes affect ALL clients',
      'system.addConfig': 'Add Config',
      'system.refresh': 'Refresh',
      'system.platformLimits': 'Platform Limits',
      'system.platform': 'Platform:',
      'system.maxCaptionLength': 'Max Caption Length',
      'system.maxHashtags': 'Max Hashtags',
      'system.maxCarouselSlides': 'Max Carousel Slides',
      'system.optimalHashtags': 'Optimal Hashtag Count',
      'system.savePlatformConfig': 'Save Platform Config',

      // Audit Log Tab
      'audit.title': 'Audit Log',
      'audit.subtitle': 'Track all admin actions and configuration changes',
      'audit.refresh': 'Refresh',
      'audit.filterClient': 'Client',
      'audit.filterClientAll': 'All Clients',
      'audit.filterAction': 'Action Type',
      'audit.filterActionAll': 'All Actions',
      'audit.filterCreate': 'Create',
      'audit.filterUpdate': 'Update',
      'audit.filterDelete': 'Delete',
      'audit.filterEntity': 'Entity Type',
      'audit.filterEntityAll': 'All Entities',
      'audit.filterDate': 'Date Range',
      'audit.last7days': 'Last 7 days',
      'audit.last30days': 'Last 30 days',
      'audit.last90days': 'Last 90 days',
      'audit.allTime': 'All time',
      'audit.timestamp': 'Timestamp',
      'audit.actor': 'Actor',
      'audit.action': 'Action',
      'audit.entity': 'Entity',
      'audit.client': 'Client',
      'audit.details': 'Details',
      'audit.showing': 'Showing',
      'audit.of': 'of',
      'audit.entries': 'entries',
      'audit.previous': 'Previous',
      'audit.next': 'Next',

      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.actions': 'Actions',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.active': 'Active',
      'common.inactive': 'Inactive',

      // Language selector
      'lang.english': 'English',
      'lang.portuguese': 'Português (BR)',
      'lang.spanish': 'Español'
    },

    pt: {
      // Header
      'header.title': 'Console Admin',
      'header.configuration': 'Configuração',
      'header.logout': 'Sair',

      // Loading
      'loading.console': 'Carregando Console Admin...',
      'loading.systemConfig': 'Carregando configuração do sistema...',
      'loading.auditLog': 'Carregando log de auditoria...',

      // Client Selector
      'client.label': 'Cliente:',
      'client.select': 'Selecione um cliente...',
      'client.selectToView': 'Selecione um cliente para ver sua configuração',

      // Sidebar Tabs
      'tab.overview': 'Visão Geral',
      'tab.schedule': 'Agenda',
      'tab.themes': 'Temas',
      'tab.prompts': 'Prompts',
      'tab.rules': 'Regras',
      'tab.branding': 'Marca',
      'tab.hashtags': 'Hashtags',
      'tab.system': 'Sistema',
      'tab.auditLog': 'Log de Auditoria',

      // Overview Tab
      'overview.clientInfo': 'Informações do Cliente',
      'overview.clientId': 'ID do Cliente:',
      'overview.clientKey': 'Chave do Cliente:',
      'overview.businessName': 'Nome da Empresa:',
      'overview.status': 'Status:',
      'overview.industry': 'Indústria:',
      'overview.timezone': 'Fuso Horário:',
      'overview.created': 'Criado:',
      'overview.onboarding': 'Onboarding:',
      'overview.quickStats': 'Estatísticas Rápidas',
      'overview.themes': 'Temas',
      'overview.prompts': 'Prompts',
      'overview.pendingPosts': 'Posts Pendentes',
      'overview.failedTasks': 'Tarefas Falhas',
      'overview.quickActions': 'Ações Rápidas',
      'overview.resetFailed': 'Resetar Tarefas Falhas',
      'overview.resendWelcome': 'Reenviar Email de Boas-vindas',
      'overview.deleteClient': 'Excluir Cliente...',

      // Schedule Tab
      'schedule.title': 'Configurações de Agenda',
      'schedule.addPlatform': 'Adicionar Plataforma',
      'schedule.selectClient': 'Selecione um cliente para gerenciar agendas',

      // Themes Tab
      'themes.title': 'Temas de Conteúdo',
      'themes.filter': 'Todos os Temas',
      'themes.filterActive': 'Apenas Ativos',
      'themes.filterInactive': 'Apenas Inativos',
      'themes.addTheme': 'Adicionar Tema',
      'themes.selectClient': 'Selecione um cliente para gerenciar temas',
      'themes.theme': 'Tema',
      'themes.category': 'Categoria',
      'themes.used': 'Usado',
      'themes.priority': 'Prioridade',
      'themes.active': 'Ativo',
      'themes.actions': 'Ações',
      'themes.enableSelected': 'Ativar Selecionados',
      'themes.disableSelected': 'Desativar Selecionados',
      'themes.resetUsage': 'Resetar Uso',

      // Prompts Tab
      'prompts.title': 'Prompts de IA',
      'prompts.warning': 'Aviso: Editar prompts afeta a qualidade da geração de conteúdo por IA.',
      'prompts.addPrompt': 'Adicionar Prompt',
      'prompts.selectClient': 'Selecione um cliente para gerenciar prompts',
      'prompts.type': 'Tipo',
      'prompts.platform': 'Plataforma',
      'prompts.length': 'Tamanho',
      'prompts.active': 'Ativo',
      'prompts.actions': 'Ações',

      // Rules Tab
      'rules.title': 'Regras do Cliente',
      'rules.warning': 'Avançado: Alterações aqui afetam o comportamento central do sistema.',
      'rules.validateJson': 'Validar JSON',
      'rules.saveRules': 'Salvar Regras',
      'rules.selectClient': 'Selecione um cliente para gerenciar regras',
      'rules.aiSettings': 'Configurações de IA',
      'rules.model': 'Modelo',
      'rules.temperature': 'Temperatura',
      'rules.maxTokens': 'Máx Tokens',
      'rules.limits': 'Limites',
      'rules.maxTasksPerRun': 'Máx Tarefas Por Execução',
      'rules.taskDedupe': 'Dedupe de Tarefa (seg)',
      'rules.followupCooldown': 'Cooldown de Followup (seg)',
      'rules.rawJsonEditor': 'Editor JSON Bruto',
      'rules.rawJsonWarning': 'Edite com cuidado. JSON inválido será rejeitado.',

      // Branding Tab
      'branding.title': 'Configurações de Marca',
      'branding.saveBranding': 'Salvar Marca',
      'branding.selectClient': 'Selecione um cliente para gerenciar marca',
      'branding.logo': 'Logo',
      'branding.uploadLogo': 'Enviar Logo',
      'branding.logoHelp': 'PNG, JPG, GIF ou WebP. Máx 2MB. Recomendado: 512x512',
      'branding.remove': 'Remover',
      'branding.colors': 'Cores',
      'branding.primaryColor': 'Primária:',
      'branding.secondaryColor': 'Secundária:',
      'branding.companyInfo': 'Info da Empresa',
      'branding.tagline': 'Slogan',
      'branding.taglinePlaceholder': 'Conecte. Automatize. Cresça.',
      'branding.emailFooter': 'Rodapé de Email HTML',
      'branding.footerPlaceholder': '<p>Atenciosamente,<br>A Equipe</p>',

      // Hashtags Tab
      'hashtags.title': 'Pacotes de Hashtags',
      'hashtags.addPack': 'Adicionar Pacote',
      'hashtags.selectClient': 'Selecione um cliente para gerenciar hashtags',
      'hashtags.pack': 'Pacote',
      'hashtags.category': 'Categoria',
      'hashtags.platform': 'Plataforma',
      'hashtags.count': 'Hashtags',
      'hashtags.active': 'Ativo',
      'hashtags.actions': 'Ações',

      // System Tab
      'system.title': 'Configurações do Sistema',
      'system.warning': 'Alterações afetam TODOS os clientes',
      'system.addConfig': 'Adicionar Config',
      'system.refresh': 'Atualizar',
      'system.platformLimits': 'Limites de Plataforma',
      'system.platform': 'Plataforma:',
      'system.maxCaptionLength': 'Máx Tamanho da Legenda',
      'system.maxHashtags': 'Máx Hashtags',
      'system.maxCarouselSlides': 'Máx Slides Carrossel',
      'system.optimalHashtags': 'Qtd Ideal de Hashtags',
      'system.savePlatformConfig': 'Salvar Config de Plataforma',

      // Audit Log Tab
      'audit.title': 'Log de Auditoria',
      'audit.subtitle': 'Rastreie todas as ações de admin e alterações de configuração',
      'audit.refresh': 'Atualizar',
      'audit.filterClient': 'Cliente',
      'audit.filterClientAll': 'Todos os Clientes',
      'audit.filterAction': 'Tipo de Ação',
      'audit.filterActionAll': 'Todas as Ações',
      'audit.filterCreate': 'Criar',
      'audit.filterUpdate': 'Atualizar',
      'audit.filterDelete': 'Excluir',
      'audit.filterEntity': 'Tipo de Entidade',
      'audit.filterEntityAll': 'Todas as Entidades',
      'audit.filterDate': 'Período',
      'audit.last7days': 'Últimos 7 dias',
      'audit.last30days': 'Últimos 30 dias',
      'audit.last90days': 'Últimos 90 dias',
      'audit.allTime': 'Todo o período',
      'audit.timestamp': 'Data/Hora',
      'audit.actor': 'Ator',
      'audit.action': 'Ação',
      'audit.entity': 'Entidade',
      'audit.client': 'Cliente',
      'audit.details': 'Detalhes',
      'audit.showing': 'Mostrando',
      'audit.of': 'de',
      'audit.entries': 'entradas',
      'audit.previous': 'Anterior',
      'audit.next': 'Próximo',

      // Common
      'common.save': 'Salvar',
      'common.cancel': 'Cancelar',
      'common.edit': 'Editar',
      'common.delete': 'Excluir',
      'common.actions': 'Ações',
      'common.yes': 'Sim',
      'common.no': 'Não',
      'common.active': 'Ativo',
      'common.inactive': 'Inativo',

      // Language selector
      'lang.english': 'English',
      'lang.portuguese': 'Português (BR)',
      'lang.spanish': 'Español'
    },

    es: {
      // Header
      'header.title': 'Consola Admin',
      'header.configuration': 'Configuración',
      'header.logout': 'Salir',

      // Loading
      'loading.console': 'Cargando Consola Admin...',
      'loading.systemConfig': 'Cargando configuración del sistema...',
      'loading.auditLog': 'Cargando log de auditoría...',

      // Client Selector
      'client.label': 'Cliente:',
      'client.select': 'Selecciona un cliente...',
      'client.selectToView': 'Selecciona un cliente para ver su configuración',

      // Sidebar Tabs
      'tab.overview': 'Vista General',
      'tab.schedule': 'Horarios',
      'tab.themes': 'Temas',
      'tab.prompts': 'Prompts',
      'tab.rules': 'Reglas',
      'tab.branding': 'Marca',
      'tab.hashtags': 'Hashtags',
      'tab.system': 'Sistema',
      'tab.auditLog': 'Log de Auditoría',

      // Overview Tab
      'overview.clientInfo': 'Información del Cliente',
      'overview.clientId': 'ID del Cliente:',
      'overview.clientKey': 'Clave del Cliente:',
      'overview.businessName': 'Nombre del Negocio:',
      'overview.status': 'Estado:',
      'overview.industry': 'Industria:',
      'overview.timezone': 'Zona Horaria:',
      'overview.created': 'Creado:',
      'overview.onboarding': 'Onboarding:',
      'overview.quickStats': 'Estadísticas Rápidas',
      'overview.themes': 'Temas',
      'overview.prompts': 'Prompts',
      'overview.pendingPosts': 'Posts Pendientes',
      'overview.failedTasks': 'Tareas Fallidas',
      'overview.quickActions': 'Acciones Rápidas',
      'overview.resetFailed': 'Reiniciar Tareas Fallidas',
      'overview.resendWelcome': 'Reenviar Email de Bienvenida',
      'overview.deleteClient': 'Eliminar Cliente...',

      // Schedule Tab
      'schedule.title': 'Configuración de Horarios',
      'schedule.addPlatform': 'Agregar Plataforma',
      'schedule.selectClient': 'Selecciona un cliente para gestionar horarios',

      // Themes Tab
      'themes.title': 'Temas de Contenido',
      'themes.filter': 'Todos los Temas',
      'themes.filterActive': 'Solo Activos',
      'themes.filterInactive': 'Solo Inactivos',
      'themes.addTheme': 'Agregar Tema',
      'themes.selectClient': 'Selecciona un cliente para gestionar temas',
      'themes.theme': 'Tema',
      'themes.category': 'Categoría',
      'themes.used': 'Usado',
      'themes.priority': 'Prioridad',
      'themes.active': 'Activo',
      'themes.actions': 'Acciones',
      'themes.enableSelected': 'Activar Seleccionados',
      'themes.disableSelected': 'Desactivar Seleccionados',
      'themes.resetUsage': 'Reiniciar Uso',

      // Prompts Tab
      'prompts.title': 'Prompts de IA',
      'prompts.warning': 'Advertencia: Editar prompts afecta la calidad de generación de contenido por IA.',
      'prompts.addPrompt': 'Agregar Prompt',
      'prompts.selectClient': 'Selecciona un cliente para gestionar prompts',
      'prompts.type': 'Tipo',
      'prompts.platform': 'Plataforma',
      'prompts.length': 'Longitud',
      'prompts.active': 'Activo',
      'prompts.actions': 'Acciones',

      // Rules Tab
      'rules.title': 'Reglas del Cliente',
      'rules.warning': 'Avanzado: Los cambios aquí afectan el comportamiento central del sistema.',
      'rules.validateJson': 'Validar JSON',
      'rules.saveRules': 'Guardar Reglas',
      'rules.selectClient': 'Selecciona un cliente para gestionar reglas',
      'rules.aiSettings': 'Configuración de IA',
      'rules.model': 'Modelo',
      'rules.temperature': 'Temperatura',
      'rules.maxTokens': 'Máx Tokens',
      'rules.limits': 'Límites',
      'rules.maxTasksPerRun': 'Máx Tareas Por Ejecución',
      'rules.taskDedupe': 'Dedupe de Tarea (seg)',
      'rules.followupCooldown': 'Cooldown de Followup (seg)',
      'rules.rawJsonEditor': 'Editor JSON Directo',
      'rules.rawJsonWarning': 'Edita con cuidado. JSON inválido será rechazado.',

      // Branding Tab
      'branding.title': 'Configuración de Marca',
      'branding.saveBranding': 'Guardar Marca',
      'branding.selectClient': 'Selecciona un cliente para gestionar marca',
      'branding.logo': 'Logo',
      'branding.uploadLogo': 'Subir Logo',
      'branding.logoHelp': 'PNG, JPG, GIF o WebP. Máx 2MB. Recomendado: 512x512',
      'branding.remove': 'Eliminar',
      'branding.colors': 'Colores',
      'branding.primaryColor': 'Primario:',
      'branding.secondaryColor': 'Secundario:',
      'branding.companyInfo': 'Info de la Empresa',
      'branding.tagline': 'Eslogan',
      'branding.taglinePlaceholder': 'Conecta. Automatiza. Crece.',
      'branding.emailFooter': 'Pie de Email HTML',
      'branding.footerPlaceholder': '<p>Saludos,<br>El Equipo</p>',

      // Hashtags Tab
      'hashtags.title': 'Paquetes de Hashtags',
      'hashtags.addPack': 'Agregar Paquete',
      'hashtags.selectClient': 'Selecciona un cliente para gestionar hashtags',
      'hashtags.pack': 'Paquete',
      'hashtags.category': 'Categoría',
      'hashtags.platform': 'Plataforma',
      'hashtags.count': 'Hashtags',
      'hashtags.active': 'Activo',
      'hashtags.actions': 'Acciones',

      // System Tab
      'system.title': 'Configuración del Sistema',
      'system.warning': 'Los cambios afectan a TODOS los clientes',
      'system.addConfig': 'Agregar Config',
      'system.refresh': 'Actualizar',
      'system.platformLimits': 'Límites de Plataforma',
      'system.platform': 'Plataforma:',
      'system.maxCaptionLength': 'Máx Longitud de Caption',
      'system.maxHashtags': 'Máx Hashtags',
      'system.maxCarouselSlides': 'Máx Slides Carrusel',
      'system.optimalHashtags': 'Cant. Óptima de Hashtags',
      'system.savePlatformConfig': 'Guardar Config de Plataforma',

      // Audit Log Tab
      'audit.title': 'Log de Auditoría',
      'audit.subtitle': 'Rastrea todas las acciones de admin y cambios de configuración',
      'audit.refresh': 'Actualizar',
      'audit.filterClient': 'Cliente',
      'audit.filterClientAll': 'Todos los Clientes',
      'audit.filterAction': 'Tipo de Acción',
      'audit.filterActionAll': 'Todas las Acciones',
      'audit.filterCreate': 'Crear',
      'audit.filterUpdate': 'Actualizar',
      'audit.filterDelete': 'Eliminar',
      'audit.filterEntity': 'Tipo de Entidad',
      'audit.filterEntityAll': 'Todas las Entidades',
      'audit.filterDate': 'Rango de Fechas',
      'audit.last7days': 'Últimos 7 días',
      'audit.last30days': 'Últimos 30 días',
      'audit.last90days': 'Últimos 90 días',
      'audit.allTime': 'Todo el tiempo',
      'audit.timestamp': 'Fecha/Hora',
      'audit.actor': 'Actor',
      'audit.action': 'Acción',
      'audit.entity': 'Entidad',
      'audit.client': 'Cliente',
      'audit.details': 'Detalles',
      'audit.showing': 'Mostrando',
      'audit.of': 'de',
      'audit.entries': 'entradas',
      'audit.previous': 'Anterior',
      'audit.next': 'Siguiente',

      // Common
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.edit': 'Editar',
      'common.delete': 'Eliminar',
      'common.actions': 'Acciones',
      'common.yes': 'Sí',
      'common.no': 'No',
      'common.active': 'Activo',
      'common.inactive': 'Inactivo',

      // Language selector
      'lang.english': 'English',
      'lang.portuguese': 'Português (BR)',
      'lang.spanish': 'Español'
    }
  },

  /**
   * Initialize i18n
   */
  init() {
    // Load saved language or detect from browser
    const saved = localStorage.getItem('tb4b_admin_lang');
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    } else {
      this.currentLang = this.detectBrowserLanguage();
    }

    // Apply translations
    this.applyLanguage(this.currentLang);

    // Setup language selector if exists
    this.setupLanguageSelector();

    console.log('✅ Admin i18n initialized:', this.currentLang);
  },

  /**
   * Detect browser language
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';
    return 'en';
  },

  /**
   * Get translation by key
   */
  t(key, fallback = null) {
    const trans = this.translations[this.currentLang];
    if (trans && trans[key]) {
      return trans[key];
    }
    // Fallback to English
    if (this.translations.en[key]) {
      return this.translations.en[key];
    }
    return fallback || key;
  },

  /**
   * Apply language to all data-i18n elements
   */
  applyLanguage(lang) {
    if (!this.translations[lang]) {
      console.warn('Language not supported:', lang);
      return;
    }

    this.currentLang = lang;
    localStorage.setItem('tb4b_admin_lang', lang);

    // Update document lang attribute
    document.documentElement.lang = lang;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder) {
          el.placeholder = translation;
        }
      } else {
        el.textContent = translation;
      }
    });

    // Update elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // Update language selector value
    const selector = document.getElementById('admin-lang-select');
    if (selector) {
      selector.value = lang;
    }
  },

  /**
   * Set language and re-apply
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.applyLanguage(lang);
    }
  },

  /**
   * Setup language selector dropdown
   */
  setupLanguageSelector() {
    const selector = document.getElementById('admin-lang-select');
    if (selector) {
      selector.value = this.currentLang;
      selector.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AdminI18n.init());
} else {
  AdminI18n.init();
}
