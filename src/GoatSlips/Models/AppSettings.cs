namespace GoatSlips.Models
{
    public interface IAppSettings
    {
        string ConnectionString { get; }
        string Secret { get; }
    }
    public sealed class AppSettings : IAppSettings
    {
        public string ConnectionString { get; }
        public string Secret { get; } = "GoatSlipsJwtTokenSecretString";

        public AppSettings(string connectionString)
        {
            ConnectionString = connectionString;
        }
    }
}
