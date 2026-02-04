
const translations = {
  en: {
    'nav.services': 'What we automate',
    'nav.playbooks': 'Playbooks',
    'nav.process': 'How it works',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.auditButton': 'Free audit',
    'nav.clientLogin': 'Client Login',
    'nav.backHome': '← Back to Home',

    'hero.badge': 'Built for owner-led businesses · 3–50 people',
    'hero.headingMain': 'Turn chaos in calls, emails and DMs into',
    'hero.headingHighlight': 'quiet, reliable automations.',
    'hero.body': 'TechBuddy4Biz designs and runs done-for-you workflows across phones, email, social and spreadsheets — using tools you already have. No new app for your team to babysit. No buzzword soup. Just less manual work.',
    'hero.ctaPrimary': 'Get free automation audit',
    'hero.ctaSecondary': 'See what we automate',
    'hero.stat1Label': 'Typical first wins',
    'hero.stat1Value': 'Missed-call SMS · email triage',
    'hero.stat2Label': 'Tool stack',
    'hero.stat2Value': 'Google Workspace · n8n · OpenAI',
    'hero.stat3Label': 'Engagement model',
    'hero.stat3Value': 'Done-for-you, fixed-scope projects',
    'hero.sampleLabel': 'Sample workflow',
    'hero.sampleTitle': 'Missed call → SMS → Lead in Sheet',
    'hero.sampleStatus': 'Live',
    'hero.sampleStep1Title': 'Incoming call',
    'hero.sampleStep1Body': 'If missed for more than 30 seconds',
    'hero.sampleStep1Tag': 'Trigger',
    'hero.sampleStep2Title': 'SMS follow-up',
    'hero.sampleStep2Body': '“Sorry we missed you – reply with what you need.”',
    'hero.sampleStep2Tag': '+ 30–50% recaptured',
    'hero.sampleStep3Title': 'Lead added to Sheet',
    'hero.sampleStep3Body': 'Name · number · source · first message',
    'hero.sampleStep3Tag': 'Google Sheets',
    'hero.sampleMetric1Label': 'Owner hours saved',
    'hero.sampleMetric1Value': '3–5 / week',
    'hero.sampleMetric2Label': 'Recovery rate',
    'hero.sampleMetric2Value': '+35%',
    'hero.sampleMetric3Label': 'Time to deploy',
    'hero.sampleMetric3Value': '7–10 days',

    'services.title': 'Typical first automations',
    'services.body': 'We start with low-risk, high-impact workflows that clean up the chaos in your day without forcing your team to learn a new system.',
    'services.stack': 'All built on Google Workspace, n8n, OpenAI, plus the phone, CRM and social tools you already use.',
    'services.callsTitle': 'Calls & SMS',
    'services.callsItem1': 'Missed-call SMS with reply capture and reminders.',
    'services.callsItem2': 'Simple IVR menus that route calls or log voicemails automatically.',
    'services.callsItem3': 'Daily summary of new calls and voicemails in your inbox or Sheet.',
    'services.emailTitle': 'Email & DMs',
    'services.emailItem1': 'Auto-responses for FAQs (hours, basic pricing, service areas).',
    'services.emailItem2': 'Tagging and routing for sales, support and billing messages.',
    'services.emailItem3': 'Leads from email, forms and IG DMs in one central list.',
    'services.reportsTitle': 'Reports & owner visibility',
    'services.reportsItem1': 'Weekly “owner digest” email: leads, jobs, top channels.',
    'services.reportsItem2': 'Google Sheets dashboards that anyone on the team can read.',
    'services.reportsItem3': 'Automated follow-up lists so nothing slips through the cracks.',

    'playbooks.title': 'Starter playbooks',
    'playbooks.body': 'Pre-designed automation templates we adapt to your business, so we’re not starting from zero.',
    'playbooks.card1Badge': 'Service trades',
    'playbooks.card1Title': 'Home services lead machine',
    'playbooks.card1Item1': 'Track every call, form and DM in one Sheet.',
    'playbooks.card1Item2': 'Missed-call SMS + quote follow-up sequence.',
    'playbooks.card1Item3': 'Simple pipeline view for today / this week / overdue.',
    'playbooks.card2Badge': 'Local pros',
    'playbooks.card2Title': 'Inbox to bookings',
    'playbooks.card2Item1': 'Auto-qualification questions for new enquiries.',
    'playbooks.card2Item2': 'Push qualified leads to your calendar or booking tool.',
    'playbooks.card2Item3': 'Owner summary every morning with new bookings.',
    'playbooks.card3Badge': 'Agencies & studios',
    'playbooks.card3Title': 'Client touchpoint tracker',
    'playbooks.card3Item1': 'Log client calls, emails and Slack/DMs to a timeline.',
    'playbooks.card3Item2': 'Flag accounts that haven’t heard from you in X days.',
    'playbooks.card3Item3': 'Generate simple prep notes before key meetings.',

    'process.title': 'How we work together',
    'process.body': 'Clear, low-drama steps. You always know what’s being built, why, and how to turn it off.',
    'process.step1Label': 'Step 1',
    'process.step1Title': 'Free automation audit',
    'process.step1Body': 'Short call plus a look at how calls, emails, DMs and spreadsheets flow today. We identify 2–4 low-risk automations.',
    'process.step2Label': 'Step 2',
    'process.step2Title': 'Blueprint & fixed price',
    'process.step2Body': 'You get a simple diagram and bullet list of changes, with fixed pricing per workflow. No hourly surprises.',
    'process.step3Label': 'Step 3',
    'process.step3Title': 'Build, test, measure',
    'process.step3Body': 'We implement, test with your team, and send you a plain-English summary plus one-page “turn off / change” guide.',

    'faq.title': 'Questions owners ask',
    'faq.body': 'Straight answers, no hype. You’re trusting us with your core business systems; you should know how this works.',
    'faq.q1': 'Do I need to change my phone system, CRM or email provider?',
    'faq.a1': 'Usually not. We prefer to build on top of what you already use (Google Workspace, existing VoIP, CRM, Meta accounts). If a tool is actively blocking automation, we’ll explain options and costs before changing anything.',
    'faq.q2': 'How do you handle security and access?',
    'faq.a2': 'We use official, revoke-able integrations wherever possible (Google, Meta, VoIP providers). You stay in control and can remove our access at any time. No passwords shared over chat, no “shadow IT”.',
    'faq.q3': 'What if my team hates changes to their workflow?',
    'faq.a3': 'We design automations that remove grunt work without forcing new apps on the team. Think: fewer manual updates and reminders, not a totally new system everyone has to learn.',
    'faq.q4': 'Can we start small?',
    'faq.a4': 'Yes. Most clients start with one or two workflows (for example, missed-call follow-up + lead tracking) and expand once they see the impact.',

    'contact.title': 'Contact us',
    'contact.body': 'Ready to talk through your automation ideas or not sure where to start? Reach out and we’ll respond with a couple of options tailored to your business.',
    'contact.emailLabel': 'Email:',
    'contact.instagramLabel': 'Instagram:',
    'contact.hintIntro': 'If you prefer, just send a quick note with:',
    'contact.hintItem1': 'Your business name and what you do.',
    'contact.hintItem2': 'How many people work in the business.',
    'contact.hintItem3': 'Where you feel you’re losing the most time each week.',
    'contact.hintOutro': 'We’ll usually suggest a short intro call or send you 1–2 ideas by email first, so you can see if the approach makes sense.',

    'audit.title': 'Request your free automation audit',
    'audit.body': 'Tell us how your business runs today. We’ll review your calls, emails, DMs and spreadsheets and come back with 2–4 concrete automations, including estimated time-savings and a fixed-price implementation option.',
    'audit.bullet1': 'No obligation – you can implement ideas yourself or with us.',
    'audit.bullet2': 'We focus on owner-time saved and fewer dropped opportunities.',
    'audit.bullet3': 'Built on your existing tools: Google Workspace, phones, CRM, social.',
    'audit.fieldName': 'Your name',
    'audit.fieldEmail': 'Work email',
    'audit.fieldCompany': 'Business name',
    'audit.fieldTeamSize': 'Team size',
    'audit.teamOption1': '1–3',
    'audit.teamOption2': '4–10',
    'audit.teamOption3': '11–25',
    'audit.teamOption4': '26–50',
    'audit.teamOption5': '50+',
    'audit.fieldPain': 'Biggest time-waster right now',
    'audit.fieldSystems': 'What tools do you use today? (email, phone, CRM, spreadsheets…)',
    'audit.pain.placeholder': 'Select the #1 time-waster',
    'audit.pain.email_triage': 'Classifying & responding to emails',
    'audit.pain.messages': 'Reading & replying to SMS/WhatsApp/DMs',
    'audit.pain.missed_calls': 'Missed calls / voicemail follow-up',
    'audit.pain.lead_followup': 'Lead capture & follow-up (new inquiries)',
    'audit.pain.scheduling': 'Scheduling, rescheduling, and reminders',
    'audit.pain.quoting': 'Quotes / estimates / proposals',
    'audit.pain.invoicing': 'Invoices, payments, and past-due chasing',
    'audit.pain.reporting': 'Creating reports & dashboards',
    'audit.pain.data_entry': 'Copy/pasting data between tools',
    'audit.pain.customer_support': 'Customer support FAQs / status updates',
    'audit.pain.reviews': 'Requesting reviews & referrals',
    'audit.toolsHint': 'Select all that apply.',
'audit.toolsGroup.email': 'Email',
'audit.toolsGroup.messaging': 'Messaging',
'audit.toolsGroup.crm': 'CRM',
'audit.toolsGroup.sheets': 'Spreadsheets',
'audit.toolsGroup.accounting': 'Accounting',
'audit.toolsGroup.scheduling': 'Scheduling',
'audit.toolsGroup.phone': 'Phone',
'audit.toolsGroup.ecom': 'E-commerce',
'audit.toolsGroup.ops': 'Operations',
    'audit.error.toolsRequired': "Please select at least one tool you use today.",
    'audit.tool.gmail': 'Gmail',
    'audit.tool.outlook': 'Outlook / Microsoft 365',
    'audit.tool.google_workspace': 'Google Workspace',
    'audit.tool.zoho_mail': 'Zoho Mail',
    'audit.tool.whatsapp_business': 'WhatsApp Business',
    'audit.tool.sms': 'SMS texting',
    'audit.tool.instagram_dm': 'Instagram DMs',
    'audit.tool.facebook_messenger': 'Facebook Messenger',
    'audit.tool.hubspot': 'HubSpot',
    'audit.tool.salesforce': 'Salesforce',
    'audit.tool.pipedrive': 'Pipedrive',
    'audit.tool.zoho_crm': 'Zoho CRM',
    'audit.tool.google_sheets': 'Google Sheets',
    'audit.tool.excel': 'Microsoft Excel',
    'audit.tool.quickbooks': 'QuickBooks',
    'audit.tool.xero': 'Xero',
    'audit.tool.google_calendar': 'Google Calendar',
    'audit.tool.calendly': 'Calendly',
    'audit.tool.google_voice': 'Google Voice',
    'audit.tool.ringcentral': 'RingCentral',
    'audit.tool.shopify': 'Shopify',
    'audit.tool.woocommerce': 'WooCommerce',
    'audit.tool.trello': 'Trello',
    'audit.tool.asana': 'Asana',
    'audit.fieldFollowUp': 'Preferred follow-up',
    'audit.followEmail': 'Email',
    'audit.followPhone': 'Phone / WhatsApp',
    'audit.submit': 'Send my audit request',
    'audit.disclaimer': 'This form is powered by our secure automation backend. We’ll only use your details to respond to your request.',

    'footer.rights': 'All rights reserved.',
    'footer.location': 'Based in Central Florida · Working remotely with clients across the US.',

    // Hero new keys
    'hero.body2': 'TechBuddy4Biz helps owner-led businesses like yours automate the chaos — using tools you already have. No IT team required. No confusing apps. Just more time for what matters.',
    'hero.check1': 'No tech jargon',
    'hero.check2': 'Fixed pricing',
    'hero.check3': 'Done-for-you',
    'hero.cardTitle': 'Sound familiar?',
    'hero.pain1': '"I spend half my day answering the same questions over and over."',
    'hero.pain2': '"I know I\'m losing leads when I miss calls, but I can\'t be everywhere."',
    'hero.pain3': '"I don\'t have an IT person and I don\'t know where to start with automation."',
    'hero.cardCta': 'We get it. That\'s exactly why we exist.',
    'hero.metric1Value': '5-10',
    'hero.metric1Label': 'hours saved weekly',
    'hero.metric2Value': '35%',
    'hero.metric2Label': 'more leads captured',
    'hero.metric3Value': '7',
    'hero.metric3Label': 'days to go live',

    // Trust section
    'trust.title': 'Why business owners trust us',
    'trust.subtitle': 'No tech background needed. No long-term contracts. Just results.',
    'trust.card1Title': 'You stay in control',
    'trust.card1Body': 'Everything we build uses your existing accounts. You can turn off any automation instantly. No lock-in, ever.',
    'trust.card2Title': 'We explain everything',
    'trust.card2Body': 'No tech speak. We walk you through every workflow in plain English and give you a simple "how to change it" guide.',
    'trust.card3Title': 'Fixed, honest pricing',
    'trust.card3Body': 'You know the cost before we start. No hourly surprises. No hidden fees. If it costs more, we tell you first.',
    'trust.testimonial': '"I was drowning in messages and didn\'t know where to start. TechBuddy4Biz set up a simple system that saves me hours every week. They explained everything so I actually understand how it works."',
    'trust.testimonialAuthor': '— Service business owner, Central Florida',

    // Final CTA
    'cta.title': 'Ready to stop fighting with technology?',
    'cta.body': 'Get your free automation audit. We\'ll show you exactly where you\'re losing time—and how to get it back. No obligation, no tech jargon.',
    'cta.primary': 'Get my free audit →',
    'cta.secondary': 'Contact us first',
    'cta.disclaimer': 'Takes 5 minutes · No spam · Response within 24 hours',

    // Audit page
    'auditPage.badge': '✓ Free · No obligation · Takes 5 minutes',
    'auditPage.heroTitle': 'Get Your Free Automation Audit',
    'auditPage.heroBody': 'Tell us about your business. We\'ll show you exactly where you\'re losing time—and how to get it back.',
    'auditPage.benefitsTitle': 'What you\'ll receive',
    'auditPage.benefit1Title': 'Personalized automation roadmap',
    'auditPage.benefit1Body': '2–4 specific workflows tailored to your business, with estimated time savings.',
    'auditPage.benefit2Title': 'Fixed pricing—no surprises',
    'auditPage.benefit2Body': 'Clear costs for each automation so you can plan ahead.',
    'auditPage.benefit3Title': 'No obligation—ever',
    'auditPage.benefit3Body': 'Use the ideas yourself or let us build them. Your choice.',
    'auditPage.testimonial': '"We thought automation was only for big companies with IT departments. TechBuddy4Biz showed us it\'s actually simpler than we thought—and now we\'re saving 10+ hours a week."',
    'auditPage.testimonialAuthor': '— Small business owner, Central Florida'
  },

  pt: {
    'nav.services': 'O que automatizamos',
    'nav.playbooks': 'Playbooks',
    'nav.process': 'Como funciona',
    'nav.faq': 'Perguntas frequentes',
    'nav.contact': 'Contato',
    'nav.backHome': '← Voltar ao início',
    'nav.auditButton': 'Auditoria grátis',
    'nav.clientLogin': 'Acesso Cliente',

    'hero.badge': 'Feito para empresas lideradas pelo dono · 3–50 pessoas',
    'hero.headingMain': 'Transforme o caos de ligações, e-mails e DMs em',
    'hero.headingHighlight': 'automações simples e confiáveis.',
    'hero.body': 'A TechBuddy4Biz desenha e opera fluxos prontos para uso entre telefone, e-mail, redes sociais e planilhas — usando as ferramentas que você já tem. Nada de novo sistema para a equipe cuidar. Sem conversa fiada. Só menos trabalho manual.',
    'hero.ctaPrimary': 'Pedir auditoria de automação grátis',
    'hero.ctaSecondary': 'Ver o que automatizamos',
    'hero.stat1Label': 'Primeiros ganhos típicos',
    'hero.stat1Value': 'SMS de chamada perdida · triagem de e-mail',
    'hero.stat2Label': 'Pilha de ferramentas',
    'hero.stat2Value': 'Google Workspace · n8n · OpenAI',
    'hero.stat3Label': 'Modelo de atuação',
    'hero.stat3Value': 'Projetos prontos, escopo fechado',
    'hero.sampleLabel': 'Exemplo de fluxo',
    'hero.sampleTitle': 'Chamada perdida → SMS → Lead na planilha',
    'hero.sampleStatus': 'Ativo',
    'hero.sampleStep1Title': 'Chamada recebida',
    'hero.sampleStep1Body': 'Se ficar perdida por mais de 30 segundos',
    'hero.sampleStep1Tag': 'Gatilho',
    'hero.sampleStep2Title': 'SMS de retorno',
    'hero.sampleStep2Body': '“Desculpe, perdemos sua ligação – responda dizendo do que você precisa.”',
    'hero.sampleStep2Tag': '+ 30–50% recuperados',
    'hero.sampleStep3Title': 'Lead na planilha',
    'hero.sampleStep3Body': 'Nome · telefone · origem · primeira mensagem',
    'hero.sampleStep3Tag': 'Google Sheets',
    'hero.sampleMetric1Label': 'Horas do dono economizadas',
    'hero.sampleMetric1Value': '3–5 / semana',
    'hero.sampleMetric2Label': 'Taxa de recuperação',
    'hero.sampleMetric2Value': '+35%',
    'hero.sampleMetric3Label': 'Prazo de implantação',
    'hero.sampleMetric3Value': '7–10 dias',

    'services.title': 'Primeiras automações típicas',
    'services.body': 'Começamos com fluxos de baixo risco e alto impacto que organizam o seu dia sem forçar a equipe a aprender um sistema novo.',
    'services.stack': 'Tudo em cima de Google Workspace, n8n e OpenAI, mais o telefone, CRM e redes que você já usa.',
    'services.callsTitle': 'Ligações & SMS',
    'services.callsItem1': 'SMS automático para chamadas perdidas, com captura de resposta e lembretes.',
    'services.callsItem2': 'Menus simples (URA) que direcionam chamadas ou registram recados automaticamente.',
    'services.callsItem3': 'Resumo diário de novas ligações e recados na sua caixa de entrada ou planilha.',
    'services.emailTitle': 'E-mail & DMs',
    'services.emailItem1': 'Respostas automáticas para dúvidas frequentes (horário, preço base, área de atendimento).',
    'services.emailItem2': 'Classificação e direcionamento de mensagens de vendas, suporte e cobrança.',
    'services.emailItem3': 'Leads de e-mail, formulários e DMs do Instagram em uma lista central.',
    'services.reportsTitle': 'Relatórios & visão do dono',
    'services.reportsItem1': 'E-mail semanal para o dono: leads, serviços e principais canais.',
    'services.reportsItem2': 'Painéis em Google Sheets que qualquer pessoa da equipe consegue entender.',
    'services.reportsItem3': 'Listas automáticas de follow-up para nada ficar esquecido.',

    'playbooks.title': 'Playbooks de partida',
    'playbooks.body': 'Modelos de automação prontos que adaptamos ao seu negócio, sem começar do zero.',
    'playbooks.card1Badge': 'Serviços gerais',
    'playbooks.card1Title': 'Máquina de leads para serviços',
    'playbooks.card1Item1': 'Rastreie cada ligação, formulário e DM em uma única planilha.',
    'playbooks.card1Item2': 'SMS após chamada perdida + sequência de orçamento.',
    'playbooks.card1Item3': 'Visão simples de hoje / semana / atrasados.',
    'playbooks.card2Badge': 'Profissionais locais',
    'playbooks.card2Title': 'Da caixa de entrada para agendamentos',
    'playbooks.card2Item1': 'Perguntas de qualificação automática para novos contatos.',
    'playbooks.card2Item2': 'Envio de leads qualificados para a agenda ou sistema de agendamento.',
    'playbooks.card2Item3': 'Resumo diário para o dono com novos agendamentos.',
    'playbooks.card3Badge': 'Agências & estúdios',
    'playbooks.card3Title': 'Linha do tempo do cliente',
    'playbooks.card3Item1': 'Registre ligações, e-mails e mensagens em um histórico único.',
    'playbooks.card3Item2': 'Avise quando um cliente está há muitos dias sem contato.',
    'playbooks.card3Item3': 'Gere notas simples de preparo antes de reuniões importantes.',

    'process.title': 'Como trabalhamos juntos',
    'process.body': 'Passos claros e sem drama. Você sempre sabe o que está sendo construído, por quê e como desligar.',
    'process.step1Label': 'Passo 1',
    'process.step1Title': 'Auditoria de automação grátis',
    'process.step1Body': 'Conversa rápida e revisão de como fluem hoje as ligações, e-mails, DMs e planilhas. Identificamos 2–4 automações de baixo risco.',
    'process.step2Label': 'Passo 2',
    'process.step2Title': 'Blueprint & preço fechado',
    'process.step2Body': 'Você recebe um desenho simples e lista de mudanças, com preço fechado por fluxo. Sem surpresa por hora extra.',
    'process.step3Label': 'Passo 3',
    'process.step3Title': 'Construir, testar, medir',
    'process.step3Body': 'Implementamos, testamos com sua equipe e entregamos um resumo direto + guia de uma página para desligar ou ajustar.',

    'faq.title': 'Perguntas que os donos fazem',
    'faq.body': 'Respostas diretas, sem hype. Você está confiando em quem mexe nos sistemas centrais do negócio; precisa saber como funciona.',
    'faq.q1': 'Preciso trocar meu sistema de telefonia, CRM ou e-mail?',
    'faq.a1': 'Normalmente não. Preferimos trabalhar em cima do que você já usa (Google Workspace, telefonia VoIP existente, CRM, contas Meta). Se alguma ferramenta estiver travando a automação, explicamos as opções e custos antes de mudar qualquer coisa.',
    'faq.q2': 'Como vocês lidam com segurança e acesso?',
    'faq.a2': 'Usamos integrações oficiais e revogáveis sempre que possível (Google, Meta, provedores de VoIP). Você mantém o controle e pode remover o acesso a qualquer momento. Nada de senha enviada por chat nem “TI paralelo”.',
    'faq.q3': 'E se a equipe não gostar de mudar o jeito de trabalhar?',
    'faq.a3': 'Desenhamos automações para tirar trabalho repetitivo sem empurrar aplicativo novo para o time. A ideia é ter menos atualizações manuais e lembretes, não mais um sistema para aprender.',
    'faq.q4': 'Podemos começar pequeno?',
    'faq.a4': 'Sim. A maioria começa com um ou dois fluxos (por exemplo, retorno de chamada perdida + registro de leads) e amplia depois de ver o resultado.',

    'contact.title': 'Fale com a gente',
    'contact.body': 'Quer discutir ideias de automação ou não sabe por onde começar? Mande uma mensagem e voltamos com algumas opções para o seu negócio.',
    'contact.emailLabel': 'E-mail:',
    'contact.instagramLabel': 'Instagram:',
    'contact.hintIntro': 'Se preferir, envie uma mensagem rápida com:',
    'contact.hintItem1': 'Nome do negócio e o que você faz.',
    'contact.hintItem2': 'Quantas pessoas trabalham na empresa.',
    'contact.hintItem3': 'Onde você sente que mais perde tempo na semana.',
    'contact.hintOutro': 'Normalmente sugerimos uma conversa curta ou mandamos 1–2 ideias por e-mail primeiro, para você ver se faz sentido.',

    'audit.title': 'Peça sua auditoria de automação grátis',
    'audit.body': 'Conte como o seu negócio funciona hoje. Vamos revisar ligações, e-mails, DMs e planilhas e voltar com 2–4 automações concretas, incluindo estimativa de horas poupadas e preço fechado para implementação.',
    'audit.bullet1': 'Sem obrigação – você pode implementar sozinho ou conosco.',
    'audit.bullet2': 'Foco em economizar tempo do dono e reduzir oportunidades perdidas.',
    'audit.bullet3': 'Usamos suas ferramentas atuais: Google Workspace, telefone, CRM, redes sociais.',
    'audit.fieldName': 'Seu nome',
    'audit.fieldEmail': 'E-mail de trabalho',
    'audit.fieldCompany': 'Nome do negócio',
    'audit.fieldTeamSize': 'Tamanho da equipe',
    'audit.teamOption1': '1–3',
    'audit.teamOption2': '4–10',
    'audit.teamOption3': '11–25',
    'audit.teamOption4': '26–50',
    'audit.teamOption5': '50+',
    'audit.fieldPain': 'Maior perda de tempo hoje',
    'audit.fieldSystems': 'Que ferramentas usa hoje? (e-mail, telefone, CRM, planilhas…)',
    'audit.pain.placeholder': 'Selecione o #1 que mais toma seu tempo',
    'audit.pain.email_triage': 'Classificar e responder e-mails',
    'audit.pain.messages': 'Ler e responder SMS/WhatsApp/DMs',
    'audit.pain.missed_calls': 'Chamadas perdidas / retorno de voicemail',
    'audit.pain.lead_followup': 'Captura e follow-up de leads (novos contatos)',
    'audit.pain.scheduling': 'Agendamento, reagendamento e lembretes',
    'audit.pain.quoting': 'Orçamentos / estimativas / propostas',
    'audit.pain.invoicing': 'Faturas, pagamentos e cobrança de atrasados',
    'audit.pain.reporting': 'Criar relatórios e dashboards',
    'audit.pain.data_entry': 'Copiar/colar dados entre ferramentas',
    'audit.pain.customer_support': 'Atendimento (FAQ / status)',
    'audit.pain.reviews': 'Pedir avaliações e indicações',
    'audit.toolsHint': 'Selecione todas as opções aplicáveis.',
'audit.toolsGroup.email': 'E‑mail',
'audit.toolsGroup.messaging': 'Mensagens',
'audit.toolsGroup.crm': 'CRM',
'audit.toolsGroup.sheets': 'Planilhas',
'audit.toolsGroup.accounting': 'Financeiro',
'audit.toolsGroup.scheduling': 'Agendamento',
'audit.toolsGroup.phone': 'Telefone',
'audit.toolsGroup.ecom': 'E‑commerce',
'audit.toolsGroup.ops': 'Operações',
    'audit.error.toolsRequired': "Selecione pelo menos uma ferramenta que voc\u00ea usa hoje.",
    'audit.tool.gmail': 'Gmail',
    'audit.tool.outlook': 'Outlook / Microsoft 365',
    'audit.tool.google_workspace': 'Google Workspace',
    'audit.tool.zoho_mail': 'Zoho Mail',
    'audit.tool.whatsapp_business': 'WhatsApp Business',
    'audit.tool.sms': 'SMS',
    'audit.tool.instagram_dm': 'DMs do Instagram',
    'audit.tool.facebook_messenger': 'Facebook Messenger',
    'audit.tool.hubspot': 'HubSpot',
    'audit.tool.salesforce': 'Salesforce',
    'audit.tool.pipedrive': 'Pipedrive',
    'audit.tool.zoho_crm': 'Zoho CRM',
    'audit.tool.google_sheets': 'Google Sheets',
    'audit.tool.excel': 'Excel',
    'audit.tool.quickbooks': 'QuickBooks',
    'audit.tool.xero': 'Xero',
    'audit.tool.google_calendar': 'Google Calendar',
    'audit.tool.calendly': 'Calendly',
    'audit.tool.google_voice': 'Google Voice',
    'audit.tool.ringcentral': 'RingCentral',
    'audit.tool.shopify': 'Shopify',
    'audit.tool.woocommerce': 'WooCommerce',
    'audit.tool.trello': 'Trello',
    'audit.tool.asana': 'Asana',
    'audit.fieldFollowUp': 'Como prefere o retorno',
    'audit.followEmail': 'E-mail',
    'audit.followPhone': 'Telefone / WhatsApp',
    'audit.submit': 'Enviar pedido de auditoria',
    'audit.disclaimer': 'Este formulário é alimentado pelo nosso backend seguro de automação. Usaremos seus dados apenas para responder à sua solicitação.',

    'footer.rights': 'Todos os direitos reservados.',
    'footer.location': 'Baseado na Flórida Central · Atendendo clientes remotamente em todo os EUA.',

    // Hero new keys
    'hero.body2': 'A TechBuddy4Biz ajuda negócios liderados pelo dono, como o seu, a automatizar o caos — usando as ferramentas que você já tem. Sem precisar de equipe de TI. Sem apps confusos. Só mais tempo para o que importa.',
    'hero.check1': 'Sem jargão técnico',
    'hero.check2': 'Preço fechado',
    'hero.check3': 'Feito para você',
    'hero.cardTitle': 'Parece familiar?',
    'hero.pain1': '"Passo metade do dia respondendo as mesmas perguntas."',
    'hero.pain2': '"Sei que perco clientes quando não atendo ligações, mas não posso estar em todo lugar."',
    'hero.pain3': '"Não tenho ninguém de TI e não sei por onde começar com automação."',
    'hero.cardCta': 'A gente entende. É exatamente por isso que existimos.',
    'hero.metric1Value': '5-10',
    'hero.metric1Label': 'horas poupadas por semana',
    'hero.metric2Value': '35%',
    'hero.metric2Label': 'mais leads capturados',
    'hero.metric3Value': '7',
    'hero.metric3Label': 'dias para funcionar',

    // Trust section
    'trust.title': 'Por que donos de negócio confiam na gente',
    'trust.subtitle': 'Não precisa entender de tecnologia. Sem contratos longos. Só resultados.',
    'trust.card1Title': 'Você mantém o controle',
    'trust.card1Body': 'Tudo que construímos usa suas contas existentes. Você pode desligar qualquer automação na hora. Sem amarras.',
    'trust.card2Title': 'Explicamos tudo',
    'trust.card2Body': 'Sem linguagem técnica. Explicamos cada fluxo em português claro e entregamos um guia simples de "como ajustar".',
    'trust.card3Title': 'Preço fechado e honesto',
    'trust.card3Body': 'Você sabe o custo antes de começar. Sem surpresas por hora. Sem taxas escondidas. Se custar mais, avisamos antes.',
    'trust.testimonial': '"Estava afogado em mensagens e não sabia por onde começar. A TechBuddy4Biz montou um sistema simples que economiza horas toda semana. Eles explicaram tudo de um jeito que eu realmente entendi."',
    'trust.testimonialAuthor': '— Dono de negócio de serviços, Flórida Central',

    // Final CTA
    'cta.title': 'Pronto para parar de brigar com a tecnologia?',
    'cta.body': 'Peça sua auditoria de automação grátis. Vamos mostrar exatamente onde você perde tempo — e como recuperar. Sem obrigação, sem jargão técnico.',
    'cta.primary': 'Pedir minha auditoria grátis →',
    'cta.secondary': 'Falar com a gente antes',
    'cta.disclaimer': 'Leva 5 minutos · Sem spam · Resposta em 24 horas',

    // Audit page
    'auditPage.badge': '✓ Grátis · Sem compromisso · Leva 5 minutos',
    'auditPage.heroTitle': 'Peça Sua Auditoria de Automação Grátis',
    'auditPage.heroBody': 'Conte sobre seu negócio. Vamos mostrar exatamente onde você perde tempo — e como recuperar.',
    'auditPage.benefitsTitle': 'O que você vai receber',
    'auditPage.benefit1Title': 'Roteiro de automação personalizado',
    'auditPage.benefit1Body': '2–4 fluxos específicos para o seu negócio, com estimativa de horas poupadas.',
    'auditPage.benefit2Title': 'Preço fechado — sem surpresas',
    'auditPage.benefit2Body': 'Custos claros para cada automação para você planejar.',
    'auditPage.benefit3Title': 'Sem compromisso — nunca',
    'auditPage.benefit3Body': 'Use as ideias sozinho ou deixe a gente construir. Você decide.',
    'auditPage.testimonial': '"Achávamos que automação era só para empresas grandes com equipe de TI. A TechBuddy4Biz mostrou que é mais simples do que pensávamos — e agora economizamos mais de 10 horas por semana."',
    'auditPage.testimonialAuthor': '— Dono de pequeno negócio, Flórida Central'
  },

  es: {
    'nav.services': 'Qué automatizamos',
    'nav.playbooks': 'Playbooks',
    'nav.process': 'Cómo trabajamos',
    'nav.faq': 'Preguntas frecuentes',
    'nav.contact': 'Contacto',
    'nav.backHome': '← Volver al inicio',
    'nav.auditButton': 'Auditoría gratis',
    'nav.clientLogin': 'Acceso Cliente',

    'hero.badge': 'Pensado para negocios dirigidos por sus dueños · 3–50 personas',
    'hero.headingMain': 'Convierte el caos de llamadas, correos y mensajes en',
    'hero.headingHighlight': 'automatizaciones fiables y sencillas.',
    'hero.body': 'TechBuddy4Biz diseña y opera flujos listos entre teléfono, correo, redes sociales y hojas de cálculo, usando las herramientas que ya tienes. Nada de otra plataforma para que el equipo la cuide. Sin humo. Solo menos trabajo manual.',
    'hero.ctaPrimary': 'Pedir auditoría de automatización gratis',
    'hero.ctaSecondary': 'Ver qué automatizamos',
    'hero.stat1Label': 'Primeros resultados típicos',
    'hero.stat1Value': 'SMS de llamada perdida · triage de correo',
    'hero.stat2Label': 'Stack de herramientas',
    'hero.stat2Value': 'Google Workspace · n8n · OpenAI',
    'hero.stat3Label': 'Modelo de trabajo',
    'hero.stat3Value': 'Proyectos hechos a medida, alcance cerrado',
    'hero.sampleLabel': 'Ejemplo de flujo',
    'hero.sampleTitle': 'Llamada perdida → SMS → Lead en hoja',
    'hero.sampleStatus': 'Activo',
    'hero.sampleStep1Title': 'Llamada entrante',
    'hero.sampleStep1Body': 'Si queda perdida por más de 30 segundos',
    'hero.sampleStep1Tag': 'Disparador',
    'hero.sampleStep2Title': 'SMS de seguimiento',
    'hero.sampleStep2Body': '“Perdón, no pudimos atenderte – responde contándonos qué necesitas.”',
    'hero.sampleStep2Tag': '+ 30–50% recuperados',
    'hero.sampleStep3Title': 'Lead en la hoja',
    'hero.sampleStep3Body': 'Nombre · teléfono · origen · primer mensaje',
    'hero.sampleStep3Tag': 'Google Sheets',
    'hero.sampleMetric1Label': 'Horas del dueño ahorradas',
    'hero.sampleMetric1Value': '3–5 / semana',
    'hero.sampleMetric2Label': 'Tasa de recuperación',
    'hero.sampleMetric2Value': '+35%',
    'hero.sampleMetric3Label': 'Tiempo de implementación',
    'hero.sampleMetric3Value': '7–10 días',

    'services.title': 'Primeras automatizaciones típicas',
    'services.body': 'Empezamos con flujos de bajo riesgo y alto impacto que ordenan tu día sin obligar al equipo a aprender otro sistema.',
    'services.stack': 'Todo sobre Google Workspace, n8n y OpenAI, más el teléfono, CRM y redes que ya utilizas.',
    'services.callsTitle': 'Llamadas & SMS',
    'services.callsItem1': 'SMS automático para llamadas perdidas, capturando respuesta y recordatorios.',
    'services.callsItem2': 'IVR sencillos que enrutan llamadas o registran mensajes automáticamente.',
    'services.callsItem3': 'Resumen diario de nuevas llamadas y mensajes de voz en tu bandeja o hoja.',
    'services.emailTitle': 'Correo & DMs',
    'services.emailItem1': 'Respuestas automáticas para preguntas frecuentes (horario, precios base, zonas de servicio).',
    'services.emailItem2': 'Etiqueta y enruta mensajes de ventas, soporte y cobros.',
    'services.emailItem3': 'Leads de correo, formularios y DMs de IG en una sola lista central.',
    'services.reportsTitle': 'Reportes & visibilidad del dueño',
    'services.reportsItem1': 'Correo semanal para el dueño: leads, trabajos y canales principales.',
    'services.reportsItem2': 'Dashboards en Google Sheets que cualquiera del equipo puede leer.',
    'services.reportsItem3': 'Listas de seguimiento automáticas para que nada se pierda.',

    'playbooks.title': 'Playbooks iniciales',
    'playbooks.body': 'Modelos de automación que adaptamos a tu negocio, sin empezar desde cero.',
    'playbooks.card1Badge': 'Servicios',
    'playbooks.card1Title': 'Máquina de leads para servicios',
    'playbooks.card1Item1': 'Registra cada llamada, formulario y DM en una sola hoja.',
    'playbooks.card1Item2': 'SMS tras llamada perdida + secuencia de presupuesto.',
    'playbooks.card1Item3': 'Vista simple de hoy / esta semana / atrasados.',
    'playbooks.card2Badge': 'Profesionales locales',
    'playbooks.card2Title': 'De la bandeja al calendario',
    'playbooks.card2Item1': 'Preguntas de calificación automática para nuevos contactos.',
    'playbooks.card2Item2': 'Envía leads calificados a tu calendario o sistema de reservas.',
    'playbooks.card2Item3': 'Resumen diario para el dueño con nuevas reservas.',
    'playbooks.card3Badge': 'Agencias & estudios',
    'playbooks.card3Title': 'Línea de tiempo del cliente',
    'playbooks.card3Item1': 'Registra llamadas, correos y mensajes en un único historial.',
    'playbooks.card3Item2': 'Avisa cuando un cliente lleva muchos días sin contacto.',
    'playbooks.card3Item3': 'Genera notas simples de preparación antes de reuniones clave.',

    'process.title': 'Cómo trabajamos contigo',
    'process.body': 'Pasos claros y sin drama. Siempre sabes qué se está construyendo, por qué y cómo apagarlo.',
    'process.step1Label': 'Paso 1',
    'process.step1Title': 'Auditoría de automatización gratis',
    'process.step1Body': 'Llamada corta y revisión de cómo fluyen hoy tus llamadas, correos, DMs y hojas. Identificamos 2–4 automatizaciones de bajo riesgo.',
    'process.step2Label': 'Paso 2',
    'process.step2Title': 'Blueprint y precio cerrado',
    'process.step2Body': 'Recibes un diagrama simple y lista de cambios, con precio fijo por flujo. Sin sorpresas por horas extra.',
    'process.step3Label': 'Paso 3',
    'process.step3Title': 'Construir, probar, medir',
    'process.step3Body': 'Implementamos, probamos con tu equipo y te entregamos un resumen claro + una página para apagar o ajustar.',

    'faq.title': 'Preguntas que hacen los dueños',
    'faq.body': 'Respuestas directas, sin humo. Estás confiando en quien toca los sistemas claves del negocio; tienes que saber cómo funciona.',
    'faq.q1': '¿Tengo que cambiar mi sistema de telefonía, CRM o correo?',
    'faq.a1': 'Normalmente no. Preferimos trabajar sobre lo que ya usas (Google Workspace, telefonía VoIP existente, CRM, cuentas de Meta). Si alguna herramienta bloquea la automatización, explicamos opciones y costos antes de cambiar nada.',
    'faq.q2': '¿Cómo manejan la seguridad y los accesos?',
    'faq.a2': 'Usamos integraciones oficiales y revocables siempre que se pueda (Google, Meta, proveedores de VoIP). Tú mantienes el control y puedes quitar el acceso en cualquier momento. Nada de contraseñas por chat ni “TI en la sombra”.',
    'faq.q3': '¿Y si a mi equipo no le gustan los cambios?',
    'faq.a3': 'Diseñamos automatizaciones para quitar trabajo repetitivo sin empujar otra app al equipo. Menos actualizaciones manuales y recordatorios, no más sistemas que aprender.',
    'faq.q4': '¿Podemos empezar pequeño?',
    'faq.a4': 'Sí. La mayoría empieza con uno o dos flujos (por ejemplo, seguimiento de llamada perdida + registro de leads) y amplía cuando ve el impacto.',

    'contact.title': 'Contáctanos',
    'contact.body': '¿Quieres hablar de ideas de automatización o no sabes por dónde empezar? Escríbenos y te responderemos con algunas opciones ajustadas a tu negocio.',
    'contact.emailLabel': 'Correo:',
    'contact.instagramLabel': 'Instagram:',
    'contact.hintIntro': 'Si prefieres, envía un mensaje corto con:',
    'contact.hintItem1': 'Nombre del negocio y a qué te dedicas.',
    'contact.hintItem2': 'Cuántas personas trabajan en la empresa.',
    'contact.hintItem3': 'Dónde sientes que pierdes más tiempo cada semana.',
    'contact.hintOutro': 'Normalmente proponemos una llamada corta o te mandamos 1–2 ideas por correo primero, para que veas si tiene sentido.',

    'audit.title': 'Pide tu auditoría de automatización gratis',
    'audit.body': 'Cuéntanos cómo funciona hoy tu negocio. Revisamos llamadas, correos, DMs y hojas de cálculo y volvemos con 2–4 automatizaciones concretas, con estimación de horas ahorradas y precio cerrado de implementación.',
    'audit.bullet1': 'Sin compromiso: puedes implementar las ideas solo o con nosotros.',
    'audit.bullet2': 'Foco en ahorrar tiempo del dueño y reducir oportunidades perdidas.',
    'audit.bullet3': 'Trabajamos sobre tus herramientas actuales: Google Workspace, teléfono, CRM, redes.',
    'audit.fieldName': 'Tu nombre',
    'audit.fieldEmail': 'Correo de trabajo',
    'audit.fieldCompany': 'Nombre del negocio',
    'audit.fieldTeamSize': 'Tamaño del equipo',
    'audit.teamOption1': '1–3',
    'audit.teamOption2': '4–10',
    'audit.teamOption3': '11–25',
    'audit.teamOption4': '26–50',
    'audit.teamOption5': '50+',
    'audit.fieldPain': 'Mayor pérdida de tiempo ahora mismo',
    'audit.fieldSystems': '¿Qué herramientas usas hoy? (correo, teléfono, CRM, hojas…)',
    'audit.pain.placeholder': 'Selecciona el #1 que más te quita tiempo',
    'audit.pain.email_triage': 'Clasificar y responder correos',
    'audit.pain.messages': 'Leer y responder SMS/WhatsApp/DMs',
    'audit.pain.missed_calls': 'Llamadas perdidas / seguimiento de buzón de voz',
    'audit.pain.lead_followup': 'Captura y seguimiento de leads (nuevas consultas)',
    'audit.pain.scheduling': 'Agendar, reprogramar y recordatorios',
    'audit.pain.quoting': 'Cotizaciones / presupuestos / propuestas',
    'audit.pain.invoicing': 'Facturas, pagos y cobro de atrasos',
    'audit.pain.reporting': 'Crear reportes y tableros',
    'audit.pain.data_entry': 'Copiar/pegar datos entre herramientas',
    'audit.pain.customer_support': 'Soporte al cliente (FAQ / estado)',
    'audit.pain.reviews': 'Pedir reseñas y referidos',
    'audit.toolsHint': 'Selecciona todas las que apliquen.',
'audit.toolsGroup.email': 'Correo',
'audit.toolsGroup.messaging': 'Mensajería',
'audit.toolsGroup.crm': 'CRM',
'audit.toolsGroup.sheets': 'Hojas de cálculo',
'audit.toolsGroup.accounting': 'Contabilidad',
'audit.toolsGroup.scheduling': 'Agenda',
'audit.toolsGroup.phone': 'Teléfono',
'audit.toolsGroup.ecom': 'E‑commerce',
'audit.toolsGroup.ops': 'Operaciones',
    'audit.error.toolsRequired': "Selecciona al menos una herramienta que usas hoy.",
    'audit.tool.gmail': 'Gmail',
    'audit.tool.outlook': 'Outlook / Microsoft 365',
    'audit.tool.google_workspace': 'Google Workspace',
    'audit.tool.zoho_mail': 'Zoho Mail',
    'audit.tool.whatsapp_business': 'WhatsApp Business',
    'audit.tool.sms': 'SMS',
    'audit.tool.instagram_dm': 'DMs de Instagram',
    'audit.tool.facebook_messenger': 'Facebook Messenger',
    'audit.tool.hubspot': 'HubSpot',
    'audit.tool.salesforce': 'Salesforce',
    'audit.tool.pipedrive': 'Pipedrive',
    'audit.tool.zoho_crm': 'Zoho CRM',
    'audit.tool.google_sheets': 'Google Sheets',
    'audit.tool.excel': 'Excel',
    'audit.tool.quickbooks': 'QuickBooks',
    'audit.tool.xero': 'Xero',
    'audit.tool.google_calendar': 'Google Calendar',
    'audit.tool.calendly': 'Calendly',
    'audit.tool.google_voice': 'Google Voice',
    'audit.tool.ringcentral': 'RingCentral',
    'audit.tool.shopify': 'Shopify',
    'audit.tool.woocommerce': 'WooCommerce',
    'audit.tool.trello': 'Trello',
    'audit.tool.asana': 'Asana',
    'audit.fieldFollowUp': 'Cómo prefieres que te contactemos',
    'audit.followEmail': 'Correo',
    'audit.followPhone': 'Teléfono / WhatsApp',
    'audit.submit': 'Enviar solicitud de auditoría',
    'audit.disclaimer': 'Este formulario funciona con nuestro backend de automatización seguro. Solo usaremos tus datos para responder a tu solicitud.',

    'footer.rights': 'Todos los derechos reservados.',
    'footer.location': 'Con base en Florida Central · Trabajando en remoto con clientes en todo EE. UU.',

    // Hero new keys
    'hero.body2': 'TechBuddy4Biz ayuda a negocios como el tuyo a automatizar el caos — usando las herramientas que ya tienes. Sin equipo de TI. Sin apps confusas. Solo más tiempo para lo que importa.',
    'hero.check1': 'Sin jerga técnica',
    'hero.check2': 'Precio cerrado',
    'hero.check3': 'Hecho para ti',
    'hero.cardTitle': '¿Te suena familiar?',
    'hero.pain1': '"Paso la mitad del día respondiendo las mismas preguntas."',
    'hero.pain2': '"Sé que pierdo clientes cuando no contesto llamadas, pero no puedo estar en todos lados."',
    'hero.pain3': '"No tengo a nadie de TI y no sé por dónde empezar con automatización."',
    'hero.cardCta': 'Te entendemos. Por eso existimos.',
    'hero.metric1Value': '5-10',
    'hero.metric1Label': 'horas ahorradas por semana',
    'hero.metric2Value': '35%',
    'hero.metric2Label': 'más leads capturados',
    'hero.metric3Value': '7',
    'hero.metric3Label': 'días para funcionar',

    // Trust section
    'trust.title': 'Por qué los dueños de negocio confían en nosotros',
    'trust.subtitle': 'No necesitas saber de tecnología. Sin contratos largos. Solo resultados.',
    'trust.card1Title': 'Tú mantienes el control',
    'trust.card1Body': 'Todo lo que construimos usa tus cuentas existentes. Puedes apagar cualquier automatización al instante. Sin amarres.',
    'trust.card2Title': 'Te explicamos todo',
    'trust.card2Body': 'Sin lenguaje técnico. Te explicamos cada flujo en español claro y te damos una guía simple de "cómo ajustarlo".',
    'trust.card3Title': 'Precio cerrado y honesto',
    'trust.card3Body': 'Sabes el costo antes de empezar. Sin sorpresas por hora. Sin cargos ocultos. Si cuesta más, te avisamos primero.',
    'trust.testimonial': '"Estaba ahogado en mensajes y no sabía por dónde empezar. TechBuddy4Biz montó un sistema simple que me ahorra horas cada semana. Me explicaron todo de una forma que realmente entendí."',
    'trust.testimonialAuthor': '— Dueño de negocio de servicios, Florida Central',

    // Final CTA
    'cta.title': '¿Listo para dejar de pelear con la tecnología?',
    'cta.body': 'Pide tu auditoría de automatización gratis. Te mostramos exactamente dónde pierdes tiempo — y cómo recuperarlo. Sin compromiso, sin jerga técnica.',
    'cta.primary': 'Pedir mi auditoría gratis →',
    'cta.secondary': 'Contactar primero',
    'cta.disclaimer': 'Toma 5 minutos · Sin spam · Respuesta en 24 horas',

    // Audit page
    'auditPage.badge': '✓ Gratis · Sin compromiso · Toma 5 minutos',
    'auditPage.heroTitle': 'Pide Tu Auditoría de Automatización Gratis',
    'auditPage.heroBody': 'Cuéntanos sobre tu negocio. Te mostramos exactamente dónde pierdes tiempo — y cómo recuperarlo.',
    'auditPage.benefitsTitle': 'Lo que recibirás',
    'auditPage.benefit1Title': 'Hoja de ruta de automatización personalizada',
    'auditPage.benefit1Body': '2–4 flujos específicos para tu negocio, con estimación de horas ahorradas.',
    'auditPage.benefit2Title': 'Precio cerrado — sin sorpresas',
    'auditPage.benefit2Body': 'Costos claros para cada automatización para que puedas planificar.',
    'auditPage.benefit3Title': 'Sin compromiso — nunca',
    'auditPage.benefit3Body': 'Usa las ideas tú mismo o déjanos construirlas. Tú decides.',
    'auditPage.testimonial': '"Pensábamos que la automatización era solo para empresas grandes con equipo de TI. TechBuddy4Biz nos mostró que es más simple de lo que pensábamos — y ahora ahorramos más de 10 horas a la semana."',
    'auditPage.testimonialAuthor': '— Dueño de pequeño negocio, Florida Central'
  }
};

