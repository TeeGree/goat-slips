namespace GoatSlipsApi.Exceptions
{
    public class CodeInUseException : Exception
    {
        public static int StatusCode = 555;
        public CodeInUseException(string message) : base(message) { }
    }
}
