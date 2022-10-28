using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlipsApi.Models.Database
{
    public sealed class LaborCode
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
