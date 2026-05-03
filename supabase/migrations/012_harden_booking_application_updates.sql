-- ============================================================
-- 012: Harden booking application update permissions
-- Users should only be able to cancel their own applications
-- before approval/review completion. Payment/admin fields must
-- only be mutable by admins or trusted server-side code.
-- ============================================================

drop policy if exists "Users can update own applications" on public.booking_applications;

create policy "Users can cancel own pending applications"
    on public.booking_applications for update to authenticated
    using (
        auth.uid() = user_id
        and status in ('submitted', 'under-review')
        and payment_status = 'pending'
    )
    with check (
        auth.uid() = user_id
        and status = 'cancelled'
        and payment_status = 'pending'
        and payment_method is null
        and esewa_transaction_uuid is null
        and esewa_ref_id is null
        and admin_notes is null
    );
