﻿using GoatSlipsApi.Attributes;
using GoatSlipsApi.DAL;
using GoatSlipsApi.Models.Database;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;

namespace GoatSlipsApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class TimeSlipController : ControllerBase
    {

        private readonly ILogger<TimeSlipController> _logger;
        private readonly IGoatSlipsContext _goatSlipsContext;

        public TimeSlipController(ILogger<TimeSlipController> logger, IGoatSlipsContext goatSlipsContext)
        {
            _logger = logger;
            _goatSlipsContext = goatSlipsContext;
        }

        [HttpGet(Name = "GetTimeSlips")]
        public ActionResult<IEnumerable<TimeSlip>> Get()
        {
            DbSet<TimeSlip>? timeSlips = _goatSlipsContext.TimeSlips;
            if (timeSlips == null)
            {
                var message = "No time slips found!";
                _logger.LogError(message);
                return Problem(message);
            }
            return timeSlips;
        }
    }
}