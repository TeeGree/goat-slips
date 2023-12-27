namespace GoatSlips.Models.Api.AzureDevOps
{
    public sealed class Resource
    {
        public long WorkItemId { get; set; }

        public Repository? Repository { get; set; }
        public int PullRequestId { set; get; } = 0;
        public string? Status { set; get; }
        public Author? CreatedBy { get; set; }
        public Author? PushedBy { set; get; }
        public string? SourceRefName { set; get; }
        public string? TargetRefName { set; get; }
        public string? MergeStatus { set; get; }
        public Guid MergeId { set; get; }
        public DateTime CreationDate { get; set; }
        public DateTime ClosedDate { get; set; }
        public string? Title { set; get; }
        public string? Description { set; get; }
        public List<RefUpdate>? RefUpdates { set; get; }
        public Uri? Url { get; set; }
        public DateTime Date { get; set; }
        public long PushId { get; set; } = 0;
        public Dictionary<string, ChangedField> Fields { get; set; } = new Dictionary<string, ChangedField>();
        public Revision? Revision { set; get; }
    }
}
