import { createClient } from './server'
import { prisma } from '@/lib/prisma'
import { resolveEffectiveRole, resolvePermissions } from '@/lib/permissions'

export async function auth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch the Prisma user using the supabaseAuthId
  const prismaUser = await prisma.user.findUnique({
    where: { supabaseAuthId: user.id }
  })

  const rawRole = prismaUser?.role || user.user_metadata?.role || 'CUSTOMER'
  const effectiveRole = resolveEffectiveRole(rawRole, user.email)
  const rawPermissions = prismaUser?.permissions || user.user_metadata?.permissions || []
  const resolvedPermissions = resolvePermissions(effectiveRole, rawPermissions)

  return {
    user: {
      id: prismaUser?.id || user.id, // Fallback to supabase id if not found yet
      email: user.email,
      name: user.user_metadata?.name || prismaUser?.name || '',
      role: effectiveRole,
      permissions: resolvedPermissions,
      supabaseAuthId: user.id
    }
  }
}
