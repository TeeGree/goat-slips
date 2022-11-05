using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlipsApi.Models.Database
{
    public sealed class AccessRight
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
