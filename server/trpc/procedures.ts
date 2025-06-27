import { rule, shield } from 'trpc-shield'
import { publicProcedure, t } from './trpc'
import type { Context } from '~/server/trpc/context'

const isAuth = rule<Context>()(ctx => !!ctx.session?.user)
const permissions = shield<Context>({}, { fallbackRule: isAuth })

export const shieldedProcedure = publicProcedure.use(t.middleware(permissions))