function detectBrowserLanguage() {
  const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (navLang.startsWith('pt')) return 'pt';
  if (navLang.startsWith('es')) return 'es';
  return 'en';
}

function applyLanguage(lang) {
  const dict = translations[lang] || translations.en;

  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = dict[key];
    if (typeof value === 'string') {
      el.textContent = value;
    }
  });

  const desktopSelect = document.getElementById('lang-select-desktop');
  const mobileSelect = document.getElementById('lang-select-mobile');
  if (desktopSelect) desktopSelect.value = lang;
  if (mobileSelect) mobileSelect.value = lang;
}

function setLanguage(lang) {
  const normalized = ['en', 'pt', 'es'].includes(lang) ? lang : 'en';
  localStorage.setItem('tb4b_lang', normalized);
  applyLanguage(normalized);
}

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  if (toggle && menu && iconOpen && iconClose) {
    toggle.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        menu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      } else {
        menu.classList.remove('hidden');
        iconOpen.classList.add('hidden');
        iconClose.classList.remove('hidden');
      }
    });
  }

  document.querySelectorAll('#mobile-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      }
    });
  });

  const desktopSelect = document.getElementById('lang-select-desktop');
  const mobileSelect = document.getElementById('lang-select-mobile');

  if (desktopSelect) {
    desktopSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
  if (mobileSelect) {
    mobileSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  const storedLang = localStorage.getItem('tb4b_lang');
  const initialLang = storedLang || detectBrowserLanguage();
  applyLanguage(initialLang);
});

