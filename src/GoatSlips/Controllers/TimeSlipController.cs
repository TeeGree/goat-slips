﻿using GoatSlips.Attributes;
using GoatSlips.Models.Api;
using GoatSlips.Models.Database;
using GoatSlips.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlips.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class TimeSlipController : ControllerBase
    {
        private readonly ILogger<TimeSlipController> _logger;
        private readonly ITimeSlipService _timeSlipService;

        public TimeSlipController(
            ILogger<TimeSlipController> logger,
            ITimeSlipService timeSlipService
        )
        {
            _logger = logger;
            _timeSlipService = timeSlipService;
        }

        [HttpGet(Name = "GetTimeSlips")]
        public ActionResult<IEnumerable<TimeSlip>> Get()
        {
            try
            {
                IEnumerable<TimeSlip> timeSlips = _timeSlipService.GetAllTimeSlips();
                return Ok(timeSlips);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpGet("WeekOfTimeSlipsForCurrentUser/{date}", Name = "GetWeekOfTimeSlipsForCurrentUser")]
        public ActionResult<TimeSlip[]> GetWeekOfTimeSlipsForCurrentUser(DateTime date)
        {
            try
            {
                TimeSlip[] timeSlips = _timeSlipService.GetWeekOfTimeSlipsForCurrentUser(date, HttpContext);
                return Ok(timeSlips);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("AddTimeSlip", Name = "AddTimeSlip")]
        public IActionResult AddTimeSlip(AddTimeSlipBody timeSlip)
        {
            try
            {
                _timeSlipService.AddTimeSlip(timeSlip, HttpContext);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("UpdateTimeSlip", Name = "UpdateTimeSlip")]
        public IActionResult UpdateTimeSlip(UpdateTimeSlipBody timeSlip)
        {
            try
            {
                User? user = HttpContext.Items["User"] as User;
                if (user == null)
                {
                    throw new Exception("No user logged in!");
                }
                _timeSlipService.UpdateTimeSlip(timeSlip, user.Id);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("DeleteTimeSlip/{id}", Name = "DeleteTimeSlip")]
        public IActionResult DeleteTimeSlip(int id)
        {
            try
            {
                User? user = HttpContext.Items["User"] as User;
                if (user == null)
                {
                    throw new Exception("No user logged in!");
                }
                _timeSlipService.DeleteTimeSlip(id, user.Id);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}