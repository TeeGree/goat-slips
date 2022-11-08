namespace GoatSlipsApi.Exceptions
{
    public sealed class InsufficientAccessException : Exception
    {
        public static int StatusCode = 556;
        public InsufficientAccessException(string message) : base(message) { }
    }
}
