using GoatSlips.DAL;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Task = System.Threading.Tasks.Task;

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
            string? apiKey = context.Request.Headers["api-key"];

            User? user = null;

            if (apiKey != null)
            {
                user = userRepository.GetUserForApiKey(apiKey);
            }

            if (user == null)
            {
                int? userId = jwtUtils.GetUserIdFromCookie(context);
                if (userId != null)
                {
                    // attach user to context on successful jwt validation
                    user = userRepository.GetById(userId.Value);
                }
            }

            if (user != null)
            {
                context.Items["User"] = user;
            }

            await _next(context);
        }
    }
}
