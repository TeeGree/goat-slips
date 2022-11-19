namespace GoatSlips.Models.Api
{
    public sealed class AddFavoriteTimeSlipBody
    {
        public string Name { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public int? TaskId { get; set; }
        public int? LaborCodeId { get; set; }
    }
}
