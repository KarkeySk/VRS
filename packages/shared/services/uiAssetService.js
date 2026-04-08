import { supabase } from '../lib/supabase'

export const uiAssetService = {
  getByKey: async (assetKey) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { data, error } = await supabase
      .from('ui_assets')
      .select('asset_key, image_url')
      .eq('asset_key', assetKey)
      .maybeSingle()
    if (error) throw error
    return data
  },

  getMany: async (assetKeys = []) => {
    if (!supabase) throw new Error('Supabase is not configured')
    if (!assetKeys.length) return []
    const { data, error } = await supabase
      .from('ui_assets')
      .select('asset_key, image_url')
      .in('asset_key', assetKeys)
    if (error) throw error
    return data ?? []
  },
}
