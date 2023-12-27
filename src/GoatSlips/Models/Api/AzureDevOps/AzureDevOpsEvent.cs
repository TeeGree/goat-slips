using Org.BouncyCastle.Asn1.Cmp;

namespace GoatSlips.Models.Api.AzureDevOps
{
    public sealed class AzureDevOpsEvent
    {
        public Guid SubscriptionId { get; set; }
        public int NotificationId { get; set; }
        public string? PublisherId { get; set; }
        public string? EventType { get; set; }
        public Guid Id { get; set; }
        public Resource? Resource { set; get; }

        public DateTime CreateDate { set; get; }
    }
}
