import { FastifyRequest, FastifyReply } from "fastify"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ service_role key only on backend
)

declare module "fastify" {
  interface FastifyRequest {
    user?: any
  }
}

const authHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    reply.code(401).send({ error: "Missing Authorization header" })
    return
  }

  const token = authHeader.replace("Bearer ", "").trim()

  // Verify the token with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    reply.code(401).send({ error: "Invalid or expired token" })
    return
  }

  // Attach user to request
  request.user = user
}

export default authHandler
