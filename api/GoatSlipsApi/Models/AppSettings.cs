namespace GoatSlipsApi.Models
{
    public interface IAppSettings
    {
        string ConnectionString { get; }
        string Secret { get; }
    }
    public sealed class AppSettings : IAppSettings
    {
        public string ConnectionString { get; }
        public string Secret { get; }

        public AppSettings(string connectionString, string secret)
        {
            ConnectionString = connectionString;
            Secret = secret;
        }
    }
}
