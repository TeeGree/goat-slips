namespace GoatSlips.Models
{
    public interface IAppSettings
    {
        string ConnectionString { get; }
        string Secret { get; }
        string SmtpHost { get; }
        int SmtpPort { get; }
        string SenderName { get; }
        string SenderEmailAddress { get; }
        string SenderPassword { get; }
    }
    public sealed class AppSettings : IAppSettings
    {
        public string ConnectionString { get; }
        public string Secret { get; } = "GoatSlipsJwtTokenSecretString";

        public string SmtpHost { get; }
        public int SmtpPort { get; }
        public string SenderName { get; }
        public string SenderEmailAddress { get; }
        public string SenderPassword { get; }

        public AppSettings(string connectionString, string smtpHost, int smtpPort, string senderName, string senderEmailAddress, string senderPassword)
        {
            ConnectionString = connectionString;
            SmtpHost = smtpHost;
            SmtpPort = smtpPort;
            SenderName = senderName;
            SenderEmailAddress = senderEmailAddress;
            SenderPassword = senderPassword;
        }
    }
}
