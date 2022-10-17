using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace GoatSlipsApi.Services
{
    public interface ISecretService
    {
        string Hash(string password);
        bool Verify(string password, string hash);
        bool IsPasswordValid(string password);
    }
    public class SecretService : ISecretService
    {
        private const int _saltSize = 16; // 128 bits
        private const int _keySize = 32; // 256 bits
        private const int _iterations = 100000;
        private static readonly HashAlgorithmName _algorithm = HashAlgorithmName.SHA256;

        private const char segmentDelimiter = ':';

        public string Hash(string secret)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(_saltSize);
            byte[] key = Rfc2898DeriveBytes.Pbkdf2(
                secret,
                salt,
                _iterations,
                _algorithm,
                _keySize
            );
            return string.Join(
                segmentDelimiter,
                Convert.ToHexString(key),
                Convert.ToHexString(salt),
                _iterations,
                _algorithm
            );
        }

        public bool Verify(string secret, string hash)
        {
            string[] segments = hash.Split(segmentDelimiter);
            byte[] key = Convert.FromHexString(segments[0]);
            byte[] salt = Convert.FromHexString(segments[1]);
            int iterations = int.Parse(segments[2]);
            var algorithm = new HashAlgorithmName(segments[3]);
            byte[] inputSecretKey = Rfc2898DeriveBytes.Pbkdf2(
                secret,
                salt,
                iterations,
                algorithm,
                key.Length
            );
            return key.SequenceEqual(inputSecretKey);
        }

        public bool IsPasswordValid(string password)
        {
            string pattern = @"^(?=.*[0-9].*)(?=.*[a-zA-Z].*).{8,}$";
            var regex = new Regex(pattern);
            return regex.IsMatch(password);
        }
    }
}
