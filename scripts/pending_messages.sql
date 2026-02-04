create table public.pending_messages (
  pending_message_id uuid not null default gen_random_uuid (),
  client_id uuid not null,
  lead_id uuid null,
  conversation_id uuid null,
  channel character varying(50) not null,
  recipient_identifier text not null,
  message_type character varying(50) not null default 'reply'::character varying,
  subject text null,
  body_text text not null,
  body_html text null,
  ai_model character varying(100) null,
  ai_prompt_used text null,
  ai_confidence numeric(3, 2) null,
  generation_metadata jsonb null default '{}'::jsonb,
  in_reply_to_message_id uuid null,
  conversation_context jsonb null,
  approval_status public.message_approval_status null default 'pending'::message_approval_status,
  approval_mode character varying(20) not null,
  approval_token uuid null default gen_random_uuid (),
  approval_token_expires_at timestamp with time zone null,
  approval_email_sent_at timestamp with time zone null,
  approved_by character varying(255) null,
  approved_at timestamp with time zone null,
  rejected_by character varying(255) null,
  rejected_at timestamp with time zone null,
  rejection_reason text null,
  edited_body_text text null,
  edited_body_html text null,
  edited_by character varying(255) null,
  edited_at timestamp with time zone null,
  sent_at timestamp with time zone null,
  external_message_id text null,
  send_error text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  expires_at timestamp with time zone null,
  constraint pending_messages_pkey primary key (pending_message_id),
  constraint pending_messages_client_id_fkey foreign KEY (client_id) references clients (client_id) on delete CASCADE,
  constraint pending_messages_conversation_id_fkey foreign KEY (conversation_id) references conversations (conversation_id) on delete set null,
  constraint pending_messages_lead_id_fkey foreign KEY (lead_id) references leads (lead_id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_pending_messages_client_status on public.pending_messages using btree (client_id, approval_status) TABLESPACE pg_default;

create index IF not exists idx_pending_messages_token on public.pending_messages using btree (approval_token) TABLESPACE pg_default
where
  (
    approval_status = 'pending'::message_approval_status
  );

create index IF not exists idx_pending_messages_expires on public.pending_messages using btree (expires_at) TABLESPACE pg_default
where
  (
    approval_status = 'pending'::message_approval_status
  );

create index IF not exists idx_pending_messages_channel on public.pending_messages using btree (client_id, channel, approval_status) TABLESPACE pg_default;

create index IF not exists idx_pending_messages_created on public.pending_messages using btree (client_id, created_at desc) TABLESPACE pg_default;

create trigger pending_messages_updated_at BEFORE
update on pending_messages for EACH row
execute FUNCTION update_pending_messages_updated_at ();