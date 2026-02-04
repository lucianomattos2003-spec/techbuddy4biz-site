/**
 * Internationalization (i18n) for Client Portal
 * Supports: English, Portuguese, Spanish
 */

window.PortalI18n = {
  currentLang: 'en',

  translations: {
    en: {
      // Auth Screen
      'auth.title': 'Client Portal',
      'auth.subtitle': 'Sign in to manage your social content',
      'auth.emailLabel': 'Email address',
      'auth.emailPlaceholder': 'you@example.com',
      'auth.passwordLabel': 'Password',
      'auth.passwordPlaceholder': '••••••••',
      'auth.signIn': 'Sign In',
      'auth.createAccount': 'Create account',
      'auth.forgotPassword': 'Forgot password?',
      'auth.confirmPasswordLabel': 'Confirm Password',
      'auth.minPassword': 'Min 6 characters',
      'auth.signUp': 'Create Account',
      'auth.haveAccount': 'Already have an account? Sign in',
      'auth.resetInstructions': 'Enter your email and we\'ll send you a 6-digit code to reset your password.',
      'auth.sendCode': 'Send Reset Code',
      'auth.backToSignIn': 'Back to sign in',
      'auth.enterCode': 'Enter the 6-digit code sent to',
      'auth.verificationCode': 'Verification Code',
      'auth.verifyCode': 'Verify Code',
      'auth.didntReceive': 'Didn\'t receive code?',
      'auth.resend': 'Resend',
      'auth.codeVerified': 'Code verified! Set your new password.',
      'auth.newPassword': 'New Password',
      'auth.confirmNewPassword': 'Confirm New Password',
      'auth.updatePassword': 'Update Password',
      'auth.backToWebsite': '← Back to website',
      'auth.setPasswordTitle': 'Set Your Password',
      'auth.setPasswordDesc': 'Enter the code from your welcome email and choose a password.',
      'auth.setPassword': 'Set Password & Sign In',

      // Loading
      'loading.text': 'Loading...',
      'loading.pleaseWait': 'Please wait...',
      'loading.mayTakeMoment': 'This may take a moment',
      'loading.settings': 'Loading settings...',

      // Navigation / Sidebar
      'nav.portal': 'Portal',
      'nav.dashboard': 'Dashboard',
      'nav.approvals': 'Approvals',
      'nav.posts': 'Posts',
      'nav.calendar': 'Calendar',
      'nav.analytics': 'Analytics',
      'nav.createPost': 'Create Post',
      'nav.createBatch': 'Create Batch',
      'nav.mediaLibrary': 'Media Library',
      'nav.settings': 'Settings',
      'nav.adminConfig': 'Admin Config',
      'nav.signOut': 'Sign out',

      // Dashboard
      'dashboard.welcome': 'Welcome back,',
      'dashboard.subtitle': 'Here\'s what\'s happening with your content',
      'dashboard.newPost': 'New Post',
      'dashboard.newBatch': 'New Batch',
      'dashboard.scheduled': 'Scheduled',
      'dashboard.posted': 'Posted',
      'dashboard.pending': 'Pending',
      'dashboard.failed': 'Failed',
      'dashboard.upcomingPosts': 'Upcoming Posts',
      'dashboard.viewAll': 'View all',
      'dashboard.noScheduled': 'No scheduled posts',
      'dashboard.createFirst': 'Create your first post',
      'dashboard.recentActivity': 'Recent Activity',
      'dashboard.noActivity': 'No recent activity',
      'dashboard.was': 'was',
      'dashboard.mediaLibrary': 'Media Library',
      'dashboard.uploadManage': 'Upload and manage your images',
      'dashboard.scheduleSettings': 'Schedule Settings',
      'dashboard.configureTimes': 'Configure posting times',
      'dashboard.bulkUpload': 'Bulk Upload',
      'dashboard.scheduleMultiple': 'Schedule multiple posts at once',
      'dashboard.untitled': 'Untitled',

      // Settings
      'settings.title': 'Settings',
      'settings.subtitle': 'Configure your account preferences',
      'settings.branding': 'Branding',
      'settings.schedule': 'Schedule',
      'settings.approval': 'Approval',
      'settings.hashtags': 'Hashtags',
      'settings.themes': 'Themes',

      // Settings - Branding
      'settings.logo': 'Logo',
      'settings.uploadLogo': 'Upload Logo',
      'settings.logoHelp': 'PNG, JPG, or SVG. Max 500KB. Will be stored as base64.',
      'settings.removeLogo': 'Remove logo',
      'settings.brandColors': 'Brand Colors',
      'settings.primaryColor': 'Primary Color',
      'settings.secondaryColor': 'Secondary Color',
      'settings.companyTagline': 'Company Tagline',
      'settings.taglinePlaceholder': 'Your company tagline or slogan',
      'settings.saveBranding': 'Save Branding',
      'settings.brandingSaved': 'Branding saved successfully!',
      'settings.logoTooLarge': 'Logo must be less than 500KB',
      'settings.logoInvalidType': 'Logo must be PNG, JPG, or SVG',

      // Settings - Schedule
      'settings.postingStatus': 'Posting Status',
      'settings.postingActive': 'Posting is ACTIVE',
      'settings.postingPaused': 'Posting is PAUSED',
      'settings.postingActiveDesc': 'Posts will be published according to your schedule',
      'settings.postingPausedDesc': 'Scheduled posts will not be published until you resume',
      'settings.pausePosting': 'Pause Posting',
      'settings.resumePosting': 'Resume Posting',
      'settings.timezone': 'Timezone',
      'settings.platformSchedules': 'Platform Schedules',
      'settings.noSchedules': 'No schedules configured. Contact admin to set up schedules.',
      'settings.saveSchedule': 'Save Schedule Settings',
      'settings.scheduleSaved': 'Schedule settings saved!',
      'settings.scheduleActivated': 'Schedule activated',
      'settings.scheduleDeactivated': 'Schedule deactivated',
      'settings.active': 'Active',
      'settings.inactive': 'Inactive',
      'settings.postingFrequency': 'Posting Frequency',
      'settings.maxPerDay': 'Max per day:',
      'settings.maxPerWeek': 'Max per week:',
      'settings.postingDays': 'Posting Days',
      'settings.postingTimeSlots': 'Posting Time Slots',
      'settings.slotsOf': 'of',
      'settings.slots': 'slots',
      'settings.add': 'Add',
      'settings.maxSlotsReached': 'Max slots reached',
      'settings.atLeastOneSlot': 'At least one time slot is required',

      // Settings - Approval
      'settings.approvalMode': 'Approval Mode',
      'settings.autoApprove': 'Auto-Approve',
      'settings.autoApproveDesc': 'Posts are automatically approved and scheduled for publishing. No manual review required.',
      'settings.emailApproval': 'Email Approval (All Posts)',
      'settings.emailApprovalDesc': 'Receive an email with approve/reject links for each post. Approve directly from your inbox.',
      'settings.emailAiOnly': 'Email Approval (AI-Generated Only)',
      'settings.emailAiOnlyDesc': 'Only AI-generated posts require email approval. Manually created posts are auto-approved.',
      'settings.saveApproval': 'Save Approval Settings',
      'settings.approvalSaved': 'Approval settings saved!',
      'settings.selectMode': 'Please select an approval mode',

      // Settings - Approval sections
      'settings.socialPostsApproval': 'Social Posts',
      'settings.socialPostsApprovalDesc': 'Choose how social media posts are approved before publishing.',
      'settings.messagesApproval': 'Messages & Replies',
      'settings.messagesApprovalDesc': 'Choose how AI-drafted messages and replies are handled before sending.',
      'settings.msgManual': 'Manual Review',
      'settings.msgManualDesc': 'All messages require your approval before being sent. Review each response in the Approval Center.',
      'settings.msgAiOnly': 'Review AI-Generated Only',
      'settings.msgAiOnlyDesc': 'Only AI-generated responses need approval. Template-based replies are sent automatically.',
      'settings.msgAuto': 'Auto-Send',
      'settings.msgAutoDesc': 'All messages are sent automatically without manual review. Use with caution.',
      // Email field
      'settings.sendApprovalTo': 'Send approval requests to',
      'settings.emailRequired': 'Email is required when using email approval',
      'settings.emailInvalid': 'Please enter a valid email address',
      'settings.emailHint': 'Must be a valid email you check regularly',
      // Timeout section
      'settings.timeoutSettings': 'Timeout Settings',
      'settings.ifNotApprovedWithin': 'If not approved within',
      'settings.then': 'Then',
      'settings.hours': 'hours',
      'settings.sendAnyway': 'Send anyway',
      'settings.sendAnywayDesc': 'recommended for timely responses',
      'settings.discard': 'Discard',
      'settings.discardDesc': 'safer but may miss opportunities',
      'settings.notifyMe': 'Notify me to handle manually',
      'settings.timeoutTip': 'For messages, fast response times build trust with leads. We recommend "Send anyway" to avoid missed opportunities.',
      // Advanced per-channel
      'settings.advancedPerChannel': 'Advanced: Per-Channel Settings',
      'settings.useDefault': 'Use Default',
      'settings.fasterForPublic': 'Faster for public comments',
      'settings.privateReviewRecommended': 'Private conversations - review recommended',
      'settings.instantRepliesExpected': 'Users expect instant replies',
      // Pending indicator
      'settings.pendingItems': 'You have {count} items waiting for approval',
      'settings.goToApprovalCenter': 'Go to Approval Center',
      // Save
      'settings.saveChanges': 'Save Changes',

      // Settings - Hashtags
      'settings.addHashtagPack': 'Add Hashtag Pack',
      'settings.editHashtagPack': 'Edit Hashtag Pack',
      'settings.noHashtags': 'No hashtag packs yet',
      'settings.hashtagsHelp': 'Create a hashtag pack to organize hashtags for your posts',
      'settings.packLabel': 'Pack Label',
      'settings.packLabelPlaceholder': 'e.g., Brand Awareness',
      'settings.hashtagsList': 'Hashtags (one per line, include #)',
      'settings.hashtagActive': 'Active (include in post generation)',
      'settings.cancel': 'Cancel',
      'settings.save': 'Save',
      'settings.deleteHashtag': 'Delete this hashtag pack?',
      'settings.hashtagDeleted': 'Hashtag pack deleted',
      'settings.hashtagUpdated': 'Hashtag pack updated',
      'settings.hashtagCreated': 'Hashtag pack created',
      'settings.addHashtagError': 'Please add at least one hashtag starting with #',

      // Settings - Themes
      'settings.contentThemes': 'Content Themes',
      'settings.themesHelp': 'Enable or disable themes for your content generation. Active themes will be used when creating posts.',
      'settings.noThemes': 'No themes configured',
      'settings.themesContactAdmin': 'Contact your admin to set up content themes',
      'settings.enableAll': 'Enable All',
      'settings.disableAll': 'Disable All',
      'settings.themeEnabled': 'Theme enabled',
      'settings.themeDisabled': 'Theme disabled',
      'settings.allThemesEnabled': 'All themes enabled',
      'settings.allThemesDisabled': 'All themes disabled',

      // Common Actions
      'common.confirm': 'Confirm',
      'common.cancel': 'Cancel',
      'common.ok': 'OK',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.close': 'Close',
      'common.tryAgain': 'Try Again',
      'common.more': 'more',

      // Dialogs
      'dialog.confirm': 'Confirm',
      'dialog.notice': 'Notice',
      'dialog.input': 'Input',

      // Errors
      'error.failed': 'Failed',
      'error.loadSettings': 'Failed to load settings:',
      'error.saveFailed': 'Failed to save:',

      // Toasts / Notifications
      'toast.sessionExpiring': 'Session expiring soon',
      'toast.sessionExpireMessage': 'Your session will expire in a few minutes. Save your work.',
      'toast.extendSession': 'Extend Session',
      'toast.sessionExtended': 'Session extended',
      'toast.sessionExtendFailed': 'Could not extend session',
      'toast.offline': 'You\'re offline.',
      'toast.offlineCheck': 'Please check your internet connection.',
      'toast.backOnline': 'You\'re back online!',
      'toast.unsavedChanges': 'You have unsaved changes. Are you sure you want to leave?',

      // Days of week
      'day.mon': 'Mon',
      'day.tue': 'Tue',
      'day.wed': 'Wed',
      'day.thu': 'Thu',
      'day.fri': 'Fri',
      'day.sat': 'Sat',
      'day.sun': 'Sun',

      // Timezones
      'tz.eastern': 'Eastern Time (ET)',
      'tz.central': 'Central Time (CT)',
      'tz.mountain': 'Mountain Time (MT)',
      'tz.pacific': 'Pacific Time (PT)',
      'tz.brazil': 'Brazil (BRT)',
      'tz.london': 'London (GMT/BST)',
      'tz.paris': 'Paris (CET)',
      'tz.tokyo': 'Tokyo (JST)',
      'tz.utc': 'UTC',

      // Language selector
      'lang.english': 'English',
      'lang.portuguese': 'Portuguese (BR)',
      'lang.spanish': 'Spanish',

      // Posts Page
      'posts.title': 'Posts',
      'posts.subtitle': 'Manage your scheduled and published content',
      'posts.newPost': 'New Post',
      'posts.allStatuses': 'All Statuses',
      'posts.allPlatforms': 'All Platforms',
      'posts.refresh': 'Refresh',
      'posts.selected': 'selected',
      'posts.clear': 'Clear',
      'posts.approve': 'Approve',
      'posts.skip': 'Skip',
      'posts.delete': 'Delete',
      'posts.noPostsFound': 'No posts found',
      'posts.adjustFilters': 'Try adjusting your filters or create a new post',
      'posts.createPost': 'Create Post',
      'posts.selectAll': 'Select all',
      'posts.selectable': 'selectable',
      'posts.untitled': 'Untitled Post',
      'posts.notScheduled': 'Not scheduled',
      'posts.failedLoad': 'Failed to load posts',
      'posts.tryAgain': 'Try again',
      'posts.deleteConfirm': 'Are you sure you want to delete this post? This action cannot be undone.',
      'posts.deleteTitle': 'Delete Post',
      'posts.deleted': 'Post deleted',
      'posts.bulkConfirm': 'Are you sure you want to',
      'posts.post': 'post',
      'posts.posts': 'posts',

      // Approvals Page - Unified Approval Center
      'approvals.title': 'Approval Center',
      'approvals.subtitle': 'Review and approve posts and messages',
      'approvals.refresh': 'Refresh',

      // Tabs
      'approvals.tabAll': 'All',
      'approvals.tabPosts': 'Posts',
      'approvals.tabMessages': 'Messages',

      // Stats
      'approvals.pendingPosts': 'posts pending',
      'approvals.pendingMessages': 'messages pending',
      'approvals.approvedToday': 'approved today',

      // Type labels
      'approvals.typePost': 'POST',
      'approvals.typeMessage': 'MESSAGE',

      // Channels
      'approvals.channelInstagram': 'Instagram',
      'approvals.channelFacebook': 'Facebook',
      'approvals.channelLinkedin': 'LinkedIn',
      'approvals.channelInstagramDm': 'Instagram DM',
      'approvals.channelFacebookDm': 'Facebook DM',
      'approvals.channelInstagramComment': 'Instagram Comment',
      'approvals.channelFacebookComment': 'Facebook Comment',
      'approvals.channelEmail': 'Email',
      'approvals.channelWhatsapp': 'WhatsApp',
      'approvals.channelSms': 'SMS',

      // Time
      'approvals.expiresIn': 'Expires in',
      'approvals.expired': 'Expired',

      // Actions
      'approvals.approveAndSchedule': 'Approve & Schedule',
      'approvals.approveAndSend': 'Approve & Send',
      'approvals.edit': 'Edit',
      'approvals.reject': 'Reject',
      'approvals.preview': 'Preview',

      // Labels
      'approvals.to': 'To',
      'approvals.subject': 'Subject',
      'approvals.theirMessage': 'Their message',
      'approvals.aiResponse': 'AI response',

      // Filters
      'approvals.allChannels': 'All Channels',
      'approvals.allPlatforms': 'All Platforms',
      'approvals.sortUrgent': 'Most Urgent',
      'approvals.sortNewest': 'Newest First',
      'approvals.search': 'Search...',

      // Empty states
      'approvals.noItems': 'No pending approvals',
      'approvals.noItemsDesc': 'All caught up! New items will appear here when they need your review.',
      'approvals.noPostsDesc': 'No posts waiting for approval.',
      'approvals.noMessagesDesc': 'No messages waiting for approval.',

      // Bulk actions
      'approvals.selectAll': 'Select All',
      'approvals.approveSelected': 'Approve',
      'approvals.rejectSelected': 'Reject',
      'approvals.selected': 'selected',
      'approvals.clearSelection': 'Clear',

      // Confirmations
      'approvals.confirmApprovePost': 'Approve and schedule this post?',
      'approvals.confirmApproveMessage': 'Approve and send this message?',
      'approvals.confirmReject': 'Reject this item?',
      'approvals.confirmRejectDesc': 'This action cannot be undone.',
      'approvals.confirmBulkApprove': 'Approve selected items?',
      'approvals.confirmBulkReject': 'Reject selected items?',

      // Success messages
      'approvals.postApproved': 'Post approved and scheduled!',
      'approvals.messageApproved': 'Message approved and sent!',
      'approvals.itemRejected': 'Item rejected',
      'approvals.bulkApproved': 'items approved!',
      'approvals.bulkRejected': 'items rejected',

      // Edit modal
      'approvals.editPost': 'Edit Post',
      'approvals.editMessage': 'Edit Message',
      'approvals.originalContent': 'Original AI Content',
      'approvals.yourVersion': 'Your Edited Version',
      'approvals.resetToOriginal': 'Reset to Original',
      'approvals.saveAndApprove': 'Save & Approve',
      'approvals.cancel': 'Cancel',

      // Legacy
      'approvals.failedLoad': 'Failed to load approvals',
      'approvals.tryAgain': 'Try again',
      'approvals.failedApprove': 'Failed to approve',
      'approvals.failedReject': 'Failed to reject',

      // Media Page
      'media.title': 'Media Library',
      'media.subtitle': 'Upload and manage your images and videos',
      'media.uploadImages': 'Upload Images',
      'media.dropFiles': 'Drop files here to upload',
      'media.orBrowse': 'or',
      'media.browse': 'browse',
      'media.fromComputer': 'from your computer',
      'media.supportedFormats': 'Supports: JPG, PNG, GIF, WebP, MP4 (max 10MB)',
      'media.uploading': 'Uploading...',
      'media.allTypes': 'All Types',
      'media.images': 'Images',
      'media.videos': 'Videos',
      'media.allPlatforms': 'All Platforms',
      'media.searchPlaceholder': 'Search by filename...',
      'media.refresh': 'Refresh',
      'media.showing': 'Showing',
      'media.of': 'of',
      'media.items': 'items',
      'media.loadMore': 'Load More',
      'media.noMedia': 'No media files',
      'media.uploadFirst': 'Upload your first image or video to get started',
      'media.failedLoad': 'Failed to load media',
      'media.details': 'Media Details',
      'media.filename': 'Filename',
      'media.type': 'Type',
      'media.size': 'Size',
      'media.dimensions': 'Dimensions',
      'media.aspectRatio': 'Aspect Ratio',
      'media.usedInPosts': 'Used in Posts',
      'media.times': 'times',
      'media.uploaded': 'Uploaded',
      'media.suitablePlatforms': 'Suitable Platforms',
      'media.tags': 'Tags',
      'media.editTags': 'Edit Tags',
      'media.noTags': 'No tags',
      'media.notes': 'Notes',
      'media.url': 'URL',
      'media.openFull': 'Open Full',
      'media.useInPost': 'Use in Post',
      'media.deleteMedia': 'Delete Media?',
      'media.deleteWarning': 'This action cannot be undone. The image will be permanently deleted.',
      'media.cancel': 'Cancel',
      'media.currentTags': 'Current Tags',
      'media.addTag': 'Add Tag',
      'media.enterTag': 'Enter tag...',
      'media.add': 'Add',
      'media.maxTags': 'Max 10 tags, each up to 50 characters',
      'media.optionalNotes': 'Optional notes about this image...',
      'media.saveChanges': 'Save Changes',
      'media.tagsUpdated': 'Tags updated',
      'media.mediaDeleted': 'Media deleted',
      'media.urlCopied': 'URL copied!',
      'media.filesUploaded': 'file(s) uploaded',
      'media.invalidType': 'Invalid file type',
      'media.tooLarge': 'is too large (max 10MB)',
      'media.failedUpload': 'Failed to upload',

      // Calendar Page
      'calendar.title': 'Content Calendar',
      'calendar.subtitle': 'View and manage your posting schedule',
      'calendar.month': 'Month',
      'calendar.week': 'Week',
      'calendar.newPost': 'New Post',
      'calendar.today': 'Today',
      'calendar.posted': 'Posted',
      'calendar.scheduled': 'Scheduled',
      'calendar.pending': 'Pending',
      'calendar.failed': 'Failed',
      'calendar.addPost': 'Add post',
      'calendar.addMore': 'Add more',
      'calendar.addPostForDay': 'Add Post for This Day',
      'calendar.noPostsDay': 'No posts scheduled for this day',
      'calendar.failedLoad': 'Failed to load calendar',
      'calendar.tryAgain': 'Try again',
      'calendar.post': 'Post',
      'calendar.untitled': 'Untitled',
      'calendar.noCaption': 'No caption',
      'calendar.more': 'more',
      // Month names
      'calendar.january': 'January',
      'calendar.february': 'February',
      'calendar.march': 'March',
      'calendar.april': 'April',
      'calendar.may': 'May',
      'calendar.june': 'June',
      'calendar.july': 'July',
      'calendar.august': 'August',
      'calendar.september': 'September',
      'calendar.october': 'October',
      'calendar.november': 'November',
      'calendar.december': 'December',
      // Day names (short)
      'calendar.sun': 'Sun',
      'calendar.mon': 'Mon',
      'calendar.tue': 'Tue',
      'calendar.wed': 'Wed',
      'calendar.thu': 'Thu',
      'calendar.fri': 'Fri',
      'calendar.sat': 'Sat',
      // Day names (full)
      'calendar.sunday': 'Sunday',
      'calendar.monday': 'Monday',
      'calendar.tuesday': 'Tuesday',
      'calendar.wednesday': 'Wednesday',
      'calendar.thursday': 'Thursday',
      'calendar.friday': 'Friday',
      'calendar.saturday': 'Saturday',

      // Analytics Page
      'analytics.title': 'Analytics',
      'analytics.subtitle': 'Track your social media posting performance',
      'analytics.thisWeek': 'This Week',
      'analytics.thisMonth': 'This Month',
      'analytics.last3Months': 'Last 3 Months',
      'analytics.thisYear': 'This Year',
      'analytics.refresh': 'Refresh',
      'analytics.loading': 'Loading analytics...',
      'analytics.totalPosts': 'Total Posts',
      'analytics.posted': 'Posted',
      'analytics.scheduled': 'Scheduled',
      'analytics.approvalRate': 'Approval Rate',
      'analytics.postsByPlatform': 'Posts by Platform',
      'analytics.postsByStatus': 'Posts by Status',
      'analytics.postingActivity': 'Posting Activity',
      'analytics.recentPosts': 'Recent Posts',
      'analytics.failedLoad': 'Failed to load analytics',
      'analytics.tryAgain': 'Try again',
      'analytics.noData': 'No data',
      'analytics.noPostsFound': 'No posts found',
      'analytics.pending': 'Pending',
      'analytics.failed': 'Failed',
      'analytics.cancelled': 'Cancelled'
    },

    'pt-BR': {
      // Auth Screen
      'auth.title': 'Portal do Cliente',
      'auth.subtitle': 'Entre para gerenciar seu conteúdo social',
      'auth.emailLabel': 'Endereço de e-mail',
      'auth.emailPlaceholder': 'voce@exemplo.com',
      'auth.passwordLabel': 'Senha',
      'auth.passwordPlaceholder': '••••••••',
      'auth.signIn': 'Entrar',
      'auth.createAccount': 'Criar conta',
      'auth.forgotPassword': 'Esqueceu a senha?',
      'auth.confirmPasswordLabel': 'Confirmar Senha',
      'auth.minPassword': 'Mínimo 6 caracteres',
      'auth.signUp': 'Criar Conta',
      'auth.haveAccount': 'Já tem uma conta? Entre',
      'auth.resetInstructions': 'Digite seu e-mail e enviaremos um código de 6 dígitos para redefinir sua senha.',
      'auth.sendCode': 'Enviar Código',
      'auth.backToSignIn': 'Voltar ao login',
      'auth.enterCode': 'Digite o código de 6 dígitos enviado para',
      'auth.verificationCode': 'Código de Verificação',
      'auth.verifyCode': 'Verificar Código',
      'auth.didntReceive': 'Não recebeu o código?',
      'auth.resend': 'Reenviar',
      'auth.codeVerified': 'Código verificado! Defina sua nova senha.',
      'auth.newPassword': 'Nova Senha',
      'auth.confirmNewPassword': 'Confirmar Nova Senha',
      'auth.updatePassword': 'Atualizar Senha',
      'auth.backToWebsite': '← Voltar ao site',
      'auth.setPasswordTitle': 'Defina Sua Senha',
      'auth.setPasswordDesc': 'Digite o código do seu e-mail de boas-vindas e escolha uma senha.',
      'auth.setPassword': 'Definir Senha e Entrar',

      // Loading
      'loading.text': 'Carregando...',
      'loading.pleaseWait': 'Por favor, aguarde...',
      'loading.mayTakeMoment': 'Isso pode levar um momento',
      'loading.settings': 'Carregando configurações...',

      // Navigation / Sidebar
      'nav.portal': 'Portal',
      'nav.dashboard': 'Painel',
      'nav.approvals': 'Aprovações',
      'nav.posts': 'Publicações',
      'nav.calendar': 'Calendário',
      'nav.analytics': 'Análises',
      'nav.createPost': 'Criar Publicação',
      'nav.createBatch': 'Criar Lote',
      'nav.mediaLibrary': 'Biblioteca de Mídia',
      'nav.settings': 'Configurações',
      'nav.adminConfig': 'Config Admin',
      'nav.signOut': 'Sair',

      // Dashboard
      'dashboard.welcome': 'Bem-vindo(a) de volta,',
      'dashboard.subtitle': 'Veja o que está acontecendo com seu conteúdo',
      'dashboard.newPost': 'Nova Publicação',
      'dashboard.newBatch': 'Novo Lote',
      'dashboard.scheduled': 'Agendados',
      'dashboard.posted': 'Publicados',
      'dashboard.pending': 'Pendentes',
      'dashboard.failed': 'Falharam',
      'dashboard.upcomingPosts': 'Próximas Publicações',
      'dashboard.viewAll': 'Ver todos',
      'dashboard.noScheduled': 'Nenhuma publicação agendada',
      'dashboard.createFirst': 'Crie sua primeira publicação',
      'dashboard.recentActivity': 'Atividade Recente',
      'dashboard.noActivity': 'Nenhuma atividade recente',
      'dashboard.was': 'foi',
      'dashboard.mediaLibrary': 'Biblioteca de Mídia',
      'dashboard.uploadManage': 'Faça upload e gerencie suas imagens',
      'dashboard.scheduleSettings': 'Configurações de Agenda',
      'dashboard.configureTimes': 'Configure horários de publicação',
      'dashboard.bulkUpload': 'Upload em Lote',
      'dashboard.scheduleMultiple': 'Agende várias publicações de uma vez',
      'dashboard.untitled': 'Sem título',

      // Settings
      'settings.title': 'Configurações',
      'settings.subtitle': 'Configure suas preferências de conta',
      'settings.branding': 'Marca',
      'settings.schedule': 'Agenda',
      'settings.approval': 'Aprovação',
      'settings.hashtags': 'Hashtags',
      'settings.themes': 'Temas',

      // Settings - Branding
      'settings.logo': 'Logo',
      'settings.uploadLogo': 'Enviar Logo',
      'settings.logoHelp': 'PNG, JPG ou SVG. Máx 500KB. Será armazenado como base64.',
      'settings.removeLogo': 'Remover logo',
      'settings.brandColors': 'Cores da Marca',
      'settings.primaryColor': 'Cor Primária',
      'settings.secondaryColor': 'Cor Secundária',
      'settings.companyTagline': 'Slogan da Empresa',
      'settings.taglinePlaceholder': 'Seu slogan ou frase de efeito',
      'settings.saveBranding': 'Salvar Marca',
      'settings.brandingSaved': 'Marca salva com sucesso!',
      'settings.logoTooLarge': 'Logo deve ter menos de 500KB',
      'settings.logoInvalidType': 'Logo deve ser PNG, JPG ou SVG',

      // Settings - Schedule
      'settings.postingStatus': 'Status de Publicação',
      'settings.postingActive': 'Publicação ATIVA',
      'settings.postingPaused': 'Publicação PAUSADA',
      'settings.postingActiveDesc': 'As publicações serão feitas conforme sua agenda',
      'settings.postingPausedDesc': 'Publicações agendadas não serão feitas até você retomar',
      'settings.pausePosting': 'Pausar Publicação',
      'settings.resumePosting': 'Retomar Publicação',
      'settings.timezone': 'Fuso Horário',
      'settings.platformSchedules': 'Agendas por Plataforma',
      'settings.noSchedules': 'Nenhuma agenda configurada. Contate o admin para configurar.',
      'settings.saveSchedule': 'Salvar Configurações de Agenda',
      'settings.scheduleSaved': 'Configurações de agenda salvas!',
      'settings.scheduleActivated': 'Agenda ativada',
      'settings.scheduleDeactivated': 'Agenda desativada',
      'settings.active': 'Ativo',
      'settings.inactive': 'Inativo',
      'settings.postingFrequency': 'Frequência de Publicação',
      'settings.maxPerDay': 'Máx por dia:',
      'settings.maxPerWeek': 'Máx por semana:',
      'settings.postingDays': 'Dias de Publicação',
      'settings.postingTimeSlots': 'Horários de Publicação',
      'settings.slotsOf': 'de',
      'settings.slots': 'horários',
      'settings.add': 'Adicionar',
      'settings.maxSlotsReached': 'Máximo de horários atingido',
      'settings.atLeastOneSlot': 'Pelo menos um horário é necessário',

      // Settings - Approval
      'settings.approvalMode': 'Modo de Aprovação',
      'settings.autoApprove': 'Aprovação Automática',
      'settings.autoApproveDesc': 'Publicações são aprovadas e agendadas automaticamente. Nenhuma revisão manual necessária.',
      'settings.emailApproval': 'Aprovação por E-mail (Todas)',
      'settings.emailApprovalDesc': 'Receba um e-mail com links de aprovar/rejeitar para cada publicação. Aprove direto da sua caixa de entrada.',
      'settings.emailAiOnly': 'Aprovação por E-mail (Apenas IA)',
      'settings.emailAiOnlyDesc': 'Apenas publicações geradas por IA precisam de aprovação por e-mail. Publicações manuais são aprovadas automaticamente.',
      'settings.saveApproval': 'Salvar Config de Aprovação',
      'settings.approvalSaved': 'Configurações de aprovação salvas!',
      'settings.selectMode': 'Por favor selecione um modo de aprovação',

      // Settings - Seções de aprovação
      'settings.socialPostsApproval': 'Publicações Sociais',
      'settings.socialPostsApprovalDesc': 'Escolha como as publicações são aprovadas antes de serem publicadas.',
      'settings.messagesApproval': 'Mensagens e Respostas',
      'settings.messagesApprovalDesc': 'Escolha como mensagens e respostas geradas por IA são tratadas antes do envio.',
      'settings.msgManual': 'Revisão Manual',
      'settings.msgManualDesc': 'Todas as mensagens precisam da sua aprovação antes de serem enviadas. Revise cada resposta na Central de Aprovações.',
      'settings.msgAiOnly': 'Revisar Apenas Geradas por IA',
      'settings.msgAiOnlyDesc': 'Apenas respostas geradas por IA precisam de aprovação. Respostas baseadas em modelo são enviadas automaticamente.',
      'settings.msgAuto': 'Envio Automático',
      'settings.msgAutoDesc': 'Todas as mensagens são enviadas automaticamente sem revisão manual. Use com cautela.',
      'settings.sendApprovalTo': 'Enviar solicitações de aprovação para',
      'settings.emailRequired': 'E-mail é obrigatório para aprovação por e-mail',
      'settings.emailInvalid': 'Por favor insira um e-mail válido',
      'settings.emailHint': 'Deve ser um e-mail válido que você verifica regularmente',
      'settings.timeoutSettings': 'Configurações de Tempo Limite',
      'settings.ifNotApprovedWithin': 'Se não aprovado em',
      'settings.then': 'Então',
      'settings.hours': 'horas',
      'settings.sendAnyway': 'Enviar mesmo assim',
      'settings.sendAnywayDesc': 'recomendado para respostas rápidas',
      'settings.discard': 'Descartar',
      'settings.discardDesc': 'mais seguro mas pode perder oportunidades',
      'settings.notifyMe': 'Me notificar para tratar manualmente',
      'settings.timeoutTip': 'Tempos de resposta rápidos geram confiança com leads. Recomendamos "Enviar mesmo assim" para não perder oportunidades.',
      'settings.advancedPerChannel': 'Avançado: Configurações por Canal',
      'settings.useDefault': 'Usar Padrão',
      'settings.fasterForPublic': 'Mais rápido para comentários públicos',
      'settings.privateReviewRecommended': 'Conversas privadas - revisão recomendada',
      'settings.instantRepliesExpected': 'Usuários esperam respostas instantâneas',
      'settings.pendingItems': 'Você tem {count} itens aguardando aprovação',
      'settings.goToApprovalCenter': 'Ir para Central de Aprovações',
      'settings.saveChanges': 'Salvar Alterações',

      // Settings - Hashtags
      'settings.addHashtagPack': 'Adicionar Pacote de Hashtags',
      'settings.editHashtagPack': 'Editar Pacote de Hashtags',
      'settings.noHashtags': 'Nenhum pacote de hashtags ainda',
      'settings.hashtagsHelp': 'Crie um pacote de hashtags para organizar hashtags para suas publicações',
      'settings.packLabel': 'Nome do Pacote',
      'settings.packLabelPlaceholder': 'ex., Reconhecimento de Marca',
      'settings.hashtagsList': 'Hashtags (uma por linha, inclua #)',
      'settings.hashtagActive': 'Ativo (incluir na geração de posts)',
      'settings.cancel': 'Cancelar',
      'settings.save': 'Salvar',
      'settings.deleteHashtag': 'Excluir este pacote de hashtags?',
      'settings.hashtagDeleted': 'Pacote de hashtags excluído',
      'settings.hashtagUpdated': 'Pacote de hashtags atualizado',
      'settings.hashtagCreated': 'Pacote de hashtags criado',
      'settings.addHashtagError': 'Por favor adicione pelo menos uma hashtag começando com #',

      // Settings - Themes
      'settings.contentThemes': 'Temas de Conteúdo',
      'settings.themesHelp': 'Ative ou desative temas para geração de conteúdo. Temas ativos serão usados ao criar publicações.',
      'settings.noThemes': 'Nenhum tema configurado',
      'settings.themesContactAdmin': 'Contate seu admin para configurar temas de conteúdo',
      'settings.enableAll': 'Ativar Todos',
      'settings.disableAll': 'Desativar Todos',
      'settings.themeEnabled': 'Tema ativado',
      'settings.themeDisabled': 'Tema desativado',
      'settings.allThemesEnabled': 'Todos os temas ativados',
      'settings.allThemesDisabled': 'Todos os temas desativados',

      // Common Actions
      'common.confirm': 'Confirmar',
      'common.cancel': 'Cancelar',
      'common.ok': 'OK',
      'common.save': 'Salvar',
      'common.delete': 'Excluir',
      'common.edit': 'Editar',
      'common.close': 'Fechar',
      'common.tryAgain': 'Tentar Novamente',
      'common.more': 'mais',

      // Dialogs
      'dialog.confirm': 'Confirmar',
      'dialog.notice': 'Aviso',
      'dialog.input': 'Entrada',

      // Errors
      'error.failed': 'Falhou',
      'error.loadSettings': 'Falha ao carregar configurações:',
      'error.saveFailed': 'Falha ao salvar:',

      // Toasts / Notifications
      'toast.sessionExpiring': 'Sessão expirando em breve',
      'toast.sessionExpireMessage': 'Sua sessão expirará em alguns minutos. Salve seu trabalho.',
      'toast.extendSession': 'Estender Sessão',
      'toast.sessionExtended': 'Sessão estendida',
      'toast.sessionExtendFailed': 'Não foi possível estender a sessão',
      'toast.offline': 'Você está offline.',
      'toast.offlineCheck': 'Por favor, verifique sua conexão com a internet.',
      'toast.backOnline': 'Você está online novamente!',
      'toast.unsavedChanges': 'Você tem alterações não salvas. Tem certeza que deseja sair?',

      // Days of week
      'day.mon': 'Seg',
      'day.tue': 'Ter',
      'day.wed': 'Qua',
      'day.thu': 'Qui',
      'day.fri': 'Sex',
      'day.sat': 'Sáb',
      'day.sun': 'Dom',

      // Timezones
      'tz.eastern': 'Hora do Leste (ET)',
      'tz.central': 'Hora Central (CT)',
      'tz.mountain': 'Hora da Montanha (MT)',
      'tz.pacific': 'Hora do Pacífico (PT)',
      'tz.brazil': 'Brasil (BRT)',
      'tz.london': 'Londres (GMT/BST)',
      'tz.paris': 'Paris (CET)',
      'tz.tokyo': 'Tóquio (JST)',
      'tz.utc': 'UTC',

      // Language selector
      'lang.english': 'English',
      'lang.portuguese': 'Português (BR)',
      'lang.spanish': 'Español',

      // Posts Page
      'posts.title': 'Publicações',
      'posts.subtitle': 'Gerencie seu conteúdo agendado e publicado',
      'posts.newPost': 'Nova Publicação',
      'posts.allStatuses': 'Todos os Status',
      'posts.allPlatforms': 'Todas as Plataformas',
      'posts.refresh': 'Atualizar',
      'posts.selected': 'selecionados',
      'posts.clear': 'Limpar',
      'posts.approve': 'Aprovar',
      'posts.skip': 'Pular',
      'posts.delete': 'Excluir',
      'posts.noPostsFound': 'Nenhuma publicação encontrada',
      'posts.adjustFilters': 'Tente ajustar os filtros ou crie uma nova publicação',
      'posts.createPost': 'Criar Publicação',
      'posts.selectAll': 'Selecionar todos',
      'posts.selectable': 'selecionáveis',
      'posts.untitled': 'Sem título',
      'posts.notScheduled': 'Não agendado',
      'posts.failedLoad': 'Falha ao carregar publicações',
      'posts.tryAgain': 'Tentar novamente',
      'posts.deleteConfirm': 'Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.',
      'posts.deleteTitle': 'Excluir Publicação',
      'posts.deleted': 'Publicação excluída',
      'posts.bulkConfirm': 'Tem certeza que deseja',
      'posts.post': 'publicação',
      'posts.posts': 'publicações',

      // Approvals Page - Central de Aprovações
      'approvals.title': 'Central de Aprovações',
      'approvals.subtitle': 'Revise e aprove publicações e mensagens',
      'approvals.refresh': 'Atualizar',

      // Tabs
      'approvals.tabAll': 'Tudo',
      'approvals.tabPosts': 'Publicações',
      'approvals.tabMessages': 'Mensagens',

      // Stats
      'approvals.pendingPosts': 'publicações pendentes',
      'approvals.pendingMessages': 'mensagens pendentes',
      'approvals.approvedToday': 'aprovados hoje',

      // Type labels
      'approvals.typePost': 'PUBLICAÇÃO',
      'approvals.typeMessage': 'MENSAGEM',

      // Channels
      'approvals.channelInstagram': 'Instagram',
      'approvals.channelFacebook': 'Facebook',
      'approvals.channelLinkedin': 'LinkedIn',
      'approvals.channelInstagramDm': 'DM do Instagram',
      'approvals.channelFacebookDm': 'DM do Facebook',
      'approvals.channelInstagramComment': 'Comentário do Instagram',
      'approvals.channelFacebookComment': 'Comentário do Facebook',
      'approvals.channelEmail': 'E-mail',
      'approvals.channelWhatsapp': 'WhatsApp',
      'approvals.channelSms': 'SMS',

      // Time
      'approvals.expiresIn': 'Expira em',
      'approvals.expired': 'Expirado',

      // Actions
      'approvals.approveAndSchedule': 'Aprovar e Agendar',
      'approvals.approveAndSend': 'Aprovar e Enviar',
      'approvals.edit': 'Editar',
      'approvals.reject': 'Rejeitar',
      'approvals.preview': 'Visualizar',

      // Labels
      'approvals.to': 'Para',
      'approvals.subject': 'Assunto',
      'approvals.theirMessage': 'Mensagem dele(a)',
      'approvals.aiResponse': 'Resposta IA',

      // Filters
      'approvals.allChannels': 'Todos os Canais',
      'approvals.allPlatforms': 'Todas as Plataformas',
      'approvals.sortUrgent': 'Mais Urgentes',
      'approvals.sortNewest': 'Mais Recentes',
      'approvals.search': 'Buscar...',

      // Empty states
      'approvals.noItems': 'Sem aprovações pendentes',
      'approvals.noItemsDesc': 'Tudo em dia! Novos itens aparecerão aqui quando precisarem da sua revisão.',
      'approvals.noPostsDesc': 'Sem publicações aguardando aprovação.',
      'approvals.noMessagesDesc': 'Sem mensagens aguardando aprovação.',

      // Bulk actions
      'approvals.selectAll': 'Selecionar Tudo',
      'approvals.approveSelected': 'Aprovar',
      'approvals.rejectSelected': 'Rejeitar',
      'approvals.selected': 'selecionados',
      'approvals.clearSelection': 'Limpar',

      // Confirmations
      'approvals.confirmApprovePost': 'Aprovar e agendar esta publicação?',
      'approvals.confirmApproveMessage': 'Aprovar e enviar esta mensagem?',
      'approvals.confirmReject': 'Rejeitar este item?',
      'approvals.confirmRejectDesc': 'Esta ação não pode ser desfeita.',
      'approvals.confirmBulkApprove': 'Aprovar itens selecionados?',
      'approvals.confirmBulkReject': 'Rejeitar itens selecionados?',

      // Success messages
      'approvals.postApproved': 'Publicação aprovada e agendada!',
      'approvals.messageApproved': 'Mensagem aprovada e enviada!',
      'approvals.itemRejected': 'Item rejeitado',
      'approvals.bulkApproved': 'itens aprovados!',
      'approvals.bulkRejected': 'itens rejeitados',

      // Edit modal
      'approvals.editPost': 'Editar Publicação',
      'approvals.editMessage': 'Editar Mensagem',
      'approvals.originalContent': 'Conteúdo IA Original',
      'approvals.yourVersion': 'Sua Versão Editada',
      'approvals.resetToOriginal': 'Restaurar Original',
      'approvals.saveAndApprove': 'Salvar e Aprovar',
      'approvals.cancel': 'Cancelar',

      // Legacy
      'approvals.failedLoad': 'Falha ao carregar aprovações',
      'approvals.tryAgain': 'Tentar novamente',
      'approvals.failedApprove': 'Falha ao aprovar',
      'approvals.failedReject': 'Falha ao rejeitar',

      // Media Page
      'media.title': 'Biblioteca de Mídia',
      'media.subtitle': 'Faça upload e gerencie suas imagens e vídeos',
      'media.uploadImages': 'Enviar Imagens',
      'media.dropFiles': 'Solte arquivos aqui para fazer upload',
      'media.orBrowse': 'ou',
      'media.browse': 'navegue',
      'media.fromComputer': 'no seu computador',
      'media.supportedFormats': 'Suporta: JPG, PNG, GIF, WebP, MP4 (máx 10MB)',
      'media.uploading': 'Enviando...',
      'media.allTypes': 'Todos os Tipos',
      'media.images': 'Imagens',
      'media.videos': 'Vídeos',
      'media.allPlatforms': 'Todas as Plataformas',
      'media.searchPlaceholder': 'Buscar por nome do arquivo...',
      'media.refresh': 'Atualizar',
      'media.showing': 'Mostrando',
      'media.of': 'de',
      'media.items': 'itens',
      'media.loadMore': 'Carregar Mais',
      'media.noMedia': 'Nenhum arquivo de mídia',
      'media.uploadFirst': 'Faça upload da sua primeira imagem ou vídeo para começar',
      'media.failedLoad': 'Falha ao carregar mídia',
      'media.details': 'Detalhes da Mídia',
      'media.filename': 'Nome do arquivo',
      'media.type': 'Tipo',
      'media.size': 'Tamanho',
      'media.dimensions': 'Dimensões',
      'media.aspectRatio': 'Proporção',
      'media.usedInPosts': 'Usado em Publicações',
      'media.times': 'vezes',
      'media.uploaded': 'Enviado',
      'media.suitablePlatforms': 'Plataformas Adequadas',
      'media.tags': 'Tags',
      'media.editTags': 'Editar Tags',
      'media.noTags': 'Sem tags',
      'media.notes': 'Notas',
      'media.url': 'URL',
      'media.openFull': 'Abrir Completo',
      'media.useInPost': 'Usar em Publicação',
      'media.deleteMedia': 'Excluir Mídia?',
      'media.deleteWarning': 'Esta ação não pode ser desfeita. A imagem será excluída permanentemente.',
      'media.cancel': 'Cancelar',
      'media.currentTags': 'Tags Atuais',
      'media.addTag': 'Adicionar Tag',
      'media.enterTag': 'Digite a tag...',
      'media.add': 'Adicionar',
      'media.maxTags': 'Máx 10 tags, cada uma com até 50 caracteres',
      'media.optionalNotes': 'Notas opcionais sobre esta imagem...',
      'media.saveChanges': 'Salvar Alterações',
      'media.tagsUpdated': 'Tags atualizadas',
      'media.mediaDeleted': 'Mídia excluída',
      'media.urlCopied': 'URL copiada!',
      'media.filesUploaded': 'arquivo(s) enviado(s)',
      'media.invalidType': 'Tipo de arquivo inválido',
      'media.tooLarge': 'é muito grande (máx 10MB)',
      'media.failedUpload': 'Falha ao enviar',

      // Calendar Page
      'calendar.title': 'Calendário de Conteúdo',
      'calendar.subtitle': 'Visualize e gerencie sua agenda de publicações',
      'calendar.month': 'Mês',
      'calendar.week': 'Semana',
      'calendar.newPost': 'Nova Publicação',
      'calendar.today': 'Hoje',
      'calendar.posted': 'Publicado',
      'calendar.scheduled': 'Agendado',
      'calendar.pending': 'Pendente',
      'calendar.failed': 'Falhou',
      'calendar.addPost': 'Adicionar publicação',
      'calendar.addMore': 'Adicionar mais',
      'calendar.addPostForDay': 'Adicionar Publicação para Este Dia',
      'calendar.noPostsDay': 'Nenhuma publicação agendada para este dia',
      'calendar.failedLoad': 'Falha ao carregar calendário',
      'calendar.tryAgain': 'Tentar novamente',
      'calendar.post': 'Publicação',
      'calendar.untitled': 'Sem título',
      'calendar.noCaption': 'Sem legenda',
      'calendar.more': 'mais',
      // Month names
      'calendar.january': 'Janeiro',
      'calendar.february': 'Fevereiro',
      'calendar.march': 'Março',
      'calendar.april': 'Abril',
      'calendar.may': 'Maio',
      'calendar.june': 'Junho',
      'calendar.july': 'Julho',
      'calendar.august': 'Agosto',
      'calendar.september': 'Setembro',
      'calendar.october': 'Outubro',
      'calendar.november': 'Novembro',
      'calendar.december': 'Dezembro',
      // Day names (short)
      'calendar.sun': 'Dom',
      'calendar.mon': 'Seg',
      'calendar.tue': 'Ter',
      'calendar.wed': 'Qua',
      'calendar.thu': 'Qui',
      'calendar.fri': 'Sex',
      'calendar.sat': 'Sáb',
      // Day names (full)
      'calendar.sunday': 'Domingo',
      'calendar.monday': 'Segunda-feira',
      'calendar.tuesday': 'Terça-feira',
      'calendar.wednesday': 'Quarta-feira',
      'calendar.thursday': 'Quinta-feira',
      'calendar.friday': 'Sexta-feira',
      'calendar.saturday': 'Sábado',

      // Analytics Page
      'analytics.title': 'Análises',
      'analytics.subtitle': 'Acompanhe o desempenho das suas publicações',
      'analytics.thisWeek': 'Esta Semana',
      'analytics.thisMonth': 'Este Mês',
      'analytics.last3Months': 'Últimos 3 Meses',
      'analytics.thisYear': 'Este Ano',
      'analytics.refresh': 'Atualizar',
      'analytics.loading': 'Carregando análises...',
      'analytics.totalPosts': 'Total de Publicações',
      'analytics.posted': 'Publicados',
      'analytics.scheduled': 'Agendados',
      'analytics.approvalRate': 'Taxa de Aprovação',
      'analytics.postsByPlatform': 'Publicações por Plataforma',
      'analytics.postsByStatus': 'Publicações por Status',
      'analytics.postingActivity': 'Atividade de Publicação',
      'analytics.recentPosts': 'Publicações Recentes',
      'analytics.failedLoad': 'Falha ao carregar análises',
      'analytics.tryAgain': 'Tentar novamente',
      'analytics.noData': 'Sem dados',
      'analytics.noPostsFound': 'Nenhuma publicação encontrada',
      'analytics.pending': 'Pendentes',
      'analytics.failed': 'Falharam',
      'analytics.cancelled': 'Cancelados'
    },

    es: {
      // Auth Screen
      'auth.title': 'Portal de Clientes',
      'auth.subtitle': 'Inicia sesión para administrar tu contenido social',
      'auth.emailLabel': 'Correo electrónico',
      'auth.emailPlaceholder': 'tu@ejemplo.com',
      'auth.passwordLabel': 'Contraseña',
      'auth.passwordPlaceholder': '••••••••',
      'auth.signIn': 'Iniciar Sesión',
      'auth.createAccount': 'Crear cuenta',
      'auth.forgotPassword': '¿Olvidaste tu contraseña?',
      'auth.confirmPasswordLabel': 'Confirmar Contraseña',
      'auth.minPassword': 'Mínimo 6 caracteres',
      'auth.signUp': 'Crear Cuenta',
      'auth.haveAccount': '¿Ya tienes una cuenta? Inicia sesión',
      'auth.resetInstructions': 'Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.',
      'auth.sendCode': 'Enviar Código',
      'auth.backToSignIn': 'Volver a iniciar sesión',
      'auth.enterCode': 'Ingresa el código de 6 dígitos enviado a',
      'auth.verificationCode': 'Código de Verificación',
      'auth.verifyCode': 'Verificar Código',
      'auth.didntReceive': '¿No recibiste el código?',
      'auth.resend': 'Reenviar',
      'auth.codeVerified': '¡Código verificado! Establece tu nueva contraseña.',
      'auth.newPassword': 'Nueva Contraseña',
      'auth.confirmNewPassword': 'Confirmar Nueva Contraseña',
      'auth.updatePassword': 'Actualizar Contraseña',
      'auth.backToWebsite': '← Volver al sitio web',
      'auth.setPasswordTitle': 'Establece Tu Contraseña',
      'auth.setPasswordDesc': 'Ingresa el código de tu correo de bienvenida y elige una contraseña.',
      'auth.setPassword': 'Establecer Contraseña e Iniciar Sesión',

      // Loading
      'loading.text': 'Cargando...',
      'loading.pleaseWait': 'Por favor espera...',
      'loading.mayTakeMoment': 'Esto puede tomar un momento',
      'loading.settings': 'Cargando configuración...',

      // Navigation / Sidebar
      'nav.portal': 'Portal',
      'nav.dashboard': 'Panel',
      'nav.approvals': 'Aprobaciones',
      'nav.posts': 'Publicaciones',
      'nav.calendar': 'Calendario',
      'nav.analytics': 'Analíticas',
      'nav.createPost': 'Crear Publicación',
      'nav.createBatch': 'Crear Lote',
      'nav.mediaLibrary': 'Biblioteca de Medios',
      'nav.settings': 'Configuración',
      'nav.adminConfig': 'Config Admin',
      'nav.signOut': 'Cerrar sesión',

      // Dashboard
      'dashboard.welcome': 'Bienvenido(a) de nuevo,',
      'dashboard.subtitle': 'Esto es lo que está pasando con tu contenido',
      'dashboard.newPost': 'Nueva Publicación',
      'dashboard.newBatch': 'Nuevo Lote',
      'dashboard.scheduled': 'Programados',
      'dashboard.posted': 'Publicados',
      'dashboard.pending': 'Pendientes',
      'dashboard.failed': 'Fallidos',
      'dashboard.upcomingPosts': 'Próximas Publicaciones',
      'dashboard.viewAll': 'Ver todos',
      'dashboard.noScheduled': 'No hay publicaciones programadas',
      'dashboard.createFirst': 'Crea tu primera publicación',
      'dashboard.recentActivity': 'Actividad Reciente',
      'dashboard.noActivity': 'Sin actividad reciente',
      'dashboard.was': 'fue',
      'dashboard.mediaLibrary': 'Biblioteca de Medios',
      'dashboard.uploadManage': 'Sube y administra tus imágenes',
      'dashboard.scheduleSettings': 'Configuración de Horarios',
      'dashboard.configureTimes': 'Configura horarios de publicación',
      'dashboard.bulkUpload': 'Carga Masiva',
      'dashboard.scheduleMultiple': 'Programa varias publicaciones a la vez',
      'dashboard.untitled': 'Sin título',

      // Settings
      'settings.title': 'Configuración',
      'settings.subtitle': 'Configura tus preferencias de cuenta',
      'settings.branding': 'Marca',
      'settings.schedule': 'Horarios',
      'settings.approval': 'Aprobación',
      'settings.hashtags': 'Hashtags',
      'settings.themes': 'Temas',

      // Settings - Branding
      'settings.logo': 'Logo',
      'settings.uploadLogo': 'Subir Logo',
      'settings.logoHelp': 'PNG, JPG o SVG. Máx 500KB. Se almacenará como base64.',
      'settings.removeLogo': 'Eliminar logo',
      'settings.brandColors': 'Colores de Marca',
      'settings.primaryColor': 'Color Primario',
      'settings.secondaryColor': 'Color Secundario',
      'settings.companyTagline': 'Eslogan de la Empresa',
      'settings.taglinePlaceholder': 'Tu eslogan o frase de la empresa',
      'settings.saveBranding': 'Guardar Marca',
      'settings.brandingSaved': '¡Marca guardada exitosamente!',
      'settings.logoTooLarge': 'El logo debe ser menor de 500KB',
      'settings.logoInvalidType': 'El logo debe ser PNG, JPG o SVG',

      // Settings - Schedule
      'settings.postingStatus': 'Estado de Publicación',
      'settings.postingActive': 'Publicación ACTIVA',
      'settings.postingPaused': 'Publicación PAUSADA',
      'settings.postingActiveDesc': 'Las publicaciones se harán según tu horario',
      'settings.postingPausedDesc': 'Las publicaciones programadas no se harán hasta que reanudes',
      'settings.pausePosting': 'Pausar Publicación',
      'settings.resumePosting': 'Reanudar Publicación',
      'settings.timezone': 'Zona Horaria',
      'settings.platformSchedules': 'Horarios por Plataforma',
      'settings.noSchedules': 'No hay horarios configurados. Contacta al admin para configurar.',
      'settings.saveSchedule': 'Guardar Configuración de Horarios',
      'settings.scheduleSaved': '¡Configuración de horarios guardada!',
      'settings.scheduleActivated': 'Horario activado',
      'settings.scheduleDeactivated': 'Horario desactivado',
      'settings.active': 'Activo',
      'settings.inactive': 'Inactivo',
      'settings.postingFrequency': 'Frecuencia de Publicación',
      'settings.maxPerDay': 'Máx por día:',
      'settings.maxPerWeek': 'Máx por semana:',
      'settings.postingDays': 'Días de Publicación',
      'settings.postingTimeSlots': 'Horarios de Publicación',
      'settings.slotsOf': 'de',
      'settings.slots': 'horarios',
      'settings.add': 'Agregar',
      'settings.maxSlotsReached': 'Máximo de horarios alcanzado',
      'settings.atLeastOneSlot': 'Se requiere al menos un horario',

      // Settings - Approval
      'settings.approvalMode': 'Modo de Aprobación',
      'settings.autoApprove': 'Aprobación Automática',
      'settings.autoApproveDesc': 'Las publicaciones se aprueban y programan automáticamente. No se requiere revisión manual.',
      'settings.emailApproval': 'Aprobación por Correo (Todas)',
      'settings.emailApprovalDesc': 'Recibe un correo con enlaces para aprobar/rechazar cada publicación. Aprueba directo desde tu bandeja.',
      'settings.emailAiOnly': 'Aprobación por Correo (Solo IA)',
      'settings.emailAiOnlyDesc': 'Solo las publicaciones generadas por IA requieren aprobación por correo. Las manuales se aprueban automáticamente.',
      'settings.saveApproval': 'Guardar Config de Aprobación',
      'settings.approvalSaved': '¡Configuración de aprobación guardada!',
      'settings.selectMode': 'Por favor selecciona un modo de aprobación',

      // Settings - Secciones de aprobación
      'settings.socialPostsApproval': 'Publicaciones Sociales',
      'settings.socialPostsApprovalDesc': 'Elige cómo se aprueban las publicaciones antes de ser publicadas.',
      'settings.messagesApproval': 'Mensajes y Respuestas',
      'settings.messagesApprovalDesc': 'Elige cómo se manejan los mensajes y respuestas generados por IA antes de enviarlos.',
      'settings.msgManual': 'Revisión Manual',
      'settings.msgManualDesc': 'Todos los mensajes requieren tu aprobación antes de ser enviados. Revisa cada respuesta en el Centro de Aprobaciones.',
      'settings.msgAiOnly': 'Revisar Solo Generados por IA',
      'settings.msgAiOnlyDesc': 'Solo las respuestas generadas por IA necesitan aprobación. Las respuestas basadas en plantilla se envían automáticamente.',
      'settings.msgAuto': 'Envío Automático',
      'settings.msgAutoDesc': 'Todos los mensajes se envían automáticamente sin revisión manual. Usar con precaución.',
      'settings.sendApprovalTo': 'Enviar solicitudes de aprobación a',
      'settings.emailRequired': 'El correo es obligatorio para la aprobación por correo',
      'settings.emailInvalid': 'Por favor ingresa un correo electrónico válido',
      'settings.emailHint': 'Debe ser un correo válido que revisas regularmente',
      'settings.timeoutSettings': 'Configuraciones de Tiempo Límite',
      'settings.ifNotApprovedWithin': 'Si no se aprueba en',
      'settings.then': 'Entonces',
      'settings.hours': 'horas',
      'settings.sendAnyway': 'Enviar de todos modos',
      'settings.sendAnywayDesc': 'recomendado para respuestas oportunas',
      'settings.discard': 'Descartar',
      'settings.discardDesc': 'más seguro pero puede perder oportunidades',
      'settings.notifyMe': 'Notificarme para manejar manualmente',
      'settings.timeoutTip': 'Tiempos de respuesta rápidos generan confianza con los leads. Recomendamos "Enviar de todos modos" para no perder oportunidades.',
      'settings.advancedPerChannel': 'Avanzado: Configuraciones por Canal',
      'settings.useDefault': 'Usar Predeterminado',
      'settings.fasterForPublic': 'Más rápido para comentarios públicos',
      'settings.privateReviewRecommended': 'Conversaciones privadas - revisión recomendada',
      'settings.instantRepliesExpected': 'Los usuarios esperan respuestas instantáneas',
      'settings.pendingItems': 'Tienes {count} elementos esperando aprobación',
      'settings.goToApprovalCenter': 'Ir al Centro de Aprobaciones',
      'settings.saveChanges': 'Guardar Cambios',

      // Settings - Hashtags
      'settings.addHashtagPack': 'Agregar Paquete de Hashtags',
      'settings.editHashtagPack': 'Editar Paquete de Hashtags',
      'settings.noHashtags': 'No hay paquetes de hashtags aún',
      'settings.hashtagsHelp': 'Crea un paquete de hashtags para organizar hashtags para tus publicaciones',
      'settings.packLabel': 'Nombre del Paquete',
      'settings.packLabelPlaceholder': 'ej., Reconocimiento de Marca',
      'settings.hashtagsList': 'Hashtags (uno por línea, incluye #)',
      'settings.hashtagActive': 'Activo (incluir en generación de posts)',
      'settings.cancel': 'Cancelar',
      'settings.save': 'Guardar',
      'settings.deleteHashtag': '¿Eliminar este paquete de hashtags?',
      'settings.hashtagDeleted': 'Paquete de hashtags eliminado',
      'settings.hashtagUpdated': 'Paquete de hashtags actualizado',
      'settings.hashtagCreated': 'Paquete de hashtags creado',
      'settings.addHashtagError': 'Por favor agrega al menos un hashtag que comience con #',

      // Settings - Themes
      'settings.contentThemes': 'Temas de Contenido',
      'settings.themesHelp': 'Activa o desactiva temas para la generación de contenido. Los temas activos se usarán al crear publicaciones.',
      'settings.noThemes': 'No hay temas configurados',
      'settings.themesContactAdmin': 'Contacta a tu admin para configurar temas de contenido',
      'settings.enableAll': 'Activar Todos',
      'settings.disableAll': 'Desactivar Todos',
      'settings.themeEnabled': 'Tema activado',
      'settings.themeDisabled': 'Tema desactivado',
      'settings.allThemesEnabled': 'Todos los temas activados',
      'settings.allThemesDisabled': 'Todos los temas desactivados',

      // Common Actions
      'common.confirm': 'Confirmar',
      'common.cancel': 'Cancelar',
      'common.ok': 'OK',
      'common.save': 'Guardar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.close': 'Cerrar',
      'common.tryAgain': 'Intentar de Nuevo',
      'common.more': 'más',

      // Dialogs
      'dialog.confirm': 'Confirmar',
      'dialog.notice': 'Aviso',
      'dialog.input': 'Entrada',

      // Errors
      'error.failed': 'Falló',
      'error.loadSettings': 'Error al cargar configuración:',
      'error.saveFailed': 'Error al guardar:',

      // Toasts / Notifications
      'toast.sessionExpiring': 'Sesión expirando pronto',
      'toast.sessionExpireMessage': 'Tu sesión expirará en unos minutos. Guarda tu trabajo.',
      'toast.extendSession': 'Extender Sesión',
      'toast.sessionExtended': 'Sesión extendida',
      'toast.sessionExtendFailed': 'No se pudo extender la sesión',
      'toast.offline': 'Estás sin conexión.',
      'toast.offlineCheck': 'Por favor verifica tu conexión a internet.',
      'toast.backOnline': '¡Estás en línea de nuevo!',
      'toast.unsavedChanges': 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',

      // Days of week
      'day.mon': 'Lun',
      'day.tue': 'Mar',
      'day.wed': 'Mié',
      'day.thu': 'Jue',
      'day.fri': 'Vie',
      'day.sat': 'Sáb',
      'day.sun': 'Dom',

      // Timezones
      'tz.eastern': 'Hora del Este (ET)',
      'tz.central': 'Hora Central (CT)',
      'tz.mountain': 'Hora de Montaña (MT)',
      'tz.pacific': 'Hora del Pacífico (PT)',
      'tz.brazil': 'Brasil (BRT)',
      'tz.london': 'Londres (GMT/BST)',
      'tz.paris': 'París (CET)',
      'tz.tokyo': 'Tokio (JST)',
      'tz.utc': 'UTC',

      // Language selector
      'lang.english': 'English',
      'lang.portuguese': 'Português (BR)',
      'lang.spanish': 'Español',

      // Posts Page
      'posts.title': 'Publicaciones',
      'posts.subtitle': 'Administra tu contenido programado y publicado',
      'posts.newPost': 'Nueva Publicación',
      'posts.allStatuses': 'Todos los Estados',
      'posts.allPlatforms': 'Todas las Plataformas',
      'posts.refresh': 'Actualizar',
      'posts.selected': 'seleccionados',
      'posts.clear': 'Limpiar',
      'posts.approve': 'Aprobar',
      'posts.skip': 'Omitir',
      'posts.delete': 'Eliminar',
      'posts.noPostsFound': 'No se encontraron publicaciones',
      'posts.adjustFilters': 'Intenta ajustar los filtros o crea una nueva publicación',
      'posts.createPost': 'Crear Publicación',
      'posts.selectAll': 'Seleccionar todos',
      'posts.selectable': 'seleccionables',
      'posts.untitled': 'Sin título',
      'posts.notScheduled': 'No programado',
      'posts.failedLoad': 'Error al cargar publicaciones',
      'posts.tryAgain': 'Intentar de nuevo',
      'posts.deleteConfirm': '¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.',
      'posts.deleteTitle': 'Eliminar Publicación',
      'posts.deleted': 'Publicación eliminada',
      'posts.bulkConfirm': '¿Estás seguro de que deseas',
      'posts.post': 'publicación',
      'posts.posts': 'publicaciones',

      // Approvals Page - Centro de Aprobaciones
      'approvals.title': 'Centro de Aprobaciones',
      'approvals.subtitle': 'Revisa y aprueba publicaciones y mensajes',
      'approvals.refresh': 'Actualizar',

      // Tabs
      'approvals.tabAll': 'Todo',
      'approvals.tabPosts': 'Publicaciones',
      'approvals.tabMessages': 'Mensajes',

      // Stats
      'approvals.pendingPosts': 'publicaciones pendientes',
      'approvals.pendingMessages': 'mensajes pendientes',
      'approvals.approvedToday': 'aprobados hoy',

      // Type labels
      'approvals.typePost': 'PUBLICACIÓN',
      'approvals.typeMessage': 'MENSAJE',

      // Channels
      'approvals.channelInstagram': 'Instagram',
      'approvals.channelFacebook': 'Facebook',
      'approvals.channelLinkedin': 'LinkedIn',
      'approvals.channelInstagramDm': 'DM de Instagram',
      'approvals.channelFacebookDm': 'DM de Facebook',
      'approvals.channelInstagramComment': 'Comentario de Instagram',
      'approvals.channelFacebookComment': 'Comentario de Facebook',
      'approvals.channelEmail': 'Correo',
      'approvals.channelWhatsapp': 'WhatsApp',
      'approvals.channelSms': 'SMS',

      // Time
      'approvals.expiresIn': 'Expira en',
      'approvals.expired': 'Expirado',

      // Actions
      'approvals.approveAndSchedule': 'Aprobar y Programar',
      'approvals.approveAndSend': 'Aprobar y Enviar',
      'approvals.edit': 'Editar',
      'approvals.reject': 'Rechazar',
      'approvals.preview': 'Vista Previa',

      // Labels
      'approvals.to': 'Para',
      'approvals.subject': 'Asunto',
      'approvals.theirMessage': 'Su mensaje',
      'approvals.aiResponse': 'Respuesta IA',

      // Filters
      'approvals.allChannels': 'Todos los Canales',
      'approvals.allPlatforms': 'Todas las Plataformas',
      'approvals.sortUrgent': 'Más Urgentes',
      'approvals.sortNewest': 'Más Recientes',
      'approvals.search': 'Buscar...',

      // Empty states
      'approvals.noItems': 'Sin aprobaciones pendientes',
      'approvals.noItemsDesc': '¡Todo al día! Nuevos elementos aparecerán aquí cuando necesiten tu revisión.',
      'approvals.noPostsDesc': 'Sin publicaciones esperando aprobación.',
      'approvals.noMessagesDesc': 'Sin mensajes esperando aprobación.',

      // Bulk actions
      'approvals.selectAll': 'Seleccionar Todo',
      'approvals.approveSelected': 'Aprobar',
      'approvals.rejectSelected': 'Rechazar',
      'approvals.selected': 'seleccionados',
      'approvals.clearSelection': 'Limpiar',

      // Confirmations
      'approvals.confirmApprovePost': '¿Aprobar y programar esta publicación?',
      'approvals.confirmApproveMessage': '¿Aprobar y enviar este mensaje?',
      'approvals.confirmReject': '¿Rechazar este elemento?',
      'approvals.confirmRejectDesc': 'Esta acción no se puede deshacer.',
      'approvals.confirmBulkApprove': '¿Aprobar elementos seleccionados?',
      'approvals.confirmBulkReject': '¿Rechazar elementos seleccionados?',

      // Success messages
      'approvals.postApproved': '¡Publicación aprobada y programada!',
      'approvals.messageApproved': '¡Mensaje aprobado y enviado!',
      'approvals.itemRejected': 'Elemento rechazado',
      'approvals.bulkApproved': '¡elementos aprobados!',
      'approvals.bulkRejected': 'elementos rechazados',

      // Edit modal
      'approvals.editPost': 'Editar Publicación',
      'approvals.editMessage': 'Editar Mensaje',
      'approvals.originalContent': 'Contenido IA Original',
      'approvals.yourVersion': 'Tu Versión Editada',
      'approvals.resetToOriginal': 'Restaurar Original',
      'approvals.saveAndApprove': 'Guardar y Aprobar',
      'approvals.cancel': 'Cancelar',

      // Legacy
      'approvals.failedLoad': 'Error al cargar aprobaciones',
      'approvals.tryAgain': 'Intentar de nuevo',
      'approvals.failedApprove': 'Error al aprobar',
      'approvals.failedReject': 'Error al rechazar',

      // Media Page
      'media.title': 'Biblioteca de Medios',
      'media.subtitle': 'Sube y administra tus imágenes y videos',
      'media.uploadImages': 'Subir Imágenes',
      'media.dropFiles': 'Suelta archivos aquí para subir',
      'media.orBrowse': 'o',
      'media.browse': 'explora',
      'media.fromComputer': 'desde tu computadora',
      'media.supportedFormats': 'Soporta: JPG, PNG, GIF, WebP, MP4 (máx 10MB)',
      'media.uploading': 'Subiendo...',
      'media.allTypes': 'Todos los Tipos',
      'media.images': 'Imágenes',
      'media.videos': 'Videos',
      'media.allPlatforms': 'Todas las Plataformas',
      'media.searchPlaceholder': 'Buscar por nombre de archivo...',
      'media.refresh': 'Actualizar',
      'media.showing': 'Mostrando',
      'media.of': 'de',
      'media.items': 'elementos',
      'media.loadMore': 'Cargar Más',
      'media.noMedia': 'Sin archivos de medios',
      'media.uploadFirst': 'Sube tu primera imagen o video para comenzar',
      'media.failedLoad': 'Error al cargar medios',
      'media.details': 'Detalles del Medio',
      'media.filename': 'Nombre del archivo',
      'media.type': 'Tipo',
      'media.size': 'Tamaño',
      'media.dimensions': 'Dimensiones',
      'media.aspectRatio': 'Relación de Aspecto',
      'media.usedInPosts': 'Usado en Publicaciones',
      'media.times': 'veces',
      'media.uploaded': 'Subido',
      'media.suitablePlatforms': 'Plataformas Adecuadas',
      'media.tags': 'Etiquetas',
      'media.editTags': 'Editar Etiquetas',
      'media.noTags': 'Sin etiquetas',
      'media.notes': 'Notas',
      'media.url': 'URL',
      'media.openFull': 'Abrir Completo',
      'media.useInPost': 'Usar en Publicación',
      'media.deleteMedia': '¿Eliminar Medio?',
      'media.deleteWarning': 'Esta acción no se puede deshacer. La imagen se eliminará permanentemente.',
      'media.cancel': 'Cancelar',
      'media.currentTags': 'Etiquetas Actuales',
      'media.addTag': 'Agregar Etiqueta',
      'media.enterTag': 'Ingresa etiqueta...',
      'media.add': 'Agregar',
      'media.maxTags': 'Máx 10 etiquetas, cada una hasta 50 caracteres',
      'media.optionalNotes': 'Notas opcionales sobre esta imagen...',
      'media.saveChanges': 'Guardar Cambios',
      'media.tagsUpdated': 'Etiquetas actualizadas',
      'media.mediaDeleted': 'Medio eliminado',
      'media.urlCopied': '¡URL copiada!',
      'media.filesUploaded': 'archivo(s) subido(s)',
      'media.invalidType': 'Tipo de archivo inválido',
      'media.tooLarge': 'es muy grande (máx 10MB)',
      'media.failedUpload': 'Error al subir',

      // Calendar Page
      'calendar.title': 'Calendario de Contenido',
      'calendar.subtitle': 'Visualiza y administra tu calendario de publicaciones',
      'calendar.month': 'Mes',
      'calendar.week': 'Semana',
      'calendar.newPost': 'Nueva Publicación',
      'calendar.today': 'Hoy',
      'calendar.posted': 'Publicado',
      'calendar.scheduled': 'Programado',
      'calendar.pending': 'Pendiente',
      'calendar.failed': 'Fallido',
      'calendar.addPost': 'Agregar publicación',
      'calendar.addMore': 'Agregar más',
      'calendar.addPostForDay': 'Agregar Publicación para Este Día',
      'calendar.noPostsDay': 'No hay publicaciones programadas para este día',
      'calendar.failedLoad': 'Error al cargar calendario',
      'calendar.tryAgain': 'Intentar de nuevo',
      'calendar.post': 'Publicación',
      'calendar.untitled': 'Sin título',
      'calendar.noCaption': 'Sin descripción',
      'calendar.more': 'más',
      // Month names
      'calendar.january': 'Enero',
      'calendar.february': 'Febrero',
      'calendar.march': 'Marzo',
      'calendar.april': 'Abril',
      'calendar.may': 'Mayo',
      'calendar.june': 'Junio',
      'calendar.july': 'Julio',
      'calendar.august': 'Agosto',
      'calendar.september': 'Septiembre',
      'calendar.october': 'Octubre',
      'calendar.november': 'Noviembre',
      'calendar.december': 'Diciembre',
      // Day names (short)
      'calendar.sun': 'Dom',
      'calendar.mon': 'Lun',
      'calendar.tue': 'Mar',
      'calendar.wed': 'Mié',
      'calendar.thu': 'Jue',
      'calendar.fri': 'Vie',
      'calendar.sat': 'Sáb',
      // Day names (full)
      'calendar.sunday': 'Domingo',
      'calendar.monday': 'Lunes',
      'calendar.tuesday': 'Martes',
      'calendar.wednesday': 'Miércoles',
      'calendar.thursday': 'Jueves',
      'calendar.friday': 'Viernes',
      'calendar.saturday': 'Sábado',

      // Analytics Page
      'analytics.title': 'Analíticas',
      'analytics.subtitle': 'Rastrea el rendimiento de tus publicaciones',
      'analytics.thisWeek': 'Esta Semana',
      'analytics.thisMonth': 'Este Mes',
      'analytics.last3Months': 'Últimos 3 Meses',
      'analytics.thisYear': 'Este Año',
      'analytics.refresh': 'Actualizar',
      'analytics.loading': 'Cargando analíticas...',
      'analytics.totalPosts': 'Total de Publicaciones',
      'analytics.posted': 'Publicados',
      'analytics.scheduled': 'Programados',
      'analytics.approvalRate': 'Tasa de Aprobación',
      'analytics.postsByPlatform': 'Publicaciones por Plataforma',
      'analytics.postsByStatus': 'Publicaciones por Estado',
      'analytics.postingActivity': 'Actividad de Publicación',
      'analytics.recentPosts': 'Publicaciones Recientes',
      'analytics.failedLoad': 'Error al cargar analíticas',
      'analytics.tryAgain': 'Intentar de nuevo',
      'analytics.noData': 'Sin datos',
      'analytics.noPostsFound': 'No se encontraron publicaciones',
      'analytics.pending': 'Pendientes',
      'analytics.failed': 'Fallidos',
      'analytics.cancelled': 'Cancelados'
    }
  },

  /**
   * Initialize i18n
   */
  init() {
    // Load saved language or detect from browser
    const saved = localStorage.getItem('tb4b_portal_lang');
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    } else {
      this.currentLang = this.detectBrowserLanguage();
    }

    // Apply translations
    this.applyLanguage(this.currentLang);

    // Setup language selector if exists
    this.setupLanguageSelector();

    console.log('✅ Portal i18n initialized:', this.currentLang);
  },

  /**
   * Detect browser language
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) return 'pt-BR';
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
    localStorage.setItem('tb4b_portal_lang', lang);

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
    const selector = document.getElementById('portal-lang-select');
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
      // Re-render current page to update dynamic content
      if (window.Router && typeof Router.handleRoute === 'function') {
        Router.handleRoute();
      }
    }
  },

  /**
   * Setup language selector dropdown
   */
  setupLanguageSelector() {
    const selector = document.getElementById('portal-lang-select');
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
  document.addEventListener('DOMContentLoaded', () => PortalI18n.init());
} else {
  PortalI18n.init();
}
