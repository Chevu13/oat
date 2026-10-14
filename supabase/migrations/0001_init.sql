-- OAT BOMB — schema, security and order placement.
-- Security model: the browser only ever holds the anon key.
--   * catalog: public read of active products (RLS)
--   * orders: written ONLY through place_order() (security definer) which prices + stock-checks server-side
--   * admin: authenticated users listed in public.admins get full access via is_admin()

create extension if not exists pgcrypto;

create type public.order_status as enum ('nova', 'u_obradi', 'poslata', 'isporucena', 'otkazana');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 1 and 80),
  description text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 1 and 120),
  tagline text,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  images text[] not null default '{}',
  accent text not null default '#121110' check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  ingredients text,
  allergens text,
  weight text,
  missing_info text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products (category_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  price int not null check (price >= 0),
  sale_price int check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  stock int not null default 0 check (stock >= 0),
  sort int not null default 0
);
create index on public.product_variants (product_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  status public.order_status not null default 'nova',
  customer_name text not null,
  email text not null,
  phone text not null,
  street text not null,
  city text not null,
  postal_code text not null,
  note text,
  payment_method text not null default 'pouzece' check (payment_method = 'pouzece'),
  subtotal int not null,
  shipping int not null,
  total int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.orders (created_at desc);
create index on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null,
  unit_price int not null,
  quantity int not null check (quantity between 1 and 99),
  line_total int not null
);
create index on public.order_items (order_id);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- updated_at
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- ---------- Row Level Security ----------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admins enable row level security;

create policy "categories: public read" on public.categories for select using (true);
create policy "categories: admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products: public read active" on public.products for select using (is_active or public.is_admin());
create policy "products: admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "variants: public read" on public.product_variants for select using (
  public.is_admin() or exists (select 1 from public.products p where p.id = product_id and p.is_active)
);
create policy "variants: admin write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- No insert policy for anon: orders can only be created through place_order().
create policy "orders: admin all" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "order_items: admin all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "admins: read own row" on public.admins for select using (user_id = auth.uid());

-- ---------- Order placement ----------
-- Delivery pricing PLACEHOLDER — keep in sync with src/lib/config.ts (DELIVERY_FEE, FREE_DELIVERY_FROM).
create function public.place_order(payload jsonb) returns table (id uuid, number text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_order_id uuid := gen_random_uuid();
  v_number text;
  v_subtotal int := 0;
  v_shipping int;
  r record;
begin
  if coalesce(char_length(trim(payload->>'customer_name')), 0) not between 2 and 120
     or coalesce(payload->>'email', '') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or coalesce(char_length(regexp_replace(payload->>'phone', '\D', '', 'g')), 0) not between 8 and 15
     or coalesce(char_length(trim(payload->>'street')), 0) not between 3 and 200
     or coalesce(char_length(trim(payload->>'city')), 0) not between 2 and 80
     or coalesce(payload->>'postal_code', '') !~ '^\d{5}$'
     or char_length(coalesce(payload->>'note', '')) > 1000
     or payload->>'payment_method' is distinct from 'pouzece'
  then
    raise exception 'INVALID: Podaci za dostavu nisu ispravni.';
  end if;

  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') not between 1 and 50 then
    raise exception 'INVALID: Korpa je prazna.';
  end if;

  create temp table _lines on commit drop as
    select (i->>'variant_id')::uuid as variant_id, sum((i->>'quantity')::int)::int as quantity
    from jsonb_array_elements(payload->'items') i
    group by 1;

  if exists (select 1 from _lines where quantity < 1 or quantity > 99) then
    raise exception 'INVALID: Neispravna količina.';
  end if;

  if (select count(*) from _lines l
        join public.product_variants v on v.id = l.variant_id
        join public.products p on p.id = v.product_id and p.is_active) <> (select count(*) from _lines) then
    raise exception 'UNAVAILABLE: Jedan od proizvoda iz korpe više nije dostupan.';
  end if;

  -- Lock variants so concurrent orders can't oversell.
  for r in
    select l.variant_id, l.quantity, v.stock, v.name as variant_name, coalesce(v.sale_price, v.price) as unit_price,
           p.name as product_name
    from _lines l
    join public.product_variants v on v.id = l.variant_id
    join public.products p on p.id = v.product_id
    order by l.variant_id
    for update of v
  loop
    if r.stock < r.quantity then
      raise exception 'UNAVAILABLE: %', case when r.stock = 0 then r.product_name || ' je trenutno rasprodat.'
        else r.product_name || ': na stanju je još samo ' || r.stock || ' kom.' end;
    end if;
    v_subtotal := v_subtotal + r.unit_price * r.quantity;
  end loop;

  v_shipping := case when v_subtotal >= 3000 then 0 else 290 end;

  loop
    v_number := 'OB-' || to_char(now() at time zone 'Europe/Belgrade', 'YYMMDD') || '-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 5));
    exit when not exists (select 1 from public.orders o where o.number = v_number);
  end loop;

  insert into public.orders (id, number, customer_name, email, phone, street, city, postal_code, note, payment_method, subtotal, shipping, total)
  values (v_order_id, v_number, trim(payload->>'customer_name'), lower(trim(payload->>'email')), trim(payload->>'phone'),
          trim(payload->>'street'), trim(payload->>'city'), payload->>'postal_code', nullif(trim(payload->>'note'), ''),
          'pouzece', v_subtotal, v_shipping, v_subtotal + v_shipping);

  insert into public.order_items (order_id, product_id, variant_id, product_name, variant_name, unit_price, quantity, line_total)
  select v_order_id, p.id, v.id, p.name, v.name, coalesce(v.sale_price, v.price), l.quantity, coalesce(v.sale_price, v.price) * l.quantity
  from _lines l join public.product_variants v on v.id = l.variant_id join public.products p on p.id = v.product_id;

  update public.product_variants v set stock = v.stock - l.quantity from _lines l where v.id = l.variant_id;

  return query select v_order_id, v_number;
end $$;

-- Order confirmation page: lookup by unguessable order uuid.
create function public.get_order_public(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(o) || jsonb_build_object('items', coalesce((
    select jsonb_agg(to_jsonb(i) order by i.product_name) from public.order_items i where i.order_id = o.id
  ), '[]'::jsonb))
  from public.orders o where o.id = p_id
$$;

-- Storefront "Najprodavanije": exposes only product ids, never order data.
create function public.bestseller_ids(p_limit int default 4) returns setof uuid
language sql stable security definer set search_path = public as $$
  select i.product_id from public.order_items i join public.orders o on o.id = i.order_id
  where o.status <> 'otkazana' and i.product_id is not null
  group by i.product_id order by sum(i.quantity) desc limit least(p_limit, 24)
$$;

revoke all on function public.place_order(jsonb) from public;
revoke all on function public.get_order_public(uuid) from public;
revoke all on function public.bestseller_ids(int) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.get_order_public(uuid) to anon, authenticated;
grant execute on function public.bestseller_ids(int) to anon, authenticated;

-- ---------- Storage: product images ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "product images: admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product images: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
