namespace GoatSlips.Models.Api.AzureDevOps
{
    public sealed class RefUpdate
    {
        public string? Name { get; set; }
        public string? OldObjectId { get; set; }
        public string? NewObjectId { get; set; }
    }
}
