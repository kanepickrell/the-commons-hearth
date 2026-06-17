// src/components/admin/MonthPhotoPanel.tsx
// Admin panel for /mayordomo. Upload + manage the photo carousel that shows
// under each month on the Year Wheel (Witness page).
//
// Images live in the public 'month-photos' Storage bucket; each public.month_photos
// row carries the object path, caption, and sort order. Month is 0-indexed
// (0 = January) to match the wheel — the carousel reads `.eq('month', m)` directly.

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { toast } from '@/hooks/use-toast';

const BUCKET = 'month-photos';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type MonthPhoto = {
  id: string;
  year: number;
  month: number;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

const publicUrl = (path: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export const MonthPhotoPanel = () => {
  const { locale } = useLocale();
  const monthNames = locale === 'es' ? uiStrings.months.es : uiStrings.months.en;

  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth());
  const [photos, setPhotos] = useState<MonthPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('month_photos')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('sort_order', { ascending: true });
    if (error) {
      toast({ title: 'Failed to load photos', description: error.message });
      setPhotos([]);
    } else {
      setPhotos((data ?? []) as MonthPhoto[]);
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async () => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: locale === 'es' ? 'Elige un archivo de imagen' : 'Pick an image file' });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: locale === 'es' ? 'La imagen supera 5 MB' : 'Image exceeds 5 MB' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${year}/${month}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;

      const nextSort = photos.length ? Math.max(...photos.map((p) => p.sort_order)) + 1 : 0;

      const { error: insErr } = await supabase.from('month_photos').insert({
        year,
        month,
        storage_path: path,
        caption: caption.trim() || null,
        sort_order: nextSort,
      });
      if (insErr) {
        // Don't leave an orphaned object if the row insert is rejected.
        await supabase.storage.from(BUCKET).remove([path]);
        throw insErr;
      }

      toast({ title: locale === 'es' ? 'Foto subida' : 'Photo uploaded' });
      setFile(null);
      setCaption('');
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: locale === 'es' ? 'No se pudo subir' : 'Upload failed',
        description: msg,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (p: MonthPhoto) => {
    const { error } = await supabase.from('month_photos').delete().eq('id', p.id);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message });
      return;
    }
    // Best-effort object cleanup; the row is already gone so it won't render.
    await supabase.storage.from(BUCKET).remove([p.storage_path]);
    toast({ title: locale === 'es' ? 'Foto eliminada' : 'Photo removed' });
    await load();
  };

  const handleSaveMeta = async (id: string, nextCaption: string, nextSort: number) => {
    const { error } = await supabase
      .from('month_photos')
      .update({ caption: nextCaption.trim() || null, sort_order: nextSort })
      .eq('id', id);
    if (error) {
      toast({ title: 'Failed to save', description: error.message });
      return;
    }
    toast({ title: locale === 'es' ? 'Guardado' : 'Saved' });
    await load();
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-mesquite">
          {locale === 'es' ? 'Fotos del mes' : 'Month photos'}
        </h2>
        <p className="mt-2 font-serif text-sm italic text-piedra">
          {locale === 'es'
            ? 'Sube fotos para el carrusel que aparece bajo cada mes en la rueda del año.'
            : 'Upload photos for the carousel that appears under each month on the Year Wheel.'}
        </p>
      </div>

      {/* Year + month picker */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="display-caps mb-2 block text-[10px] tracking-[0.2em] text-mesquite/50">
            {locale === 'es' ? 'AÑO' : 'YEAR'}
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || now.getFullYear())}
            className="w-28 rounded-sm border border-mesquite/20 bg-cal px-3 py-1.5 font-mono text-sm text-mesquite focus:border-mesquite focus:outline-none"
          />
        </div>
        <div>
          <label className="display-caps mb-2 block text-[10px] tracking-[0.2em] text-mesquite/50">
            {locale === 'es' ? 'MES' : 'MONTH'}
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="rounded-sm border border-mesquite/20 bg-cal px-3 py-1.5 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload form */}
      <div className="rounded-sm border border-mesquite/15 bg-cal/40 p-4">
        <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-ocre">
          {locale === 'es' ? 'SUBIR FOTO' : 'UPLOAD A PHOTO'}
        </p>
        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="font-serif text-sm text-mesquite file:mr-3 file:rounded-sm file:border file:border-mesquite/20 file:bg-cal file:px-3 file:py-1.5 file:font-heading file:text-sm file:text-mesquite hover:file:border-mesquite/40"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={locale === 'es' ? 'Pie de foto (opcional)' : 'Caption (optional)'}
            className="w-full rounded-sm border border-mesquite/20 bg-cal px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
          />
          <div>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="inline-flex items-center gap-2 rounded-sm bg-ocre px-5 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading
                ? locale === 'es'
                  ? 'Subiendo…'
                  : 'Uploading…'
                : locale === 'es'
                ? 'Subir'
                : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Existing photos for this month */}
      <div>
        <p className="display-caps mb-3 text-[10px] tracking-[0.2em] text-mesquite/50">
          {(locale === 'es' ? 'EN' : 'IN')} {monthNames[month].toUpperCase()} {year}
        </p>
        {loading ? (
          <p className="font-serif italic text-piedra">…</p>
        ) : photos.length === 0 ? (
          <p className="font-serif italic text-piedra">
            {locale === 'es' ? 'Todavía no hay fotos para este mes.' : 'No photos for this month yet.'}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {photos.map((p) => (
              <PhotoCard
                key={p.id}
                photo={p}
                onDelete={() => handleDelete(p)}
                onSave={(cap, sort) => handleSaveMeta(p.id, cap, sort)}
                locale={locale}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// PhotoCard — thumbnail + inline caption/sort edit + delete
// ---------------------------------------------------------------------------
function PhotoCard({
  photo,
  onDelete,
  onSave,
  locale,
}: {
  photo: MonthPhoto;
  onDelete: () => void;
  onSave: (caption: string, sortOrder: number) => void;
  locale: 'en' | 'es';
}) {
  const [caption, setCaption] = useState(photo.caption ?? '');
  const [sortOrder, setSortOrder] = useState<number>(photo.sort_order);

  const dirty = caption !== (photo.caption ?? '') || sortOrder !== photo.sort_order;

  return (
    <li className="overflow-hidden rounded-sm border border-mesquite/20 bg-cal/60">
      <img
        src={publicUrl(photo.storage_path)}
        alt={photo.caption ?? ''}
        className="aspect-[4/3] w-full object-cover"
        loading="lazy"
      />
      <div className="space-y-2 p-3">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={locale === 'es' ? 'Pie de foto' : 'Caption'}
          className="w-full rounded-sm border border-mesquite/20 bg-cal px-2 py-1 font-serif text-sm text-mesquite focus:border-mesquite focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 font-serif text-xs text-piedra">
            {locale === 'es' ? 'Orden' : 'Order'}
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="w-16 rounded-sm border border-mesquite/20 bg-cal px-2 py-1 font-mono text-xs text-mesquite focus:border-mesquite focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSave(caption, sortOrder)}
              disabled={!dirty}
              className="font-serif text-xs text-ocre transition hover:underline disabled:opacity-40"
            >
              {locale === 'es' ? 'guardar' : 'save'}
            </button>
            <button
              onClick={onDelete}
              className="font-serif text-xs text-mesquite/60 transition hover:text-rojo"
            >
              {locale === 'es' ? 'eliminar' : 'delete'}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}