using GoatSlipsApi.Helpers;

namespace GoatSlipsTest
{
    public sealed class PasswordHasherTest
    {
        [Theory]
        [InlineData("")]
        [InlineData("Test")]
        [InlineData("84771627632342342")]
        [InlineData("aBc123!.")]
        public void HashShouldNotMatchForSamePassword(string password)
        {
            string hash = PasswordHasher.Hash(password);

            string newHash = PasswordHasher.Hash(password);

            Assert.NotEqual(hash, newHash);
        }

        [Theory]
        [InlineData("")]
        [InlineData("Test")]
        [InlineData("84771627632342342")]
        [InlineData("aBc123!.")]
        public void VerifyShouldBeTrueForSamePassword(string password)
        {
            string hash = PasswordHasher.Hash(password);

            Assert.True(PasswordHasher.Verify(password, hash));
        }

        [Theory]
        [InlineData("")]
        [InlineData("Test")]
        [InlineData("84771627632342342")]
        [InlineData("aBc123!.")]
        public void VerifyShouldBeFalseForDifferentPassword(string password)
        {
            string hash = PasswordHasher.Hash(password);

            Assert.False(PasswordHasher.Verify($"{password} ", hash));
        }
    }
}