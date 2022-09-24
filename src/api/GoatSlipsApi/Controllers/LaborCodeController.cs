﻿using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;

namespace GoatSlipsApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LaborCodeController : ControllerBase
    {

        private readonly ILogger<LaborCodeController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;

        public LaborCodeController(ILogger<LaborCodeController> logger, IGoatSlipsContext goatSlipsContext)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
        }

        [HttpGet(Name = "GetLaborCodes")]
        public IEnumerable<LaborCode> Get()
        {
            DbSet<LaborCode>? laborCodes = _goatSlipsContext.LaborCodes;
            if (laborCodes == null)
            {
                var message = "No labor codes found!";
                _logger.LogError(message);
                throw new Exception(message);
            }
            return laborCodes;
        }
    }
}