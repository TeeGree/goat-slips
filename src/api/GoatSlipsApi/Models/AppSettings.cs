namespace GoatSlipsApi.Models
{
    public interface IAppSettings
    {
        string ConnectionString { get; }
    }
    public class AppSettings : IAppSettings
    {
        public string ConnectionString { get; }

        public AppSettings(string connectionString)
        {
            ConnectionString = connectionString;
        }
    }
}
