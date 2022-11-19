namespace GoatSlips.Exceptions
{
    public sealed class DuplicateFavoriteException : Exception
    {
        public static int StatusCode = 557;
        public DuplicateFavoriteException(string message) : base(message) { }
    }
}
