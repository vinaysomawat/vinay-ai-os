import SettingsView from '@/features/settings/components/SettingsView'
import { getReminders, getAiBudgetStatus, getSystemHealth } from '@/features/settings/actions'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const [{ data: { user } }, reminders, aiBudget, systemHealth] = await Promise.all([
    supabase.auth.getUser(),
    getReminders(),
    getAiBudgetStatus(),
    getSystemHealth(),
  ])

  return <SettingsView email={user?.email ?? null} initialReminders={reminders} aiBudget={aiBudget} systemHealth={systemHealth} />
}
