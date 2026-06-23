alter table public.short_links
  add column if not exists description text,
  add column if not exists image_url text check (image_url is null or char_length(image_url) <= 2048),
  add column if not exists screenshot_url text check (screenshot_url is null or char_length(screenshot_url) <= 2048),
  add column if not exists favicon_url text check (favicon_url is null or char_length(favicon_url) <= 2048);

