import { supabaseAdmin } from '../src/lib/supabase/admin'

async function cleanDuplicates() {
  console.log('Starting cleanup of duplicate clients...')

  // 1. Find all profile_ids that have multiple clients
  const { data: clients, error: errClients } = await supabaseAdmin
    .from('clients')
    .select('id, profile_id, created_at')
    .not('profile_id', 'is', null)

  if (errClients) {
    console.error('Error fetching clients:', errClients)
    return
  }

  // Group by profile_id
  const groups: Record<string, typeof clients> = {}
  for (const client of clients) {
    if (!groups[client.profile_id!]) {
      groups[client.profile_id!] = []
    }
    groups[client.profile_id!].push(client)
  }

  // Find duplicates
  for (const [profileId, group] of Object.entries(groups)) {
    if (group.length > 1) {
      console.log(`Profile ${profileId} has ${group.length} client rows.`)
      
      // Sort by created_at ascending (keep the oldest one as the primary)
      group.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      const primaryClient = group[0]
      const duplicateClients = group.slice(1)

      console.log(`Primary client: ${primaryClient.id}`)
      console.log(`Duplicates to remove:`, duplicateClients.map(c => c.id))

      // 2. Update appointments to use primaryClient.id
      for (const duplicate of duplicateClients) {
        const { data: updatedAppts, error: errUpdateAppt } = await supabaseAdmin
          .from('appointments')
          .update({ client_id: primaryClient.id })
          .eq('client_id', duplicate.id)
          .select('id')

        if (errUpdateAppt) {
          console.error(`Failed to update appointments for duplicate ${duplicate.id}:`, errUpdateAppt)
        } else {
          console.log(`Updated ${updatedAppts?.length || 0} appointments from ${duplicate.id} to ${primaryClient.id}`)
        }

        // 3. Delete the duplicate client row
        const { error: errDel } = await supabaseAdmin
          .from('clients')
          .delete()
          .eq('id', duplicate.id)

        if (errDel) {
          console.error(`Failed to delete duplicate client ${duplicate.id}:`, errDel)
        } else {
          console.log(`Deleted duplicate client ${duplicate.id}`)
        }
      }
    }
  }

  console.log('Cleanup finished.')
}

cleanDuplicates()
