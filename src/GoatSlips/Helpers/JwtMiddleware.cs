using GoatSlips.DAL;
using GoatSlips.Services;

namespace GoatSlips.Helpers
{
    public sealed class JwtMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, IUserRepository userRepository, IJwtUtils jwtUtils)
        {
            int? userId = jwtUtils.GetUserIdFromContext(context);
            if (userId != null)
            {
                // attach user to context on successful jwt validation
                context.Items["User"] = userRepository.GetById(userId.Value);
            }

            await _next(context);
        }
    }
}
