﻿using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlips.Models.Database
{
    public sealed class ProjectTask
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int TaskId { get; set; }
    }
}
