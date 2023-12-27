using GoatSlips.Models.Database;

namespace GoatSlips.Models.Api.AzureDevOps
{
    public sealed class Repository
    {
        public Guid Id { get; set; }
        public string? Name { set; get; }
        public Uri? Url { set; get; }
        public string? DefaultBranch { set; get; }
        public Project? Project { get; set; }
    }
}
