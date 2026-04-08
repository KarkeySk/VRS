import { supabase } from '../lib/supabase'

let hasWarnedMissingUiAssetsTable = false

function isMissingUiAssetsTableError(error) {
  if (!error) return false
  const code = String(error.code || '')
  const message = String(error.message || '').toLowerCase()
  return (
    code === 'PGRST205' ||
    message.includes("public.ui_assets") ||
    message.includes("relation \"ui_assets\" does not exist") ||
    message.includes('schema cache')
  )
}

function warnMissingUiAssetsTable() {
  if (hasWarnedMissingUiAssetsTable) return
  hasWarnedMissingUiAssetsTable = true
  console.warn(
    "Table 'public.ui_assets' is missing. Run supabase/migrations/008_create_ui_assets.sql and supabase/seed/003_admin_ui_assets.sql."
  )
}

export const uiAssetService = {
  getByKey: async (assetKey) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { data, error } = await supabase
      .from('ui_assets')
      .select('asset_key, image_url')
      .eq('asset_key', assetKey)
      .maybeSingle()
    if (error) {
      if (isMissingUiAssetsTableError(error)) {
        warnMissingUiAssetsTable()
        return null
      }
      throw error
    }
    return data
  },

  getMany: async (assetKeys = []) => {
    if (!supabase) throw new Error('Supabase is not configured')
    if (!assetKeys.length) return []
    const { data, error } = await supabase
      .from('ui_assets')
      .select('asset_key, image_url')
      .in('asset_key', assetKeys)
    if (error) {
      if (isMissingUiAssetsTableError(error)) {
        warnMissingUiAssetsTable()
        return []
      }
      throw error
    }
    return data ?? []
  },
}
