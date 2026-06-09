import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// GET /api/report-images?appointment_id=X
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const appointment_id = searchParams.get('appointment_id');
  if (!appointment_id) return NextResponse.json({ error: 'appointment_id requerido.' }, { status: 400 });

  const { data, error } = await sb()
    .from('report_images')
    .select('*')
    .eq('appointment_id', appointment_id)
    .order('uploaded_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

// POST /api/report-images  (multipart form-data)
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const appointment_id = formData.get('appointment_id');
    const caption = formData.get('caption') || '';

    if (!file || !appointment_id) {
      return NextResponse.json({ error: 'file y appointment_id son requeridos.' }, { status: 400 });
    }

    const client = sb();
    const ext = file.name.split('.').pop();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `report-images/${appointment_id}/${safeName}`;

    // Subir a Supabase Storage (bucket: report-images)
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await client.storage
      .from('report-images')
      .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    // URL pública
    const { data: urlData } = client.storage.from('report-images').getPublicUrl(storagePath);
    const public_url = urlData?.publicUrl || '';

    // Guardar referencia en BD
    const { data, error } = await client
      .from('report_images')
      .insert([{ appointment_id: parseInt(appointment_id), file_name: file.name, storage_path: storagePath, public_url, caption }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/report-images?id=X&storage_path=...
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const storage_path = searchParams.get('storage_path');

  if (!id) return NextResponse.json({ error: 'id requerido.' }, { status: 400 });

  const client = sb();

  // Eliminar del storage si tenemos el path
  if (storage_path) {
    await client.storage.from('report-images').remove([storage_path]);
  }

  const { error } = await client.from('report_images').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
