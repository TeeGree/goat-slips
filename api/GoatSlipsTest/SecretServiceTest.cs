using GoatSlipsApi.Helpers;
using GoatSlipsApi.Services;

namespace GoatSlipsTest
{
    public sealed class SecretServiceTest
    {
        [Theory]
        [InlineData("")]
        [InlineData("Test")]
        [InlineData("84771627632342342")]
        [InlineData("aBc123!.")]
        public void HashShouldNotMatchForSamePassword(string password)
        {
            var secretService = new SecretService();
            string hash = secretService.Hash(password);

            string newHash = secretService.Hash(password);

            Assert.NotEqual(hash, newHash);
        }

        [Theory]
        [InlineData("")]
        [InlineData("Test")]
        [InlineData("84771627632342342")]
        [InlineData("aBc123!.")]
        public void VerifyShouldBeTrueForSamePassword(string password)
        {
            var secretService = new SecretService();
            string hash = secretService.Hash(password);

            Assert.True(secretService.Verify(password, hash));
        }

        [Theory]
        [InlineData("")]
        [InlineData("Test")]
        [InlineData("84771627632342342")]
        [InlineData("aBc123!.")]
        public void VerifyShouldBeFalseForDifferentPassword(string password)
        {
            var secretService = new SecretService();
            string hash = secretService.Hash(password);

            Assert.False(secretService.Verify($"{password} ", hash));
        }
    }
}