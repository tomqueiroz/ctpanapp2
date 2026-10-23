import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TABLES = [
  'profiles',
  'user_roles',
  'user_extended_profile',
  'alumni_whitelist',
  'payments',
  'user_progress',
  'exam_attempts',
  'user_exam_scores',
  'certificates',
  'admin_messages',
  'lms_admin_audit_log',
];
const BUCKET = 'lms-backups';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = req.headers.get('Authorization');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server not configured' }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const serviceRoleAuthorized =
      authorization?.replace(/^Bearer\s+/i, '') === serviceRoleKey;
    let cronAuthorized = false;
    const cronSecret = req.headers.get('X-CTP-Cron-Secret');
    if (cronSecret) {
      const { data, error } = await admin.rpc(
        'validate_daily_backup_cron_secret',
        { p_secret: cronSecret },
      );
      if (error) throw new Error(`Cron authorization: ${error.message}`);
      cronAuthorized = Boolean(data);
    }
    if (!serviceRoleAuthorized && !cronAuthorized) {
      return json({ error: 'Unauthorized' }, 401);
    }

    await admin.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 25 * 1024 * 1024,
    }).catch(() => undefined);

    const exportedAt = new Date();
    const snapshot: Record<string, unknown> = {
      format: 'ctp-anapp-logical-backup-v1',
      exported_at: exportedAt.toISOString(),
      project: 'ctp-anapp-lms',
      tables: {},
    };
    const counts: Record<string, number> = {};

    for (const table of TABLES) {
      const rows: unknown[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await admin
          .from(table)
          .select('*')
          .range(from, from + 999);
        if (error) throw new Error(`${table}: ${error.message}`);
        rows.push(...(data ?? []));
        if (!data || data.length < 1000) break;
      }
      (snapshot.tables as Record<string, unknown>)[table] = rows;
      counts[table] = rows.length;
    }

    const date = exportedAt.toISOString().slice(0, 10);
    const objectPath = `${date}/ctp-anapp-${exportedAt.toISOString().replaceAll(':', '-')}.json`;
    const payload = new Blob([JSON.stringify(snapshot)], { type: 'application/json' });
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(objectPath, payload, { contentType: 'application/json', upsert: false });
    if (uploadError) throw new Error(`Upload: ${uploadError.message}`);

    const cutoff = new Date(exportedAt.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { data: folders } = await admin.storage.from(BUCKET).list('', { limit: 1000 });
    for (const folder of folders ?? []) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(folder.name) && new Date(folder.name) < cutoff) {
        const { data: files } = await admin.storage.from(BUCKET).list(folder.name, { limit: 1000 });
        const paths = (files ?? []).map((file) => `${folder.name}/${file.name}`);
        if (paths.length) await admin.storage.from(BUCKET).remove(paths);
      }
    }

    const { data: backupId } = await admin.rpc('record_backup', {
      p_backup_name: objectPath,
      p_backup_type: 'scheduled_logical',
      p_triggered_by: cronAuthorized ? 'daily_cron' : 'service_role_manual',
    });

    return json({
      success: true,
      backup_id: backupId,
      object_path: objectPath,
      row_counts: counts,
      retention_days: 30,
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Backup failed' },
      500,
    );
  }
});
