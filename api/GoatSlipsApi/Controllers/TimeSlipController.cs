using GoatSlipsApi.Attributes;
using GoatSlipsApi.Exceptions;
using GoatSlipsApi.Helpers;
using GoatSlipsApi.Models;
using GoatSlipsApi.Models.Database;
using GoatSlipsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoatSlipsApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public sealed class TimeSlipController : ControllerBase
    {

        private readonly ILogger<TimeSlipController> _logger;
        private readonly ITimeSlipService _timeSlipService;
        private readonly IUserService _userService;

        public TimeSlipController(
            ILogger<TimeSlipController> logger,
            ITimeSlipService timeSlipService,
            IUserService userService
        )
        {
            _logger = logger;
            _timeSlipService = timeSlipService;
            _userService = userService;
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
                if (date.DayOfWeek != DayOfWeek.Sunday)
                {
                    return BadRequest("The date provided must be a Sunday.");
                }
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
                _timeSlipService.UpdateTimeSlip(timeSlip);
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
                _timeSlipService.DeleteTimeSlip(id);
                return Ok();
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        [HttpPost("QueryTimeSlips", Name = "QueryTimeSlips")]
        public ActionResult<TimeSlip[]> QueryTimeSlips(GetTimeSlipsBody getTimeSlipsBody)
        {
            try
            {
                _userService.ValidateAccess(AccessRights.Admin, HttpContext);
                TimeSlip[] timeSlips = _timeSlipService.GetTimeSlips(
                    getTimeSlipsBody.UserIds,
                    getTimeSlipsBody.ProjectIds,
                    getTimeSlipsBody.TaskIds?.Select(t => t == -1 ? (int?)null : t).ToArray(),
                    getTimeSlipsBody.LaborCodeIds?.Select(l => l == -1 ? (int?)null : l).ToArray(),
                    getTimeSlipsBody.FromDate,
                    getTimeSlipsBody.ToDate);
                return Ok(timeSlips);
            }
            catch (InsufficientAccessException e)
            {
                return Problem(e.Message, statusCode: InsufficientAccessException.StatusCode);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}