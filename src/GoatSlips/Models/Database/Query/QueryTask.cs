using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlips.Models.Database.Query
{
    public sealed class QueryTask
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int QueryId { get; set; }
        public int TaskId { get; set; }
    }
}
