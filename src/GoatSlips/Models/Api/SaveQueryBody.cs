﻿namespace GoatSlips.Models.Api
{
    public sealed class SaveQueryBody
    {
        public string Name { get; set; } = string.Empty;
        public int[]? UserIds { get; set; }
        public int[]? ProjectIds { get; set; }
        public int[]? TaskIds { get; set; }
        public int[]? LaborCodeIds { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? DescriptionSearchText { get; set; }
    }
}
