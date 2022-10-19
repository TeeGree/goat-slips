﻿using System.ComponentModel.DataAnnotations.Schema;

namespace GoatSlipsApi.Models.Database
{
    public sealed class Project
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