// Website audit form → n8n webhook
const N8N_WEBHOOK_URL = "https://techbuddy4biz.app.n8n.cloud/webhook/3ddc8c8b-3475-4a2b-adb9-4d2b8b003c38/form/debug";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector('form[name="automation-audit"]');
  if (!form) return;

  let status = form.querySelector('[data-audit-status]');
  if (!status) {
    status = document.createElement('p');
    status.dataset.auditStatus = 'true';
    status.className = 'mt-2 text-[11px] text-slate-400';
    form.appendChild(status);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    status.textContent = 'Sending...';
    status.classList.remove('text-emerald-400', 'text-red-400');
    status.classList.add('text-slate-400');

    const formData = new FormData(form);
    const payload = {};

    for (const [key, value] of formData.entries()) {
      if (key === 'follow_up' || key === 'systems') {
        if (!payload[key]) {
          payload[key] = value;
        } else {
          payload[key] += ', ' + value;
        }
      } else if (payload[key] === undefined) {
        payload[key] = value;
      } else {
        // handle any other multi-value fields if added later
        if (Array.isArray(payload[key])) {
          payload[key].push(value);
        } else {
          payload[key] = [payload[key], value];
        }
      }
    }


// Validate: at least one "systems" checkbox selected
const systemsChecked = form.querySelectorAll('input[name="systems"]:checked').length;
if (!systemsChecked) {
  status.textContent = 'Please select at least one tool you use today.';
  status.classList.remove('text-slate-400', 'text-emerald-400');
  status.classList.add('text-red-400');
  return;
}

    payload.lang = document.documentElement.lang || 'en';

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Bad status ' + res.status);

      status.textContent = 'Thanks – we got your request.';
      status.classList.remove('text-slate-400');
      status.classList.add('text-emerald-400');
      form.reset();
    } catch (error) {
      console.error(error);
      status.textContent = 'There was a problem. Please email admin@techbuddy4biz.com.';
      status.classList.remove('text-slate-400');
      status.classList.add('text-red-400');
    }
  });
});
