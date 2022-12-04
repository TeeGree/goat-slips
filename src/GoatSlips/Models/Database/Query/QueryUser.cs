using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlips.Models.Database.Query
{
    public sealed class QueryUser
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int QueryId { get; set; }
        public int UserId { get; set; }
    }
}
