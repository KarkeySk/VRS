-- ============================================================
-- 011: Payment tracking & notification system
-- Adds payment fields to booking_applications
-- Creates notifications table for in-app alerts
-- ============================================================

-- Payment tracking on booking applications
ALTER TABLE public.booking_applications
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS payment_method text
    CHECK (payment_method IN ('esewa', 'cash') OR payment_method IS NULL),
  ADD COLUMN IF NOT EXISTS esewa_transaction_uuid text UNIQUE,
  ADD COLUMN IF NOT EXISTS esewa_ref_id text;

-- Index for payment status queries
CREATE INDEX IF NOT EXISTS idx_applications_payment_status
  ON public.booking_applications(payment_status);

-- Unique index to prevent transaction reuse
CREATE INDEX IF NOT EXISTS idx_applications_esewa_txn
  ON public.booking_applications(esewa_transaction_uuid)
  WHERE esewa_transaction_uuid IS NOT NULL;

-- ============================================================
-- Notifications table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN (
    'booking_approved', 'booking_rejected', 'payment_success', 'payment_failed', 'general'
  )),
  title         text NOT NULL,
  message       text NOT NULL,
  application_id uuid REFERENCES public.booking_applications(id) ON DELETE SET NULL,
  is_read       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read)
  WHERE is_read = false;

-- ============================================================
-- RLS policies for notifications
-- ============================================================

-- Users can read their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Any authenticated user can insert notifications
-- (needed for admin creating notifications for users)
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (public.is_admin());

-- ============================================================
-- Enable Realtime for notifications table
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
