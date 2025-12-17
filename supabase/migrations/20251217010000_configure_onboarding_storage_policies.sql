-- Storage bucket/policies for Knowledge attachments (restricted bucket)
-- Bucket: onboarding (private)
--
-- Path convention used by the frontend:
--   knowledge/{auth.uid()}/{uuid}-{filename}

DO $$
BEGIN
  -- Create bucket if missing (schema differences exist across Supabase versions)
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'onboarding') THEN
    BEGIN
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('onboarding', 'onboarding', false);
    EXCEPTION
      WHEN undefined_column THEN
        INSERT INTO storage.buckets (id, public)
        VALUES ('onboarding', false);
    END;
  END IF;
END $$;

-- RLS policies on storage.objects
-- Allow any authenticated user to read objects in this internal bucket.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Onboarding knowledge: authenticated read'
  ) THEN
    CREATE POLICY "Onboarding knowledge: authenticated read"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'onboarding');
  END IF;
END $$;

-- Allow authenticated users to upload only into their own namespace.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Onboarding knowledge: authenticated upload own'
  ) THEN
    CREATE POLICY "Onboarding knowledge: authenticated upload own"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'onboarding'
        AND name LIKE ('knowledge/' || auth.uid() || '/%')
      );
  END IF;
END $$;

-- Allow authenticated users to update/delete only their own uploads.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Onboarding knowledge: authenticated update own'
  ) THEN
    CREATE POLICY "Onboarding knowledge: authenticated update own"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'onboarding'
        AND name LIKE ('knowledge/' || auth.uid() || '/%')
      )
      WITH CHECK (
        bucket_id = 'onboarding'
        AND name LIKE ('knowledge/' || auth.uid() || '/%')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Onboarding knowledge: authenticated delete own'
  ) THEN
    CREATE POLICY "Onboarding knowledge: authenticated delete own"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'onboarding'
        AND name LIKE ('knowledge/' || auth.uid() || '/%')
      );
  END IF;
END $$;

