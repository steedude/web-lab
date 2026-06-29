-- Update-only migration for image link creation consistency.
-- Run this on an existing Supabase project that already has short_links,
-- image_links, and pgcrypto configured by supabase/setup.sql.

create or replace function public.create_image_short_link(
  image_description text,
  image_expires_at timestamptz,
  image_image_url text,
  image_password text,
  image_slug text,
  image_title text,
  short_description text,
  short_expires_at timestamptz,
  short_favicon_url text,
  short_image_url text,
  short_password text,
  short_screenshot_url text,
  short_slug text,
  short_target_url text,
  short_title text
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
  insert into public.image_links (
    description,
    expires_at,
    image_url,
    password_hash,
    slug,
    title
  )
  values (
    create_image_short_link.image_description,
    create_image_short_link.image_expires_at,
    create_image_short_link.image_image_url,
    case
      when nullif(create_image_short_link.image_password, '') is null then null
      else extensions.crypt(create_image_short_link.image_password, extensions.gen_salt('bf'))
    end,
    lower(create_image_short_link.image_slug),
    create_image_short_link.image_title
  );

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
    create_image_short_link.short_description,
    create_image_short_link.short_expires_at,
    create_image_short_link.short_favicon_url,
    create_image_short_link.short_image_url,
    case
      when nullif(create_image_short_link.short_password, '') is null then null
      else extensions.crypt(create_image_short_link.short_password, extensions.gen_salt('bf'))
    end,
    create_image_short_link.short_screenshot_url,
    lower(create_image_short_link.short_slug),
    create_image_short_link.short_target_url,
    create_image_short_link.short_title
  );

  return query
  select
    create_image_short_link.short_description,
    create_image_short_link.short_expires_at,
    create_image_short_link.short_favicon_url,
    create_image_short_link.short_image_url,
    null::text as password,
    create_image_short_link.short_screenshot_url,
    lower(create_image_short_link.short_slug),
    create_image_short_link.short_target_url,
    create_image_short_link.short_title;
end;
$$;

revoke all on function public.create_image_short_link(text, timestamptz, text, text, text, text, text, timestamptz, text, text, text, text, text, text, text) from public;
grant execute on function public.create_image_short_link(text, timestamptz, text, text, text, text, text, timestamptz, text, text, text, text, text, text, text) to anon, authenticated;
