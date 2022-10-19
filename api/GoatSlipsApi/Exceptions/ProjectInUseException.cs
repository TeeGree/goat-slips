namespace GoatSlipsApi.Exceptions
{
    public class ProjectInUseException : Exception
    {
        public static int StatusCode = 555;
        public ProjectInUseException(string message) : base(message) { }
    }
}
