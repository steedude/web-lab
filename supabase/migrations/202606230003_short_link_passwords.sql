create extension if not exists pgcrypto with schema extensions;

alter table public.short_links
  add column if not exists password_hash text;

drop function if exists public.resolve_short_link(text);

create or replace function public.create_short_link(
  link_description text,
  link_expires_at timestamptz,
  link_favicon_url text,
  link_image_url text,
  link_password text,
  link_screenshot_url text,
  link_slug text,
  link_target_url text,
  link_title text
)
returns table (
  description text,
  expires_at timestamptz,
  favicon_url text,
  image_url text,
  password text,
  screenshot_url text,
  slug text,
  target_url text,
  title text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.short_links (
    description,
    expires_at,
    favicon_url,
    image_url,
    password_hash,
    screenshot_url,
    slug,
    target_url,
    title
  )
  values (
    create_short_link.link_description,
    create_short_link.link_expires_at,
    create_short_link.link_favicon_url,
    create_short_link.link_image_url,
    case
      when nullif(create_short_link.link_password, '') is null then null
      else extensions.crypt(create_short_link.link_password, extensions.gen_salt('bf'))
    end,
    create_short_link.link_screenshot_url,
    lower(create_short_link.link_slug),
    create_short_link.link_target_url,
    create_short_link.link_title
  );

  return query
  select
    create_short_link.link_description,
    create_short_link.link_expires_at,
    create_short_link.link_favicon_url,
    create_short_link.link_image_url,
    null::text as password,
    create_short_link.link_screenshot_url,
    lower(create_short_link.link_slug),
    create_short_link.link_target_url,
    create_short_link.link_title;
end;
$$;

create or replace function public.resolve_short_link(requested_slug text, password_attempt text default null)
returns table (
  password_required boolean,
  status text,
  target_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_link public.short_links%rowtype;
begin
  select *
  into matched_link
  from public.short_links
  where slug = lower(requested_slug);

  if matched_link.id is null then
    return query select false, 'not_found'::text, null::text;
    return;
  end if;

  if matched_link.expires_at is not null and matched_link.expires_at <= now() then
    return query select false, 'expired'::text, null::text;
    return;
  end if;

  if matched_link.password_hash is not null
    and (password_attempt is null or matched_link.password_hash <> extensions.crypt(password_attempt, matched_link.password_hash)) then
    return query select true, 'password_required'::text, null::text;
    return;
  end if;

  update public.short_links
  set clicks = clicks + 1
  where id = matched_link.id;

  return query select matched_link.password_hash is not null, 'resolved'::text, matched_link.target_url;
end;
$$;

revoke all on function public.create_short_link(text, timestamptz, text, text, text, text, text, text, text) from public;
grant execute on function public.create_short_link(text, timestamptz, text, text, text, text, text, text, text) to anon, authenticated;

revoke all on function public.resolve_short_link(text, text) from public;
grant execute on function public.resolve_short_link(text, text) to anon, authenticated;
