namespace GoatSlips.Models.Api
{
    public class UpdateProjectBody
    {
        public int ProjectId { get; set; }
        public HashSet<int> AllowedTaskIds { get; set; } = new HashSet<int>();
        public decimal Rate { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? BusinessName { get; set; }
        public string? Email { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public int? Zip { get; set; }
        public int? ZipExtension { get; set; }
        public DateTime? LockDate { get; set; }
    }
}
