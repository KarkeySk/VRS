-- ============================================================
-- 003: Admin UI image assets
-- ============================================================

insert into public.ui_assets (asset_key, image_url)
values
    ('admin_hero_banner', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'),
    ('admin_operations_forecast', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop'),
    ('admin_operations_grid', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&h=160&fit=crop'),
    ('admin_booking_fallback', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=140&fit=crop')
on conflict (asset_key) do update
set image_url = excluded.image_url;
