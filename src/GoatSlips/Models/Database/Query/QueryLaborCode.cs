using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlips.Models.Database.Query
{
    public sealed class QueryLaborCode
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int QueryId { get; set; }
        public int LaborCodeId { get; set; }
    }
}
