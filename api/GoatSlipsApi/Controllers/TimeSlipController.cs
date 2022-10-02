using GoatSlipsApi.Attributes;
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

        [HttpGet("TimeSlipsForCurrentUser", Name = "GetTimeSlipsForCurrentUser")]
        public ActionResult<TimeSlip[]> GetTimeSlipsForCurrentUser()
        {
            try
            {
                TimeSlip[] timeSlips = _timeSlipService.GetTimeSlipsForCurrentUser(HttpContext);
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
    }
}