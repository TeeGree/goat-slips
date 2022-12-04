using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlips.Models.Database.Query
{
    public sealed class Query
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int OwnerUserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
